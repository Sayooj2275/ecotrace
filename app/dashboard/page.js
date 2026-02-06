'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, FileText, Upload, BarChart3, LogOut, Plus, Leaf, Lock, Clock, CheckCircle, X, Truck } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('Institution')
  
  // Data State
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({ total: 0, submitted: 0, locked: 0, pending: 0 })

  // Popup State
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [otp, setOtp] = useState(null)

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('org_name')
        .eq('id', user.id)
        .single()
      if (profile) setOrgName(profile.org_name)

      // Fetch Activities
      const { data: activityData } = await supabase
        .from('activities')
        .select('*')
        .eq('institution_id', user.id)
        .order('date', { ascending: false })

      if (activityData) {
        setActivities(activityData)
        
        // Calculate Stats
        const total = activityData.length
        const submitted = activityData.filter(a => a.status === 'submitted').length
        const locked = activityData.filter(a => a.status === 'locked').length
        const pending = activityData.filter(a => a.status === 'submitted' && a.pickup_required).length

        setStats({ total, submitted, locked, pending })
      }
      setLoading(false)
    }
    loadDashboard()
  }, [])

  const handleViewDetails = async (activity) => {
    setSelectedActivity(activity)
    setOtp(null) 

    if (activity.pickup_required && activity.status === 'submitted') {
      const { data: wasteData } = await supabase
        .from('waste_logs')
        .select('otp_code')
        .eq('activity_id', activity.id)
        .single()
      
      if (wasteData) setOtp(wasteData.otp_code)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <div className="p-10 text-center">Loading Dashboard...</div>

  return (
    <div className="flex h-screen bg-gray-50">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center text-green-700 font-bold text-xl">
            <Leaf className="mr-2 h-6 w-6" /> EcoTrace
          </div>
          <p className="text-xs text-gray-400 mt-1">Compliance Platform</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <div className="flex items-center p-3 bg-green-50 text-green-700 rounded-lg cursor-pointer">
            <LayoutDashboard className="h-5 w-5 mr-3" />
            <span className="font-medium">Dashboard</span>
          </div>
          <div className="flex items-center p-3 text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer">
            <FileText className="h-5 w-5 mr-3" />
            <span className="font-medium">Activities</span>
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition">
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto relative">
        <header className="bg-white shadow-sm p-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {orgName}</h1>
            <p className="text-gray-500 text-sm">Here is your sustainability overview</p>
          </div>
          
          <Link href="/create-activity">
            <button className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg flex items-center shadow-md transition">
              <Plus className="h-4 w-4 mr-2" />
              Request Pickup
            </button>
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-sm font-medium uppercase">Total Activities</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-sm font-medium uppercase">Submitted</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{stats.submitted}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-sm font-medium uppercase">Locked (Verified)</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{stats.locked}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-400 text-sm font-medium uppercase">Pending Waste</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Recent Activities</h3>
            </div>
            
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Activity Type</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-400 italic">
                      No requests yet. Click "Request Pickup" to start.
                    </td>
                  </tr>
                ) : (
                  activities.map((act) => (
                    <tr key={act.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{act.type}</td>
                      <td className="px-6 py-4 text-gray-600">{act.date}</td>
                      <td className="px-6 py-4">
                        {act.status === 'locked' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1"/> Verified</span>}
                        {act.status === 'submitted' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1"/> Pending Pickup</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleViewDetails(act)}
                          className="text-green-600 hover:text-green-900 text-sm font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* POPUP MODAL */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
              <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Activity Details</h3>
                <button onClick={() => setSelectedActivity(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Waste Type</span>
                  <p className="text-lg font-medium text-gray-900">{selectedActivity.type}</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Description</span>
                  <p className="text-gray-600 mt-1">{selectedActivity.description}</p>
                </div>

                {selectedActivity.evidence_url && (
                  <div className="mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Photo Evidence</span>
                    <img src={selectedActivity.evidence_url} alt="Waste" className="mt-2 w-full h-40 object-cover rounded-lg border border-gray-200"/>
                  </div>
                )}

                {selectedActivity.pickup_required && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <Truck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-green-800 mb-1">Waste Pickup Verification</h4>
                    
                    {selectedActivity.status === 'submitted' ? (
                      <div>
                        <p className="text-xs text-green-600 mb-2">Show this code to the pickup handler:</p>
                        <div className="text-3xl font-mono font-bold text-gray-900 tracking-widest bg-white py-2 rounded border border-green-200">
                          {otp || "Loading..."}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center text-green-700 font-bold">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Verified & Collected
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 p-4 text-right">
                <button 
                  onClick={() => setSelectedActivity(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}