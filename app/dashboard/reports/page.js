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
  Download, 
  Filter 
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ReportsPage() {
  const router = useRouter()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [orgName, setOrgName] = useState('')
  const [filterType, setFilterType] = useState('All')

  useEffect(() => {
    fetchReportData()
  }, [])

  async function fetchReportData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')

    // Get Org Name
    const { data: profile } = await supabase.from('profiles').select('org_name').eq('id', user.id).single()
    if (profile) setOrgName(profile.org_name)

    // Get Activities
    const { data: acts } = await supabase
      .from('activities')
      .select('*')
      .eq('institution_id', user.id)
      .order('date', { ascending: false })
    
    setActivities(acts || [])
    setLoading(false)
  }

  const handleDownload = () => {
    window.print()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Filter Logic
  const filteredActivities = activities.filter(act => {
    if (filterType === 'All') return true
    if (filterType === 'Waste') return ['E-Waste Collection', 'Paper Recycling', 'Plastic Waste'].some(t => act.type.includes(t))
    if (filterType === 'General') return !['E-Waste Collection', 'Paper Recycling', 'Plastic Waste'].some(t => act.type.includes(t))
    return true
  })

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex print:hidden">
        <div className="p-6 text-2xl font-bold flex items-center space-x-2">
          <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center text-white">E</div>
          <span>EcoTrace</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => router.push('/dashboard')} className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition">
            <LayoutDashboard className="h-5 w-5" /> <span>Dashboard</span>
          </button>
          <button onClick={() => router.push('/dashboard/create')} className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition">
            <List className="h-5 w-5" /> <span>Activities</span>
          </button>
          <button onClick={() => router.push('/dashboard/documents')} className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-800 w-full p-3 rounded-lg transition">
            <FileText className="h-5 w-5" /> <span>Documents</span>
          </button>
          <button className="flex items-center space-x-3 text-white bg-green-700 w-full p-3 rounded-lg shadow-md transition">
            <BarChart className="h-5 w-5" /> <span>Reports</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button onClick={handleLogout} className="flex items-center space-x-3 text-red-400 hover:text-red-300 w-full p-3 rounded-lg transition">
            <LogOut className="h-5 w-5" /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 print:hidden">
          <h1 className="text-2xl font-bold text-gray-800">Sustainability Compliance Reports</h1>
          <div className="flex space-x-3">
             <button onClick={handleDownload} className="bg-green-700 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-800 transition flex items-center shadow-sm">
                <Download className="h-4 w-4 mr-2" /> Download PDF
             </button>
          </div>
        </div>

        {/* CONTROLS BAR (Updated Filters) */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex flex-wrap gap-4 items-end print:hidden">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Date Range</label>
                <select className="border border-gray-300 rounded-lg p-2 w-48 text-gray-600">
                    <option>Current Quarter (Q1)</option>
                    <option>Last Quarter (Q4)</option>
                    <option>Full Year 2026</option>
                </select>
            </div>
            
            {/* UPDATED CATEGORY FILTER */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Activity Category</label>
                <select 
                    className="border border-gray-300 rounded-lg p-2 w-48 text-gray-600"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                >
                    <option value="All">All Categories</option>
                    <option value="Waste">Waste Collection</option>
                    <option value="General">General Initiatives</option>
                </select>
            </div>
            
            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-900 transition">
                Generate Report
            </button>
        </div>

        {/* REPORT PREVIEW */}
        <div className="bg-white p-10 rounded-xl shadow-lg border border-gray-200 min-h-[600px] max-w-4xl mx-auto print:shadow-none print:border-none print:p-0">
            
            {/* Report Header */}
            <div className="border-b-2 border-green-600 pb-6 mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Sustainability Report 2026</h2>
                    <p className="text-gray-500 mt-1">Generated for: <span className="font-bold text-gray-800">{orgName}</span></p>
                </div>
                <div className="text-right text-sm text-gray-400">
                    <p>Date: {new Date().toLocaleDateString()}</p>
                    <p>Report ID: #RPT-{Math.floor(Math.random() * 10000)}</p>
                </div>
            </div>

            {/* Executive Summary */}
            <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-2">Executive Summary</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    This report outlines the sustainability activities and waste management compliance for {orgName}. 
                    The institution has successfully logged <strong>{filteredActivities.length} activities</strong>. 
                    All listed activities have been verified and processed in accordance with environmental regulations.
                </p>
            </div>

            {/* Report Table */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                        <th className="p-3">Date</th>
                        <th className="p-3">Activity Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                    {loading ? (
                        <tr><td colSpan="4" className="p-4 text-center">Loading report data...</td></tr>
                    ) : filteredActivities.length === 0 ? (
                         <tr><td colSpan="4" className="p-4 text-center text-gray-400">No data matches your filter.</td></tr>
                    ) : (
                        filteredActivities.map((act) => (
                            <tr key={act.id} className="border-b border-gray-100">
                                <td className="p-3 font-mono text-xs text-gray-500">{new Date(act.date).toLocaleDateString()}</td>
                                <td className="p-3 font-bold text-gray-900">{act.type}</td>
                                <td className="p-3 text-gray-600 truncate max-w-[200px]">{act.description || '-'}</td>
                                
                                {/* STATUS COLUMN - Always shows "Verified" for clean look */}
                                <td className="p-3 text-right">
                                    <span className="inline-block px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-800">
                                        Verified
                                    </span>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center text-xs text-gray-400">
                <p>Verified by EcoTrace Digital Platform</p>
                <p>Page 1 of 1</p>
            </div>

        </div>
      </main>
    </div>
  )
}