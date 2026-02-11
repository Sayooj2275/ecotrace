'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Truck, AlertCircle, FileText } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const WASTE_CATEGORIES = [
  { id: 'Plastic', label: 'Plastic', emoji: '🥤' },
  { id: 'Paper', label: 'Paper', emoji: '📄' },
  { id: 'E-Waste', label: 'E-Waste', emoji: '🔌' },
  { id: 'Bio', label: 'Bio / Organic', emoji: '🍏' },
  { id: 'Metal', label: 'Metal', emoji: '⚙️' },
  { id: 'Glass', label: 'Glass', emoji: '🍾' },
  { id: 'Textile', label: 'Textile', emoji: '👕' },
  { id: 'Hazardous', label: 'Hazardous', emoji: '⚠️' }
]

export default function CreateRequest() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    type: 'Plastic',
    weight: '',
    description: '' // 🟢 Added Description State
  })

  // Auto-Generate 4-Digit OTP
  const [otp] = useState(Math.floor(1000 + Math.random() * 9000).toString())

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // 1. Create Activity
    const expiryTime = new Date(Date.now() + 60 * 60 * 1000).toISOString()

    const { data: activity, error: actError } = await supabase
      .from('activities')
      .insert([{
        institution_id: user.id,
        type: formData.type,
        weight: formData.weight,
        description: formData.description, // 🟢 Save Description
        status: 'open',
        expires_at: expiryTime,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (actError) {
      alert('Error: ' + actError.message)
      setLoading(false)
      return
    }

    // 2. Save OTP
    const { error: otpError } = await supabase
      .from('waste_logs')
      .insert([{
        activity_id: activity.id,
        otp_code: otp,
        verified: false
      }])

    if (!otpError) {
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl border border-gray-100 animate-in zoom-in-95">
        <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-3 rounded-full"><Truck className="h-6 w-6 text-green-700" /></div>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Request Pickup</h1>
                <p className="text-sm text-gray-500">Handlers nearby will be notified instantly.</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. Category */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-3">Select Waste Category</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {WASTE_CATEGORIES.map(cat => (
                    <button 
                        key={cat.id} type="button"
                        onClick={() => setFormData({...formData, type: cat.id})}
                        className={`p-4 rounded-xl font-bold text-sm border-2 transition flex flex-col items-center gap-2 ${
                            formData.type === cat.id 
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-sm' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-2xl">{cat.emoji}</span>
                        {cat.label}
                    </button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 2. Weight */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Weight</label>
                <div className="relative">
                    <input 
                    type="number" required
                    className="w-full p-4 pl-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none font-mono text-lg"
                    placeholder="e.g. 15"
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    />
                    <span className="absolute right-4 top-4 text-gray-400 font-bold">KG</span>
                </div>
            </div>

            {/* 3. Description (New) */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description (Optional)</label>
                <div className="relative">
                    <textarea 
                    rows={1}
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    placeholder="e.g. Bottles, PC parts..."
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                    <FileText className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                </div>
            </div>
          </div>

          {/* Notice */}
          <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-sm text-blue-700 border border-blue-100">
             <AlertCircle className="h-5 w-5 shrink-0" />
             <p>This request will be broadcast to handlers in your area. It will expire automatically in 60 minutes if not accepted.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition shadow-lg shadow-green-200 disabled:opacity-50 transform active:scale-[0.98]"
          >
            {loading ? 'Broadcasting...' : 'Broadcast Request'}
          </button>
        </form>
      </div>
    </div>
  )
}