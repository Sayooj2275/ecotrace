'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, Users, Megaphone, Save, User, UploadCloud, CheckCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LogEvent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    participants: '',
    description: '',
    faculty: '' // 🟢 New Field
  })
  const [file, setFile] = useState(null) // 🟢 New State for Image

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Upload Image (If selected)
    let finalImageUrl = null
    if (file) {
        const fileName = `events/${user.id}/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, file)
        
        if (uploadError) {
            alert("Image Upload Failed: " + uploadError.message)
            setLoading(false)
            return
        }
        
        const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
        finalImageUrl = urlData.publicUrl
    }

    // 2. Save Event Data
    const { error } = await supabase
      .from('campus_events')
      .insert([{
        institution_id: user.id,
        title: formData.title,
        event_date: formData.date,
        participants: formData.participants,
        description: formData.description,
        faculty_name: formData.faculty, // 🟢 Saving Faculty Name
        image_url: finalImageUrl        // 🟢 Saving Image URL
      }])

    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
    } else {
      alert("Event Logged Successfully!")
      router.push('/dashboard/activities')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        <div className="bg-green-700 p-6 text-white flex items-center">
          <button onClick={() => router.back()} className="mr-4 hover:bg-green-600 p-2 rounded-full transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6" /> Log New Campus Initiative
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Tree Planting Drive 2026"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>

          {/* Date & Participants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-green-600" /> Date
              </label>
              <input 
                required
                type="date" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <Users className="h-4 w-4 text-green-600" /> Participants
              </label>
              <input 
                required
                type="number" 
                placeholder="e.g. 50"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                value={formData.participants}
                onChange={e => setFormData({...formData, participants: e.target.value})}
              />
            </div>
          </div>

          {/* 🟢 NEW: Faculty in Charge */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <User className="h-4 w-4 text-green-600" /> Faculty / Staff in Charge
            </label>
            <input 
              required
              type="text" 
              placeholder="e.g. Dr. Sarah Smith (NSS Coordinator)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.faculty}
              onChange={e => setFormData({...formData, faculty: e.target.value})}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Description / Impact</label>
            <textarea 
              rows="3"
              placeholder="Describe what happened and the positive impact..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* 🟢 NEW: Image Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Event Photo (Evidence)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50">
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              />
              <div className="flex flex-col items-center">
                {file ? (
                    <p className="text-green-700 font-bold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" /> {file.name}
                    </p>
                ) : (
                    <>
                        <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-gray-500">Click to upload event photo</p>
                    </>
                )}
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-green-700 text-white font-bold py-4 rounded-xl hover:bg-green-800 transition flex items-center justify-center gap-2 shadow-md"
          >
            {loading ? 'Saving...' : <><Save className="h-5 w-5" /> Save Event Log</>}
          </button>

        </form>
      </div>
    </div>
  )
}