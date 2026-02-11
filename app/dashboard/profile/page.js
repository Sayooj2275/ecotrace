'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Building, Phone, MapPin } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  
  const [formData, setFormData] = useState({
    org_name: '',
    phone: '',
    city: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    const { data, error } = await supabase
      .from('profiles')
      .select('org_name, phone, city')
      .eq('id', user.id)
      .single()

    if (data) {
        setFormData({
            org_name: data.org_name || '',
            phone: data.phone || '',
            city: data.city || ''
        })
    }
    setLoading(false)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setUpdating(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('profiles')
        .update({
            org_name: formData.org_name,
            phone: formData.phone,
            city: formData.city
        })
        .eq('id', user.id)

    if (error) {
        alert("Error updating profile: " + error.message)
    } else {
        alert("✅ Profile Updated Successfully!")
        router.refresh() // Refresh data
    }
    setUpdating(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto">
        <button onClick={() => router.back()} className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-green-700 p-6 text-white">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    <Building className="h-6 w-6" /> Edit Organization Details
                </h1>
                <p className="text-green-100 mt-1 opacity-90">Update your institution's public profile</p>
            </div>

            <div className="p-8">
                {loading ? (
                    <p className="text-center text-gray-400">Loading your details...</p>
                ) : (
                    <form onSubmit={handleUpdate} className="space-y-6">
                        
                        {/* Org Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Building className="h-4 w-4 text-green-600" /> Organization Name
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white"
                                value={formData.org_name}
                                onChange={(e) => setFormData({...formData, org_name: e.target.value})}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Phone className="h-4 w-4 text-green-600" /> Contact Phone
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-green-600" /> City / District
                            </label>
                            <input 
                                type="text" 
                                className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition bg-gray-50 focus:bg-white"
                                value={formData.city}
                                onChange={(e) => setFormData({...formData, city: e.target.value})}
                            />
                        </div>

                        {/* Save Button */}
                        <button 
                            disabled={updating}
                            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-black transition flex items-center justify-center gap-2 shadow-md mt-4"
                        >
                            {updating ? 'Saving...' : (
                                <>
                                    <Save className="h-5 w-5" /> Save Changes
                                </>
                            )}
                        </button>

                    </form>
                )}
            </div>
        </div>
      </div>
    </div>
  )
}