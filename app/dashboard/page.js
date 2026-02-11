'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, FileText, BarChart3, Settings, LogOut, 
  Truck, Clock, CheckCircle, List, Eye, Lock, ShieldCheck, Leaf, Key 
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 })
  const [loading, setLoading] = useState(true)
  
  // Modal State
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [otp, setOtp] = useState('Loading...')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: acts } = await supabase
      .from('activities')
      .select('*')
      .eq('institution_id', user.id)
      .order('created_at', { ascending: false })
    
    if (acts) {
        setActivities(acts)
        setStats({
            total: acts.length,
            completed: acts.filter(a => a.status === 'collected').length,
            pending: acts.filter(a => a.status === 'open').length
        })
    }
    setLoading(false)
  }

  // 🟢 FIXED: Force 4-Digit Code & Prevent "Changing" loop
  async function handleView(activity) {
    setSelectedActivity(activity)
    setOtp('...') 
    setShowModal(true)

    // 1. Try to fetch existing OTP (Wait for it!)
    let { data, error } = await supabase
        .from('waste_logs')
        .select('otp_code')
        .eq('activity_id', activity.id)
        .maybeSingle()

    // 2. ONLY generate new if absolutely missing
    if (!data || !data.otp_code) {
        // Generate 4 Digits (1000 - 9999)
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString()
        
        const { error: insertError } = await supabase
            .from('waste_logs')
            .upsert([{ activity_id: activity.id, otp_code: newOtp }], { onConflict: 'activity_id' })
        
        if (!insertError) {
            setOtp(newOtp)
        } else {
            console.error("OTP Error:", insertError)
            setOtp('Error')
        }
    } else {
        setOtp(data.otp_code)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 hidden md:flex flex-col justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-10 text-green-400 flex items-center gap-2">
            🌱 EcoTrace
          </h1>
          <nav className="space-y-2">
            <button className="flex items-center gap-3 w-full bg-green-800 p-3 rounded-lg font-semibold shadow-md transition">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </button>
            <button onClick={() => router.push('/dashboard/credits')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition group">
              <div className="relative"><Leaf className="h-5 w-5" /><div className="absolute -top-1 -right-1 bg-gray-900 rounded-full border border-gray-500"><Lock className="h-2 w-2 text-gray-400" /></div></div><span className="flex-1 text-left">Credit Readiness</span>
            </button>
            <button onClick={() => router.push('/dashboard/timeline')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition"><Clock className="h-5 w-5" /> Timeline</button>
            <button onClick={() => router.push('/dashboard/activities')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition"><List className="h-5 w-5" /> Activities</button>
            <button onClick={() => router.push('/dashboard/documents')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition"><FileText className="h-5 w-5" /> Documents</button>
            <button onClick={() => router.push('/dashboard/reports')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition"><BarChart3 className="h-5 w-5" /> Reports</button>
            <button onClick={() => router.push('/dashboard/profile')} className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-800 text-gray-400 transition"><Settings className="h-5 w-5" /> Edit Profile</button>
          </nav>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }} className="text-gray-500 hover:text-white flex items-center gap-2 transition"><LogOut className="h-5 w-5" /> Sign Out</button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h2 className="text-3xl font-bold text-gray-800">Overview</h2><p className="text-gray-500">Welcome back, track your impact.</p></div>
          <button onClick={() => router.push('/dashboard/create')} className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center gap-2 transform hover:-translate-y-1"><Truck className="h-5 w-5" /> Waste Pickup</button>
        </div>

        {/* Readiness Card */}
        <div className="bg-gray-900 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden border border-gray-800">
            <div className="relative z-10 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-green-400" /><span className="text-green-400 font-bold text-sm tracking-wider uppercase">Future Infrastructure</span></div>
                    <h1 className="text-2xl font-bold mb-2">Carbon & EPR Credit Readiness</h1>
                    <p className="text-gray-400 text-sm max-w-xl leading-relaxed">Your sustainability records are being preserved for future credit certification.</p>
                    <div className="mt-6 flex gap-4"><button onClick={() => router.push('/dashboard/credits')} className="bg-white text-gray-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition">Learn More</button><span className="px-4 py-2 rounded-lg font-bold text-sm border border-gray-700 text-gray-500 flex items-center gap-2 cursor-not-allowed"><Lock className="h-3 w-3" /> Market Enablement: Coming Soon</span></div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"><div className="flex justify-between items-start"><div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Requests</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</h3></div><div className="bg-blue-50 p-3 rounded-lg"><List className="h-6 w-6 text-blue-600" /></div></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"><div className="flex justify-between items-start"><div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Verified Pickups</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.completed}</h3></div><div className="bg-green-50 p-3 rounded-lg"><CheckCircle className="h-6 w-6 text-green-600" /></div></div></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"><div className="flex justify-between items-start"><div><p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Pending Action</p><h3 className="text-3xl font-bold text-gray-800 mt-2">{stats.pending}</h3></div><div className="bg-yellow-50 p-3 rounded-lg"><Clock className="h-6 w-6 text-yellow-600" /></div></div></div>
        </div>

        {/* Recent List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-gray-800">Recent Activity</h3><button onClick={() => router.push('/dashboard/activities')} className="text-sm text-green-700 font-bold hover:underline">View All</button></div>
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold"><tr><th className="p-4 pl-6">Type</th><th className="p-4">Date</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Action</th></tr></thead>
            <tbody className="divide-y divide-gray-100">{activities.slice(0, 5).map(activity => (
                <tr key={activity.id} className="hover:bg-gray-50 transition"><td className="p-4 pl-6 font-bold text-gray-800">{activity.type}</td><td className="p-4 text-gray-500 text-sm">{new Date(activity.created_at).toLocaleDateString()}</td><td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${activity.status === 'collected' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{activity.status.toUpperCase()}</span></td><td className="p-4 text-right pr-6"><button onClick={() => handleView(activity)} className="text-gray-400 hover:text-blue-600 transition"><Eye className="h-5 w-5" /></button></td></tr>))}</tbody>
          </table>
        </div>
      </div>

      {/* OTP Popup (4 Digits) */}
      {showModal && selectedActivity && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className={`p-6 text-center ${selectedActivity.status === 'collected' ? 'bg-green-600' : 'bg-gray-900'}`}><h3 className="text-white font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2">{selectedActivity.status === 'collected' ? <CheckCircle className="h-5 w-5" /> : <Key className="h-5 w-5" />}{selectedActivity.status === 'collected' ? 'PICKUP COMPLETED' : 'VERIFICATION CODE'}</h3></div>
            <div className="p-8 text-center">
                {selectedActivity.status === 'collected' ? (<div><div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="h-8 w-8" /></div><p className="text-gray-800 font-bold text-lg">Successfully Verified!</p></div>) : (<div><p className="text-gray-500 text-xs font-bold uppercase mb-4 tracking-wider">Share this code with the Handler</p><div className="bg-gray-100 p-6 rounded-xl border-2 border-dashed border-gray-300 mb-6"><h1 className="text-5xl font-mono font-black text-gray-900 tracking-[0.2em] select-all">{otp}</h1></div><div className="flex items-center justify-center gap-2 text-xs text-gray-400"><Lock className="h-3 w-3" /> Secure One-Time Code</div></div>)}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100"><button onClick={() => setShowModal(false)} className="w-full bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-100 transition shadow-sm">Close</button></div>
          </div>
        </div>
      )}
    </div>
  )
}