'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, History, Star, LogOut, MapPin, ArrowRight, Wallet, Scale, FileText, ChevronRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function HandlerDashboard() {
  const router = useRouter()
  const [history, setHistory] = useState([])
  const [activeJob, setActiveJob] = useState(null)
  const [stats, setStats] = useState({ weight: 0, jobs: 0 }) // Removed Earnings
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // 1. Fetch Active Job
      const { data: activeData } = await supabase
        .from('activities')
        .select('*, profiles!institution_id(org_name, city)')
        .eq('handler_id', user.id)
        .eq('status', 'submitted')
        .single()
      if (activeData) setActiveJob(activeData)

      // 2. Fetch History & Calculate Stats
      const { data: historyData } = await supabase
        .from('activities')
        .select('*, profiles!institution_id(org_name, city)')
        .eq('handler_id', user.id)
        .eq('status', 'locked')
        .order('date', { ascending: false })
      
      if (historyData) {
        setHistory(historyData)
        
        // Calculate Stats
        const totalWeight = historyData.reduce((sum, item) => sum + (item.weight || 0), 0)
        const totalJobs = historyData.length

        setStats({ weight: totalWeight, jobs: totalJobs })
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex justify-between items-center sticky top-0 z-10">
        <h1 className="font-bold text-lg text-gray-800 flex items-center">
          <Truck className="mr-2 h-5 w-5 text-green-700" /> Handler App
        </h1>
        <button onClick={handleLogout} className="text-gray-400 hover:text-red-500">
          <LogOut className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        
        {/* STATS GRID (Updated) */}
        <div className="grid grid-cols-3 gap-3">
          {/* Card 1: Weight */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
            <div className="bg-blue-50 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
              <Scale className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.weight} <span className="text-xs text-gray-400 font-normal">kg</span></div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Collected</div>
          </div>

          {/* Card 2: Jobs */}
          <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col justify-center">
            <div className="bg-green-50 text-green-600 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2">
              <Truck className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stats.jobs}</div>
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Pickups</div>
          </div>

          {/* Card 3: DOCUMENTS LINK (New!) */}
          <Link href="/handler/documents" className="bg-purple-50 p-3 rounded-xl shadow-sm border border-purple-100 text-center flex flex-col justify-center items-center hover:bg-purple-100 transition cursor-pointer group">
            <div className="bg-white text-purple-600 w-8 h-8 rounded-full flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition">
              <FileText className="h-4 w-4" />
            </div>
            <div className="text-xs font-bold text-purple-700">My Docs</div>
            <div className="text-[10px] text-purple-400 mt-1 flex items-center">
                View <ChevronRight className="h-3 w-3" />
            </div>
          </Link>
        </div>

        {/* ACTIVE JOB CARD */}
        {activeJob ? (
          <div className="bg-green-700 rounded-xl p-5 text-white shadow-lg shadow-green-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="bg-green-600 text-green-100 text-xs font-bold px-2 py-1 rounded uppercase mb-2 inline-block">Current Pickup</span>
                <h3 className="font-bold text-xl">{activeJob.profiles?.org_name}</h3>
                <p className="text-green-100 text-sm flex items-center mt-1"><MapPin className="h-4 w-4 mr-1" /> {activeJob.profiles?.city}</p>
              </div>
              <div className="bg-white p-2 rounded-full"><Truck className="h-6 w-6 text-green-700" /></div>
            </div>
            <Link href={`/handler/job/${activeJob.id}`}>
              <button className="w-full bg-white text-green-800 font-bold py-3 rounded-lg flex items-center justify-center hover:bg-gray-100 transition">Continue <ArrowRight className="ml-2 h-4 w-4" /></button>
            </Link>
          </div>
        ) : (
          <Link href="/handler/market">
            <button className="w-full bg-black text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center transform transition active:scale-95">
              <MapPin className="mr-2 h-6 w-6" /> FIND NEW PICKUPS
            </button>
          </Link>
        )}

        {/* HISTORY LIST */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center"><History className="h-4 w-4 mr-2" /> Recent Activity</h3>
          {loading ? <p className="text-center text-gray-400">Loading...</p> : (
            <div className="space-y-4">
              {history.length === 0 ? <div className="text-center py-10 text-gray-400">No completed jobs yet.</div> : (
                history.map(job => (
                  <div key={job.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-gray-900">{job.profiles?.org_name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{job.date} • {job.type}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-mono font-bold text-green-700">{job.weight} kg</div>
                        <div className="flex items-center justify-end text-xs text-yellow-500 mt-1">
                            <Star className="h-3 w-3 fill-current mr-1"/> {job.segregation_rating}
                        </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}