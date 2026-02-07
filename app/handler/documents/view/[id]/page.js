'use client'
import { useEffect, useState, use } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Trash2, Calendar, FileText, Download, AlertCircle } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function ViewDocument({ params }) {
  const { id } = use(params)
  const router = useRouter()
  const [doc, setDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDoc() {
      const { data, error } = await supabase
        .from('handler_documents')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) {
        alert("Error loading document")
        router.back()
      } else {
        setDoc(data)
      }
      setLoading(false)
    }
    loadDoc()
  }, [id])

  const handleDelete = async () => {
    if(!confirm("Are you sure you want to delete this document?")) return
    await supabase.from('handler_documents').delete().eq('id', id)
    router.replace('/handler/documents')
  }

  // Helper to check if file is PDF
  const isPdf = (url) => url?.toLowerCase().includes('.pdf')

  if (loading || !doc) return <div className="p-10 text-center text-white">Loading Document...</div>

  return (
    <div className="min-h-screen bg-black flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-gray-900 p-4 flex justify-between items-center text-white border-b border-gray-800">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-full transition">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="font-bold text-lg truncate max-w-[200px]">{doc.title}</h1>
        <button onClick={handleDelete} className="p-2 hover:bg-red-900 text-red-400 rounded-full transition">
          <Trash2 className="h-6 w-6" />
        </button>
      </div>

      {/* DOCUMENT VIEWER */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-900/50">
        {isPdf(doc.file_url) ? (
          // PDF VIEWER
          <iframe 
            src={`${doc.file_url}#toolbar=0`} 
            className="w-full h-[80vh] rounded-lg shadow-2xl border border-gray-700 bg-white"
            title="PDF Viewer"
          />
        ) : (
          // IMAGE VIEWER
          <img 
            src={doc.file_url} 
            alt={doc.title} 
            className="max-w-full max-h-[80vh] rounded-lg shadow-2xl border border-gray-800 object-contain"
          />
        )}
      </div>

      {/* Bottom Info Bar */}
      <div className="bg-white p-6 rounded-t-2xl">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center text-gray-700">
                <FileText className="h-5 w-5 mr-2 text-green-600"/>
                <span className="font-bold">{doc.title}</span>
            </div>
            <a href={doc.file_url} download target="_blank" className="bg-gray-100 p-2 rounded-full text-gray-600 hover:bg-green-100 hover:text-green-700 transition">
                <Download className="h-5 w-5" />
            </a>
        </div>
        
        <div className="flex items-center text-gray-400 text-sm">
            <Calendar className="h-4 w-4 mr-2" />
            Uploaded on {new Date(doc.uploaded_at).toLocaleDateString()}
        </div>
      </div>

    </div>
  )
}