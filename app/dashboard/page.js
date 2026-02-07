'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  List, 
  FileText, 
  BarChart, 
  LogOut, 
  Plus, 
  CheckCircle, 
  Lock, 
  Trash2 
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    locked: 0,
    pending: 0
  })
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')

  useEffect(() => {
    checkUser()
    fetchDashboardData()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) router.push('/login')
      
    // Get Org Name
    const { data: profile } = await supabase
      .from('profiles')
      .select('org_name')
      .eq('id', user?.id)
      .single()
    
    if (profile) setOrgName(profile.org_name)
  }

  async function fetchDashboardData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1. Get Activities
    const { data: acts, error } = await supabase
      .from('activities')
      .select('*')
      .eq('institution_id', user.id)
      .order('date', { ascending: false })

    if (error) console.error('Error fetching data:', error)
    else {
      setActivities(acts)
      
      // 2. Calculate Stats
      const total = acts.length
      const submitted = acts.filter(a => a.status === 'submitted').length
      const locked = acts.filter(a => a.status === 'locked').length
      const pending = acts.filter(a => a.status === 'pending_verification' || a.status === 'submitted').length

      setStats({ total, submitted, locked, pending })
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex">
        <div className="p-6 text-2xl font-bold flex items-center space-x-2">
          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white">
             E
          </div>
          <span>EcoTrace</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          
          {/* Dashboard (Active) */}
          <button className="flex items-center space-x-3 text-white bg-green-700 w-full p-3 rounded-lg shadow-md transition">
            <LayoutDashboard className="h-5 w-5" />
            <span>Dashboard</span>
          </button>

          {/* Create Activity */}
          <button 
            onClick={() => router.push('/dashboard/create')}
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition"
          >
            <List className="h-5 w-5" />
            <span>Activities</span>
          </button>

          {/* Documents */}
          <button 
            onClick={() => router.push('/dashboard/documents')}
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition"
          >
            <FileText className="h-5 w-5" />
            <span>Documents</span>
          </button>

          {/* Reports */}
          <button 
            onClick={() => router.push('/dashboard/reports')}
            className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition"
          >
            <BarChart className="h-5 w-5" />
            <span>Reports</span>
          </button>

        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full p-3 rounded-lg transition"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-xl font-bold text-gray-800">Institution Dashboard</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{orgName || 'Loading...'}</div>
              <div className="text-xs text-gray-500">Institution Account</div>
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
              {orgName.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-bold uppercase">Total Activities</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</div>
              </div>
              <div className="p-3 bg-green-50 rounded-full text-green-600">
                <List className="h-6 w-6" />
              </div>
            </div>

            {/* Submitted */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-bold uppercase">Submitted</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.submitted}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>

            {/* Locked */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-bold uppercase">Locked</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.locked}</div>
              </div>
              <div className="p-3 bg-gray-100 rounded-full text-gray-600">
                <Lock className="h-6 w-6" />
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-gray-500 text-xs font-bold uppercase">Pending Actions</div>
                <div className="text-3xl font-bold text-gray-900 mt-1">{stats.pending}</div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-full text-yellow-600">
                <Trash2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          {/* Activity List Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Recent Activities</h3>
              <button 
                onClick={() => router.push('/dashboard/create')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center text-sm font-medium transition"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Activity
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">Activity Type</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loading ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-500">Loading activities...</td></tr>
                  ) : activities.length === 0 ? (
                    <tr><td colSpan="5" className="p-6 text-center text-gray-500">No activities found. Create one!</td></tr>
                  ) : (
                    activities.map((act) => (
                      <tr key={act.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-bold text-gray-800">{act.type}</td>
                        <td className="p-4 text-gray-600 truncate max-w-xs">{act.description}</td>
                        <td className="p-4 text-gray-500">{new Date(act.date).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                            act.status === 'locked' ? 'bg-green-100 text-green-700' :
                            act.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {act.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button className="text-blue-600 hover:underline font-medium">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}