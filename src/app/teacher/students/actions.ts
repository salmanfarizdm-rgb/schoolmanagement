'use server'

import { createServiceClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Database } from '@/lib/supabase/database.types'

type StudentStatus = Database['public']['Enums']['student_status']

export async function updateParentContact(formData: FormData) {
  const supabase = await createServiceClient()
  const parentId = formData.get('parent_id') as string
  const whatsapp = (formData.get('whatsapp_number') as string).trim()
  const secondary = (formData.get('secondary_contact') as string | null)?.trim() ?? null

  const { error } = await supabase
    .from('parents')
    .update({ whatsapp_number: whatsapp || null, secondary_contact: secondary || null })
    .eq('id', parentId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/students')
  return { error: null }
}

export async function updateStudentStatus(formData: FormData) {
  const supabase = await createServiceClient()
  const studentId = formData.get('student_id') as string
  const status = formData.get('status') as StudentStatus

  const { error } = await supabase
    .from('students')
    .update({ status })
    .eq('id', studentId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/students')
  return { error: null }
}

export async function importStudentsCSV(formData: FormData) {
  const supabase = await createServiceClient()
  const file = formData.get('csv') as File
  const text = await file.text()
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)

  // Skip header if present
  const dataLines = lines[0]?.toLowerCase().includes('admission') ? lines.slice(1) : lines

  const errors: string[] = []
  let created = 0

  for (const line of dataLines) {
    const [admissionNo, name, gender] = line.split(',').map(c => c.trim())
    if (!admissionNo || !name) continue

    const normalGender = gender?.toUpperCase() === 'M' ? 'M'
      : gender?.toUpperCase() === 'F' ? 'F'
      : 'Other'

    // Upsert student
    const { error: sErr } = await supabase
      .from('students')
      .upsert({ id: admissionNo, name, gender: normalGender }, { onConflict: 'id', ignoreDuplicates: true })

    if (sErr) { errors.push(`${admissionNo}: ${sErr.message}`); continue }

    // Check if parent auth user already exists
    const email = `${admissionNo}@school.local`
    const { data: existing } = await supabase.auth.admin.listUsers()
    const alreadyExists = existing?.users?.some(u => u.email === email)

    if (!alreadyExists) {
      const tempPassword = Math.random().toString(36).slice(2, 10) + 'Aa1!'
      const { data: authUser, error: aErr } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { role: 'parent' },
      })

      if (aErr) { errors.push(`${admissionNo} auth: ${aErr.message}`); continue }

      if (authUser?.user) {
        const { error: pErr } = await supabase
          .from('parents')
          .insert({ id: authUser.user.id, student_id: admissionNo })

        if (pErr) errors.push(`${admissionNo} parent row: ${pErr.message}`)
        else created++
      }
    } else {
      created++
    }
  }

  revalidatePath('/teacher/students')
  return { created, errors }
}

export async function resetParentPassword(formData: FormData) {
  const supabase = await createServiceClient()
  const parentId = formData.get('parent_id') as string
  const newPassword = formData.get('new_password') as string

  const { error } = await supabase.auth.admin.updateUserById(parentId, {
    password: newPassword,
  })

  if (error) return { error: error.message }
  return { error: null }
}

export async function updateStudentIdentity(formData: FormData) {
  const supabase = await createServiceClient()
  const { data: { user } } = await supabase.auth.admin.listUsers()
    .then(() => supabase.auth.getUser())
  const changedBy = user?.id ?? null

  const studentId = formData.get('student_id') as string
  const newName = (formData.get('name') as string).trim()
  const newGender = formData.get('gender') as string
  const newId = (formData.get('new_admission_no') as string).trim()

  // Fetch current values for audit log
  const { data: current } = await supabase
    .from('students')
    .select('name, gender, id')
    .eq('id', studentId)
    .single()

  if (!current) return { error: 'Student not found.' }

  const logs: { student_id: string; field: string; old_value: string | null; new_value: string | null; changed_by: string | null }[] = []

  if (current.name !== newName) logs.push({ student_id: studentId, field: 'name', old_value: current.name, new_value: newName, changed_by: changedBy })
  if (current.gender !== newGender) logs.push({ student_id: studentId, field: 'gender', old_value: current.gender, new_value: newGender, changed_by: changedBy })
  if (newId && newId !== studentId) logs.push({ student_id: studentId, field: 'admission_no', old_value: studentId, new_value: newId, changed_by: changedBy })

  // Update student — admission number change uses ON UPDATE CASCADE
  const updatePayload: { name: string; gender: string; id?: string } = { name: newName, gender: newGender }
  if (newId && newId !== studentId) updatePayload.id = newId

  const { error } = await supabase
    .from('students')
    .update(updatePayload)
    .eq('id', studentId)

  if (error) return { error: error.message }

  // Write audit logs (if any changed fields)
  if (logs.length > 0) {
    // Use the new id as student_id in logs if admission number changed
    const finalStudentId = updatePayload.id ?? studentId
    const auditRows = logs.map(l => ({ ...l, student_id: finalStudentId }))
    await supabase.from('student_edit_log').insert(auditRows)
  }

  revalidatePath('/teacher/students')
  return { error: null, newId: updatePayload.id ?? studentId }
}
