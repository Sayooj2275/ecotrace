'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Truck, UploadCloud, Scale } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function CreateActivity() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // Form State
  const [type, setType] = useState('E-Waste Collection')
  const [desc, setDesc] = useState('')
  const [weight, setWeight] = useState('') 
  const [date, setDate] = useState('')
  const [file, setFile] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    // 1. Upload Image (Optional)
    let imageUrl = null
    if (file) {
      const fileName = `${user.id}/${Date.now()}_${file.name}`
      // Ensure we use the 'evidence' bucket (or 'documents' if you didn't create 'activity-evidence')
      // For safety, let's use the 'documents' bucket we know exists
      const { error: fileError } = await supabase.storage.from('documents').upload(fileName, file)
      
      if (fileError) { 
        alert("Image upload failed: " + fileError.message)
        setLoading(false)
        return 
      }
      
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName)
      imageUrl = urlData.publicUrl
    }

    // 2. Save Data
    const { data: activity, error } = await supabase
      .from('activities')
      .insert([{
          institution_id: user.id,
          type: type,
          description: desc,
          weight: weight, 
          date: date,
          pickup_required: true,
          status: 'open', // 🟢 FIX: Changed from 'submitted' to 'open'
          evidence_url: imageUrl
      }])
      .select().single()

    if (error) {
      alert("Error: " + error.message)
      setLoading(false)
    } else {
      // 3. Create the hidden OTP for this request
      // (Note: Your Database Trigger usually handles this, but doing it manually is a safe backup)
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      await supabase.from('waste_logs').insert([{ activity_id: activity.id, otp_code: otp }])
      
      alert("Pickup Request Sent Successfully!")
      router.push('/dashboard') // Go back to dashboard to see the new 'Open' task
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-white border-b border-gray-100 p-6 flex items-center">
          <button onClick={() => router.back()} className="mr-4 text-gray-400 hover:text-gray-600 transition">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-bold text-gray-800 flex items-center">
            <Truck className="mr-2 h-6 w-6 text-green-700" /> Request Waste Pickup
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Waste Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Waste Category</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900 transition"
              >
                <option>E-Waste Collection</option>
                <option>Plastic Waste (Recyclable)</option>
                <option>Organic/Wet Waste</option>
                <option>Paper & Cardboard</option>
                <option>Metal Scrap</option>
                <option>Bio-Medical Waste</option>
              </select>
            </div>

            {/* Pickup Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Date</label>
              <input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900 transition" 
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Weight (Kg) <span className="text-red-500">*</span></label>
            <div className="relative">
              <Scale className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input 
                type="number" 
                required
                placeholder="e.g. 50"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900 transition"
              />
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Details</label>
            <textarea 
                rows="3" 
                placeholder="Describe contents, specific location, or special instructions..." 
                value={desc} 
                onChange={(e) => setDesc(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white text-gray-900 transition" 
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Photo (Optional)</label>
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
                        <p className="text-gray-500">Click to upload evidence</p>
                    </>
                )}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-4">
            <button 
                type="submit" 
                disabled={loading} 
                className="px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition disabled:opacity-50 shadow-md"
            >
              {loading ? 'Sending Request...' : 'Schedule Pickup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}