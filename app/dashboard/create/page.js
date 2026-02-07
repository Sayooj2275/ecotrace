'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, User, Camera, CheckCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CreateActivity() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Clean Form State
  const [formData, setFormData] = useState({
    type: '', 
    description: '',
    date: new Date().toISOString().split('T')[0], // Default to today
    responsible_person: ''
  })
  const [file, setFile] = useState(null)

  const handleSubmit = async () => {
    // Check for empty fields
    if (!formData.type || !formData.description || !formData.responsible_person) {
        return alert("Please fill in all the details.")
    }
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      let evidenceUrl = null

      // 1. Upload Photo Proof (Optional)
      if (file) {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        
        // Safety check: Create bucket if missing
        await supabase.storage.createBucket('activity-evidence', { public: true }).catch(() => {})

        const { error: uploadError } = await supabase.storage
          .from('activity-evidence')
          .upload(fileName, file)

        if (uploadError) throw uploadError
        evidenceUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/activity-evidence/${fileName}`
      }

      // 2. Save Activity to Database
      const { error } = await supabase.from('activities').insert({
        institution_id: user.id,
        type: formData.type,
        description: formData.description,
        date: formData.date,
        responsible_person: formData.responsible_person,
        evidence_url: evidenceUrl,
        
        // --- CRITICAL CHANGE ---
        // Status is 'locked' (Verified) immediately. 
        // No "Pending" state because no driver is needed.
        status: 'locked' 
      })

      if (error) throw error

      alert("Activity Recorded Successfully!")
      router.push('/dashboard')

    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10">
      
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-700 p-6 flex items-center text-white">
            <button onClick={() => router.back()} className="mr-4 hover:bg-green-600 p-2 rounded-full transition">
                <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
                <h1 className="text-xl font-bold">Log General Activity</h1>
                <p className="text-green-100 text-sm">Internal audits, seminars, and initiatives</p>
            </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">

            {/* 1. Activity Heading */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Activity Heading</label>
                <input 
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="e.g. Annual Energy Audit / Zero Waste Seminar"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                />
            </div>

            {/* 2. Description */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea 
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Details about the event or initiative..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            {/* 3. Date & Person */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        <Calendar className="inline h-4 w-4 mr-1 text-gray-500"/> Date
                    </label>
                    <input 
                        type="date" 
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        <User className="inline h-4 w-4 mr-1 text-gray-500"/> Person In Charge
                    </label>
                    <input 
                        type="text" 
                        className="w-full p-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500 outline-none"
                        placeholder="e.g. Dr. A. Kumar"
                        value={formData.responsible_person}
                        onChange={(e) => setFormData({...formData, responsible_person: e.target.value})}
                    />
                </div>
            </div>

            {/* 4. Photo Proof Upload */}
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                    type="file" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setFile(e.target.files[0])}
                    accept="image/*"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                    {file ? (
                        <>
                            <CheckCircleIcon className="h-10 w-10 text-green-500" />
                            <span className="text-green-700 font-bold">{file.name}</span>
                        </>
                    ) : (
                        <>
                            <div className="bg-green-100 p-3 rounded-full text-green-600">
                                <Camera className="h-6 w-6" />
                            </div>
                            <span className="text-gray-500 font-medium">Click to upload Event Photo</span>
                            <span className="text-xs text-gray-400">(Optional Evidence)</span>
                        </>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-green-700 text-white font-bold py-4 rounded-lg hover:bg-green-800 transition shadow-md flex justify-center items-center"
            >
                {loading ? 'Saving...' : 'Save as Complete'}
            </button>

        </div>
      </div>
    </div>
  )
}

function CheckCircleIcon(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    )
}