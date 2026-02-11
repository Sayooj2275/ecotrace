'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'
import { CheckCircle, Leaf, ArrowLeft, X, Recycle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function TimelinePage() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Filter States
  const [filterCategory, setFilterCategory] = useState('All')
  const [filterDate, setFilterDate] = useState('All Time')

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('activities')
        .select('*')
        .eq('institution_id', user.id)
        .order('created_at', { ascending: false })

      setActivities(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  // 🟢 Helper: Define what counts as "Waste" vs "Initiatives"
  const isWaste = (type) => ['Glass', 'Paper', 'Plastic', 'Plastic Waste (Recyclable)', 'E-Waste', 'Metal', 'Cardboard', 'Paper & Cardboard'].some(t => type.includes(t))

  // 🟢 Helper: Get Display Title
  const getTitle = (item) => {
    if (isWaste(item.type)) return `${item.type} Management`
    return item.type // e.g. "Tree Plantation" stays as is
  }

  // 🟢 Filtering Logic
  const filteredActivities = activities.filter(item => {
    const itemIsWaste = isWaste(item.type)

    // RULE 1: If it's waste, ONLY show if 'collected' (Verified)
    if (itemIsWaste && item.status !== 'collected') return false

    // RULE 2: Category Filter
    if (filterCategory === 'Waste Management' && !itemIsWaste) return false
    if (filterCategory === 'Campus Initiatives' && itemIsWaste) return false
    
    // RULE 3: Date Filter
    if (filterDate === 'Last 30 Days') {
        const daysAgo = (new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24)
        if (daysAgo > 30) return false
    }
    
    return true
  })

  return (
    <div className="p-8 max-w-4xl mx-auto text-gray-800 font-sans">
      
      {/* Back Navigation */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-500 hover:text-green-700 mb-6 transition font-medium">
        <ArrowLeft className="h-5 w-5" /> Back to Dashboard
      </Link>

      <div className="flex justify-between items-end mb-8">
        <div>
            <h1 className="text-3xl font-bold mb-2">Impact Timeline</h1>
            <p className="text-gray-500">Chronological record of verified sustainability actions.</p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex gap-3">
            {/* Category Filter */}
            <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5 font-medium"
            >
                <option value="All">All Impact</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Campus Initiatives">Campus Initiatives</option>
            </select>

            {/* Date Filter */}
            <select 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block p-2.5"
            >
                <option>All Time</option>
                <option>Last 30 Days</option>
            </select>

            {/* Clear Button */}
            {(filterCategory !== 'All' || filterDate !== 'All Time') && (
                <button 
                    onClick={() => { setFilterCategory('All'); setFilterDate('All Time'); }}
                    className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-bold px-3"
                >
                    <X className="h-4 w-4" /> Clear
                </button>
            )}
        </div>
      </div>

      {loading ? <p className="text-gray-500">Loading history...</p> : (
        <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
          
          {filteredActivities.length === 0 && (
             <div className="ml-8 p-10 bg-gray-50 rounded-xl border border-gray-200 text-center">
                <p className="text-gray-500">No verified records found for this filter.</p>
                <p className="text-xs text-gray-400 mt-2">(Note: Pending waste requests are hidden until collected)</p>
             </div>
          )}
          
          {filteredActivities.map((item) => (
            <div key={item.id} className="relative ml-6 group">
              {/* Timeline Dot */}
              <span className={`absolute -left-[33px] top-6 w-4 h-4 rounded-full border-2 border-white shadow-sm z-10 ${
                isWaste(item.type) ? 'bg-green-500' : 'bg-blue-500'
              }`}></span>

              {/* Card */}
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition hover:border-green-200">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg flex items-center gap-2 text-gray-900">
                    {/* Icon Logic */}
                    {isWaste(item.type) ? <Recycle className="h-5 w-5 text-green-600" /> : <Leaf className="h-5 w-5 text-blue-500" />}
                    
                    {/* 🟢 NEW: Smart Title Renaming */}
                    {getTitle(item)}
                  </h3>
                  <span className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Description Logic */}
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {isWaste(item.type) 
                    ? `Verified recovery of ${item.collected_weight}kg. Material has been sent for recycling/processing.`
                    : item.description || "Campus sustainability initiative recorded."}
                </p>

                <div className="flex gap-2 items-center">
                  {/* Status Badge */}
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded uppercase tracking-wide ${
                    isWaste(item.type) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isWaste(item.type) ? 'COMPLETED' : 'INITIATIVE'}
                  </span>
                  
                  {/* Quality Badge (Only for waste) */}
                  {item.segregation_rating > 0 && (
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded bg-yellow-50 text-yellow-700 border border-yellow-100 flex items-center gap-1">
                      {item.segregation_rating} ★ Quality
                    </span>
                  )}

                  {/* Receipt Link */}
                  {item.status === 'collected' && (
                    <span className="ml-auto text-xs text-green-700 font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Verified Record
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}