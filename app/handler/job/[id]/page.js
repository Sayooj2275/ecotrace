'use client'
import { useEffect, useState, use } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Truck, Star, CheckCircle, X } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ActiveJob({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState(1) 
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    async function loadJob() {
      setLoading(true)
      const { data, error } = await supabase
        .from('activities')
        .select('*, profiles!institution_id(org_name, city)')
        .eq('id', id)
        .single()
      
      if (error) alert("Error: " + error.message)
      else setJob(data)
      setLoading(false)
    }
    if (id) loadJob()
  }, [id])

  // THE NEW "CLOSE / X" FUNCTION
  const handleClose = async () => {
    // If job is already done (step 2), just go home
    if (step === 2) {
        router.push('/handler/dashboard')
        return
    }

    // If still verifying (step 1), ask to cancel
    if (confirm("Cancel pickup? This will make the job available to other drivers.")) {
        setLoading(true)
        // Release the job
        await supabase.from('activities').update({ handler_id: null }).eq('id', id)
        router.push('/handler/market')
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    setVerifying(true)
    
    const { data: log } = await supabase
      .from('waste_logs')
      .select('*')
      .eq('activity_id', id)
      .eq('otp_code', otp)
      .single()

    if (!log) {
      alert("Incorrect Code!")
      setVerifying(false)
      return
    }

    await supabase.from('waste_logs').update({ verified: true }).eq('id', log.id)
    setVerifying(false)
    setStep(2)
  }

  const handleComplete = async () => {
    setCompleting(true)
    
    // Save Rating
    const { error } = await supabase
      .from('activities')
      .update({ 
        status: 'locked',
        segregation_rating: parseInt(rating) // Force number format
      })
      .eq('id', id)
    
    if (error) {
        alert("Error saving rating: " + error.message)
        setCompleting(false)
    } else {
        // Wait 500ms to ensure database updates before leaving
        setTimeout(() => {
            router.push('/handler/dashboard')
        }, 500)
    }
  }

  if (loading || !job) return <div className="p-10 text-center">Loading...</div>

  return (
    <div className="min-h-screen bg-green-50 p-6 flex flex-col">
      
      {/* NEW HEADER: Just the X button */}
      <div className="flex justify-end mb-4">
        <button 
            onClick={handleClose} 
            className="bg-white p-2 rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
        >
            <X className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      {step === 1 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Truck className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">{job.profiles?.org_name}</h2>
          <p className="text-sm text-gray-500 mb-6">{job.profiles?.city}</p>

          <p className="text-gray-600 font-medium mb-4">Enter 6-digit verification code:</p>
          <input
            type="text"
            placeholder="000 000"
            className="w-full text-center text-3xl font-mono tracking-widest border-2 border-gray-200 rounded-lg focus:border-green-500 outline-none py-3 mb-6 bg-white text-gray-900"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button 
            onClick={handleVerify} 
            disabled={otp.length < 6 || verifying}
            className="w-full bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-green-800 transition disabled:opacity-50"
          >
            {verifying ? 'Verifying...' : 'VERIFY PICKUP'}
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
          <p className="text-gray-500 mb-6">Rate the segregation quality:</p>

          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star 
                key={star}
                className={`h-10 w-10 cursor-pointer transition ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>

          <button 
            onClick={handleComplete} 
            disabled={rating === 0 || completing} 
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg disabled:opacity-50"
          >
             {completing ? 'Saving...' : 'COMPLETE JOB'}
          </button>
        </div>
      )}
      </div>
    </div>
  )
}