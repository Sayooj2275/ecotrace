'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { 
  Download, ArrowLeft, ChevronDown, 
  AlertCircle, ShieldCheck 
} from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ReportsPage() {
  const [logs, setLogs] = useState([])
  const [orgName, setOrgName] = useState('Organization')
  const [loading, setLoading] = useState(true)
  const [reportDate] = useState(new Date().toLocaleDateString())
  const [reportId] = useState(`RPT-${Math.floor(1000 + Math.random() * 9000)}`)
  
  // State for the selected month (Visual only for now)
  const [selectedMonth, setSelectedMonth] = useState('February 2026')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Get Org Name
      const { data: profile } = await supabase
        .from('profiles')
        .select('org_name')
        .eq('id', user.id)
        .single()
      
      if (profile) setOrgName(profile.org_name)

      // 2. Get Activities
      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('institution_id', user.id)
        .order('created_at', { ascending: false })

      setLogs(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // Summary Counts
  const totalActivities = logs.length
  const verifiedCount = logs.filter(l => l.status === 'collected').length
  const totalWeight = logs.filter(l => l.status === 'collected').reduce((sum, item) => sum + (item.collected_weight || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      
      {/* Top Navigation */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 mb-4 transition font-medium text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
        
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Sustainability Compliance Reports</h1>
                <p className="text-gray-500 mt-1">Generate and download audit-ready documentation.</p>
            </div>
            {/* 🟢 REMOVED: "Filter Data" Button */}
            <div className="flex gap-3">
                <button className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-800 transition shadow-sm shadow-green-900/10">
                    <Download className="h-4 w-4" /> Download PDF
                </button>
            </div>
        </div>
      </div>

      {/* Filter Controls Bar (Simplified to Date Only) */}
      <div className="max-w-5xl mx-auto bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-wrap gap-4 items-end">
        
        {/* 🟢 UPDATED: Monthly Date Range Only */}
        <div className="flex-1">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Report Month</label>
            <div className="relative">
                <select 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-3 pl-4 pr-10 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option>February 2026</option>
                    <option>January 2026</option>
                    <option>December 2025</option>
                    <option>November 2025</option>
                </select>
                <ChevronDown className="absolute right-3 top-4 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
        </div>

        {/* 🟢 REMOVED: Activity Category Filter */}
        
        <button className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-800 transition">
            Generate Report
        </button>
      </div>

      {/* 📄 THE REPORT PAPER UI */}
      <div className="max-w-4xl mx-auto bg-white shadow-xl border border-gray-100 min-h-[1000px] p-12 relative">
        
        {/* Report Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
                {/* 🟢 UPDATED: Shows Selected Month */}
                <h2 className="text-3xl font-bold text-gray-900">{selectedMonth} Sustainability Report</h2>
                <p className="text-gray-500 mt-2">Generated for: <span className="font-bold text-gray-900">{orgName}</span></p>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">Date: {reportDate}</p>
                <p className="text-sm text-gray-400">Report ID: #{reportId}</p>
            </div>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-8 text-xs text-gray-500 leading-relaxed flex gap-3">
            <AlertCircle className="h-4 w-4 shrink-0 text-gray-400" />
            <p>This report is an EcoTrace-generated sustainability record based on institution-submitted data and third-party confirmations where applicable. EcoTrace does not certify compliance, regulatory approval, or credit issuance.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Activities Logged</p>
                <p className="text-2xl font-bold text-gray-900">{totalActivities}</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Verified Records</p>
                <p className="text-2xl font-bold text-green-700">{verifiedCount}</p>
            </div>
            <div className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase">Total Recovered</p>
                <p className="text-2xl font-bold text-blue-700">{totalWeight} kg</p>
            </div>
        </div>

        {/* Executive Summary */}
        <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-green-500 pl-3">Executive Summary</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
                This report outlines the sustainability activities and waste management compliance for <span className="font-bold">{orgName}</span> during <span className="font-bold">{selectedMonth}</span>. 
                The institution has successfully logged <span className="font-bold text-gray-900">{totalActivities} activities</span>, demonstrating a commitment to environmental stewardship. 
                Verified waste collection totals and other sustainability initiatives are detailed below.
            </p>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden mb-10">
            <table className="w-full text-left">
                <thead className="border-b-2 border-gray-100">
                    <tr>
                        <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Activity Type</th>
                        <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Description / Qty</th>
                        <th className="py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr><td colSpan="4" className="py-8 text-center text-gray-400">Loading report data...</td></tr>
                    ) : logs.length === 0 ? (
                        <tr><td colSpan="4" className="py-8 text-center text-gray-400">No records found for this period.</td></tr>
                    ) : logs.map((log) => (
                        <tr key={log.id} className="group hover:bg-gray-50 transition">
                            <td className="py-4 text-sm font-medium text-gray-500">
                                {new Date(log.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-4 text-sm font-bold text-gray-800">
                                {log.type}
                            </td>
                            <td className="py-4 text-sm text-gray-500">
                                {log.collected_weight ? `Verified pickup: ${log.collected_weight}kg` : `Request: ${log.weight}kg`}
                            </td>
                            <td className="py-4 text-right">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium border ${
                                    log.status === 'collected' 
                                    ? 'bg-green-50 text-green-700 border-green-100' 
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                }`}>
                                    {log.status === 'collected' ? 'Verified' : 'Pending'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* Credit Readiness Note */}
        <div className="mb-10 border border-blue-100 bg-blue-50/50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-bold text-blue-900">Carbon & EPR Credit Readiness</h3>
            </div>
            <p className="text-xs text-blue-800 leading-relaxed">
                Some activities and verified waste records in this report may be relevant for future Carbon or EPR credit certification. EcoTrace preserves this data as auditable sustainability records to support certification through authorized agencies when enablement becomes available.
            </p>
        </div>

        {/* Footer */}
        <div className="absolute bottom-12 left-12 right-12 border-t border-gray-100 pt-6 flex justify-between items-center text-xs text-gray-400">
            <p>Generated by EcoTrace • Verifiable Audit Trail</p>
            <p>Page 1 of 1</p>
        </div>

      </div>
    </div>
  )
}