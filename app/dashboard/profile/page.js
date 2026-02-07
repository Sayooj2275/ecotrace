'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, Phone, MapPin, Building, Save } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ProfilePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    org_name: '',
    phone: '',
    address: '',
    city: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
        setFormData({
            org_name: data.org_name || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || ''
        })
    }
  }

  async function handleUpdate() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id)

    if (error) {
        alert("Error updating profile: " + error.message)
    } else {
        alert("Profile Updated Successfully!")
    }
    setLoading(false)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Account Settings</h1>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        
        {/* Profile Header */}
        <div className="flex items-center space-x-4 mb-8 pb-8 border-b border-gray-100">
            <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-3xl font-bold">
                {formData.org_name.charAt(0) || 'U'}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">{formData.org_name || 'Your Organization'}</h2>
                <p className="text-gray-500 text-sm">Institution Account</p>
            </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Organization Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Building className="inline h-4 w-4 mr-2 text-gray-400" /> Organization Name
                </label>
                <input 
                    type="text" 
                    value={formData.org_name}
                    onChange={(e) => setFormData({...formData, org_name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>

            {/* Phone Number */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <Phone className="inline h-4 w-4 mr-2 text-gray-400" /> Contact Phone
                </label>
                <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>

            {/* City */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <MapPin className="inline h-4 w-4 mr-2 text-gray-400" /> City / District
                </label>
                <input 
                    type="text" 
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>

            {/* Address */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                    <User className="inline h-4 w-4 mr-2 text-gray-400" /> Full Address
                </label>
                <input 
                    type="text" 
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
            </div>

        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
            <button 
                onClick={handleUpdate}
                disabled={loading}
                className="bg-green-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-800 transition flex items-center shadow-md"
            >
                <Save className="h-5 w-5 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </div>

      </div>
    </div>
  )
}