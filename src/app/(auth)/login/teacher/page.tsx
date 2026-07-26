import Link from 'next/link'
import { login } from '../actions'

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-indigo-50 to-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Portal</h1>
          <p className="text-sm text-gray-500 mt-1">ClassRoom Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {params.error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
              {decodeURIComponent(params.error)}
            </div>
          )}

          <form action={login} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="username"
                name="username"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="teacher@school.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Parent?{' '}
          <Link href="/login/parent" className="text-indigo-500 hover:underline">
            Go to parent login
          </Link>
        </p>
      </div>
    </div>
  )
}
