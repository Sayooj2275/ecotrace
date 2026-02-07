'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Users, FileText, Shield, Trash2, ArrowLeft } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    institutions: 0,
    activities: 0,
    verifiedWaste: 0,
    pending: 0
  })
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  async function loadAdminData() {
    const { count: instCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'institution')
    const { count: actCount } = await supabase.from('activities').select('*', { count: 'exact', head: true })
    
    const { data: wasteData } = await supabase.from('activities').select('weight').eq('status', 'locked')
    const totalWeight = wasteData?.reduce((sum, item) => sum + (item.weight || 0), 0) || 0

    const { count: pendingCount } = await supabase.from('activities').select('*', { count: 'exact', head: true }).eq('status', 'submitted')

    setStats({
      institutions: instCount || 0,
      activities: actCount || 0,
      verifiedWaste: totalWeight,
      pending: pendingCount || 0
    })

    const { data: logs } = await supabase
      .from('activities')
      .select('*, profiles!institution_id(org_name)')
      .order('date', { ascending: false })
      .limit(50) 
    
    setAuditLog(logs || [])
    setLoading(false)
  }

  const handleDelete = async (id) => {
    if(!confirm("⚠️ ARE YOU SURE?\n\nThis will permanently delete this record AND its linked logs.")) return

    const { error: logError } = await supabase.from('waste_logs').delete().eq('activity_id', id)
    if (logError) return alert("Error deleting logs: " + logError.message)

    const { error } = await supabase.from('activities').delete().eq('id', id)

    if (error) {
        alert("Delete failed: " + error.message)
    } else {
        setAuditLog(auditLog.filter(item => item.id !== id))
        loadAdminData() 
        alert("Record deleted successfully.")
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* Top Navbar */}
      <div className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md sticky top-0 z-50">
        <div className="flex items-center space-x-2">
            <button onClick={() => router.push('/')} className="mr-2 hover:bg-gray-800 p-1 rounded">
                <ArrowLeft className="h-5 w-5 text-gray-400" />
            </button>
            <Shield className="h-6 w-6 text-green-400" />
            <span className="font-bold text-lg">EcoTrace Admin</span>
        </div>
        <div className="h-8 w-8 bg-gray-700 rounded-full flex items-center justify-center">
            <Users className="h-4 w-4 text-gray-300" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">System Overview</h1>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm font-semibold uppercase mb-2">Total Institutions</div>
                <div className="text-4xl font-bold text-gray-900">{stats.institutions.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm font-semibold uppercase mb-2">Activities Logged</div>
                <div className="text-4xl font-bold text-gray-900">{stats.activities.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm font-semibold uppercase mb-2">Waste Verified (kg)</div>
                <div className="text-4xl font-bold text-green-600">{stats.verifiedWaste.toLocaleString()}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="text-gray-500 text-sm font-semibold uppercase mb-2">Pending Actions</div>
                <div className="text-4xl font-bold text-yellow-600">{stats.pending.toLocaleString()}</div>
            </div>
        </div>

        {/* AUDIT LOG TABLE */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-gray-500"/> Master Audit Log
                </h3>
            </div>
            
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-100 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                        <th className="p-4 font-semibold">Date</th>
                        <th className="p-4 font-semibold">Institution</th>
                        <th className="p-4 font-semibold">Activity</th>
                        <th className="p-4 font-semibold">Weight</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                    {loading ? (
                        <tr><td colSpan="6" className="p-6 text-center text-gray-500">Loading system data...</td></tr>
                    ) : auditLog.length === 0 ? (
                        <tr><td colSpan="6" className="p-6 text-center text-gray-500">No activities found.</td></tr>
                    ) : (
                        auditLog.map(log => (
                            <tr key={log.id} className="hover:bg-gray-50 transition group">
                                <td className="p-4 text-gray-600 font-mono">{log.date}</td>
                                <td className="p-4 text-gray-900 font-bold">{log.profiles?.org_name || 'Unknown'}</td>
                                <td className="p-4 text-gray-600">{log.type}</td>
                                <td className="p-4 text-gray-900 font-mono font-bold">
                                    {log.weight ? `${log.weight} kg` : '-'}
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                        log.status === 'locked' ? 'bg-green-100 text-green-700' :
                                        log.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {log.status === 'locked' ? 'Verified' : log.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(log.id)}
                                        className="text-gray-300 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                                        title="Delete Record"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}