'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Building2, Truck } from 'lucide-react'

// Connect to Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('institution')
  const [orgName, setOrgName] = useState('')
  const [city, setCity] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // 1. Create User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    if (authData.user) {
      // 2. Create Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            role: role,
            org_name: orgName,
            city: city,
          }
        ])

      if (profileError) {
        setError(profileError.message)
        setLoading(false)
      } else {
        alert("Account created successfully! Please log in.")
        router.push('/login')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-xl border border-gray-100">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Sign Up</h2>
          <p className="mt-2 text-sm text-gray-600">Create your EcoTrace profile</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setRole('institution')}
              className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${role === 'institution' ? 'border-green-500 bg-green-50 ring-2 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}
            >
              <Building2 className={`h-8 w-8 mb-2 ${role === 'institution' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${role === 'institution' ? 'text-green-700' : 'text-gray-500'}`}>Institution</span>
            </div>

            <div 
              onClick={() => setRole('handler')}
              className={`cursor-pointer border rounded-lg p-4 flex flex-col items-center justify-center transition-all ${role === 'handler' ? 'border-green-500 bg-green-50 ring-2 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}
            >
              <Truck className={`h-8 w-8 mb-2 ${role === 'handler' ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={`text-sm font-medium ${role === 'handler' ? 'text-green-700' : 'text-gray-500'}`}>Waste Handler</span>
            </div>
          </div>

          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {role === 'institution' ? 'Institution Name' : 'Handler Company Name'}
              </label>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder={role === 'institution' ? "e.g. Springfield University" : "e.g. City Recyclers Ltd"}
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 text-gray-900 bg-white focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                placeholder="e.g. Kochi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}