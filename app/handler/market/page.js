'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, MapPin, Truck, Clock, Star, Scale, Info } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function PickupMarket() {
  const router = useRouter()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJobs() {
      // 1. Get Available Jobs
      const { data: jobList, error } = await supabase
        .from('activities')
        .select('*, profiles!institution_id(org_name, city)')
        .eq('status', 'submitted')
        .is('handler_id', null)
        .order('date', { ascending: true })
      
      if (!jobList) { setLoading(false); return }

      // 2. Calculate Real Ratings for each Institution
      // We loop through the jobs and fetch the average score for that college
      const jobsWithRatings = await Promise.all(jobList.map(async (job) => {
          
          // Fetch all completed jobs for this specific institution
          const { data: pastJobs } = await supabase
              .from('activities')
              .select('segregation_rating')
              .eq('institution_id', job.institution_id)
              .eq('status', 'locked') // Only count finished jobs
              .not('segregation_rating', 'is', null) // Only count rated jobs

          // Math: Calculate Average
          let avg = "New"
          let count = 0
          
          if (pastJobs && pastJobs.length > 0) {
              const total = pastJobs.reduce((sum, item) => sum + item.segregation_rating, 0)
              avg = (total / pastJobs.length).toFixed(1) // e.g. "4.5"
              count = pastJobs.length
          }

          return { ...job, ratingAvg: avg, ratingCount: count }
      }))

      setJobs(jobsWithRatings)
      setLoading(false)
    }
    loadJobs()
  }, [])

  const acceptJob = async (jobId) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('activities').update({ handler_id: user.id }).eq('id', jobId)
    if (!error) router.push(`/handler/job/${jobId}`)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white p-4 shadow-sm flex items-center sticky top-0 z-10">
        <button onClick={() => router.back()} className="mr-4 text-gray-600"><ArrowLeft className="h-6 w-6" /></button>
        <h1 className="font-bold text-lg text-gray-800">Available Pickups</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? <div className="text-center mt-10">Loading Market...</div> : jobs.length === 0 ? (
          <div className="text-center mt-10 text-gray-500">No pickup requests nearby.</div>
        ) : (
          jobs.map(job => (
            <div key={job.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-800">{job.profiles?.org_name}</h3>
                    
                    {/* REAL DYNAMIC RATING */}
                    <div className="flex items-center text-xs mt-1 mb-1">
                        {job.ratingAvg === "New" ? (
                            <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center">
                                <Info className="h-3 w-3 mr-1"/> New Institution
                            </span>
                        ) : (
                            <span className="flex items-center text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500 mr-1"/> 
                                <span className="font-bold mr-1">{job.ratingAvg}</span> 
                                <span className="text-yellow-600/60">({job.ratingCount} reviews)</span>
                            </span>
                        )}
                        <span className="mx-2 text-gray-300">|</span>
                        <span className="text-gray-500 flex items-center"><MapPin className="h-3 w-3 mr-1" /> {job.profiles?.city}</span>
                    </div>

                  </div>
                  <div className="flex flex-col items-end">
                      <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded uppercase mb-2">{job.type}</span>
                      {job.weight && (
                          <span className="flex items-center font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded text-sm">
                              <Scale className="h-3 w-3 mr-1"/> {job.weight} Kg
                          </span>
                      )}
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                  <p><strong>Note:</strong> {job.description}</p>
                </div>

                {job.evidence_url && (
                  <div className="mt-3 h-32 rounded-lg overflow-hidden bg-gray-100 relative border border-gray-200">
                      <img src={job.evidence_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-gray-400 flex items-center"><Clock className="h-3 w-3 mr-1" /> Posted {job.date}</div>
                  <button onClick={() => acceptJob(job.id)} className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-green-800 transition transform active:scale-95">ACCEPT</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}