'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Calendar, Users, Leaf, User } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ActivitiesPage() {
  const router = useRouter()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    // 🟢 SAFE USER CHECK
    const { data: { user }, error } = await supabase.auth.getUser()
    
    // If no user found, redirect to login instead of crashing
    if (error || !user) {
      router.push('/login')
      return
    }
    
    const { data } = await supabase
      .from('campus_events')
      .select('*')
      .eq('institution_id', user.id)
      .order('event_date', { ascending: false })
    
    if (data) setEvents(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <button 
            onClick={() => router.push('/dashboard')} 
            className="flex items-center text-gray-500 hover:text-gray-800 transition font-medium"
        >
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </button>

        <button 
            onClick={() => router.push('/dashboard/activities/create')}
            className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg font-bold shadow-sm transition flex items-center gap-2"
        >
            <Plus className="h-4 w-4" /> Log New Event
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Campus Initiatives</h1>
        <p className="text-gray-500 mt-1">Track your seminars, workshops, and green drives.</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading events...</p>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Leaf className="h-12 w-12 text-green-200 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-600">No Events Logged Yet</h3>
          <p className="text-gray-400">Start logging your sustainable activities to earn credits.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden">
              
              {/* Image Display */}
              {event.image_url ? (
                <div className="h-48 w-full bg-gray-100 relative">
                    <img 
                        src={event.image_url} 
                        alt={event.title} 
                        className="w-full h-full object-cover"
                    />
                </div>
              ) : (
                <div className="h-48 w-full bg-green-50 flex items-center justify-center">
                    <Leaf className="h-12 w-12 text-green-200" />
                </div>
              )}

              <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                      Event
                    </span>
                    <span className="text-gray-400 text-sm flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center text-gray-500 text-sm font-medium">
                        <Users className="h-4 w-4 mr-2 text-blue-500" />
                        {event.participants} Students
                    </div>
                    {event.faculty_name && (
                        <div className="flex items-center text-gray-500 text-sm font-medium">
                            <User className="h-4 w-4 mr-2 text-purple-500" />
                            {event.faculty_name}
                        </div>
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