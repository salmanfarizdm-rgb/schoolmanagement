import Link from 'next/link'
import { login } from '../actions'

export default async function ParentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-blue-50 to-gray-100">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Track your child&apos;s attendance</p>
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
                Admission Number
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. ADM001"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Sign in
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Teacher?{' '}
          <Link href="/login/teacher" className="text-blue-500 hover:underline">
            Go to teacher login
          </Link>
        </p>
      </div>
    </div>
  )
}
