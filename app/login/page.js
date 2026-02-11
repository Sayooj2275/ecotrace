'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Leaf, Lock, User, ArrowLeft } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert('Login Failed: ' + error.message)
      setLoading(false)
    } else {
      // Check role to redirect correctly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
      
      if (profile?.role === 'handler') {
        router.push('/handler/dashboard')
      } else {
        router.push('/dashboard')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* 🟢 NEW: Back Button */}
      <div className="w-full max-w-md mb-6">
        <Link href="/" className="flex items-center text-gray-500 hover:text-green-700 transition font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
        </Link>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">EcoTrace</h1>
          <p className="text-gray-500 text-sm mt-1">Sustainability Compliance Platform</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 transition shadow-md disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <Link href="/signup" className="text-green-700 font-bold hover:underline">Create an Institution Profile</Link>
        </div>

      </div>
    </div>
  )
}