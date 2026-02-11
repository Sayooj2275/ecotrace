'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Initialize Supabase Client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Signup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [role, setRole] = useState('institution') // Default to institution
  const [formData, setFormData] = useState({
    org_name: '',
    phone: '',
    city: '',
    email: '',
    password: ''
  })

  async function handleSignup(e) {
    e.preventDefault()
    setLoading(true)

    // 1. Sign up and pass the SELECTED ROLE
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          org_name: formData.org_name,
          city: formData.city,
          phone: formData.phone,
          role: role // <--- Sending the selected role (institution OR handler)
        }
      }
    })

    if (error) {
      console.error("Signup Error:", error)
      alert('Signup Error: ' + error.message)
      setLoading(false)
      return
    }

    // 2. Success
    alert('Account Created Successfully! Please Log In.')
    await supabase.auth.signOut() 
    router.push('/login')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-100">
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Join EcoTrace</h1>
          <p className="text-gray-500">Create your account</p>
        </div>

        {/* --- ROLE SELECTOR --- */}
        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setRole('institution')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              role === 'institution' 
                ? 'bg-white text-green-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🏫 Institution
          </button>
          <button
            type="button"
            onClick={() => setRole('handler')}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
              role === 'handler' 
                ? 'bg-white text-blue-700 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🚛 Waste Handler
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          
          {/* Dynamic Label based on Role */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              {role === 'institution' ? 'Organization Name' : 'Agency / Handler Name'}
            </label>
            <input 
              required
              type="text"
              placeholder={role === 'institution' ? "e.g. Green Valley School" : "e.g. City Waste Soltuions"}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              value={formData.org_name}
              onChange={(e) => setFormData({...formData, org_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
            <input 
              required
              type="tel"
              placeholder="e.g. 9876543210"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">City / Location</label>
            <input 
              required
              type="text"
              placeholder="e.g. Kochi"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              required
              type="email"
              placeholder="email@example.com"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
            <input 
              required
              type="password"
              placeholder="••••••••"
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <button 
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition transform active:scale-95 shadow-md flex justify-center items-center ${
              role === 'institution' ? 'bg-green-700 hover:bg-green-800' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">Creating Account...</span>
            ) : (
              <span>Sign Up as {role === 'institution' ? 'Institution' : 'Handler'} →</span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <Link href="/login" className="text-green-700 font-bold hover:underline">Log in</Link>
        </div>

      </div>
    </div>
  )
}
