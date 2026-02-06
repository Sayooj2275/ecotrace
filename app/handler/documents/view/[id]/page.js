'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, Upload, Trash2, Eye, ChevronRight } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function MyDocuments() {
  const router = useRouter()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => { loadDocs() }, [])

  async function loadDocs() {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('handler_documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false })
    if (data) setDocs(data)
    setLoading(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage.from('handler-docs').upload(fileName, file)
    
    if (uploadError) { 
        alert("Upload failed: " + uploadError.message); 
        setUploading(false); 
        return 
    }

    const { data: urlData } = supabase.storage.from('handler-docs').getPublicUrl(fileName)

    await supabase.from('handler_documents').insert({
      user_id: user.id,
      title: title,
      file_url: urlData.publicUrl
    })

    setTitle(''); setFile(null); setUploading(false); loadDocs()
  }

  return (
    // Force the background of the whole page to be light gray
    <div className="min-h-screen bg-gray-100 p-6" style={{ backgroundColor: '#f3f4f6' }}>
      
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 bg-white p-2 rounded-full shadow-sm text-gray-600 hover:text-black hover:bg-gray-200 transition">
            <ArrowLeft className="h-5 w-5" style={{ color: 'black' }} />
        </button>
        {/* Force Title Black */}
        <h1 className="text-2xl font-bold" style={{ color: 'black' }}>My Certificates</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8" style={{ backgroundColor: 'white' }}>
        <h3 className="font-bold mb-4 flex items-center" style={{ color: 'black' }}>
            <Upload className="h-5 w-5 mr-2 text-green-700" /> Upload New Document
        </h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          
          {/* NUCLEAR INPUT FIX */}
          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block" style={{ color: '#4b5563' }}>Document Title</label>
            <input 
                type="text" 
                placeholder="e.g. Driving License" 
                className="w-full p-4 border-2 border-gray-300 rounded-lg outline-none font-medium"
                // INLINE STYLES OVERRIDE EVERYTHING
                style={{ 
                    color: 'black', 
                    backgroundColor: '#ffffff', 
                    borderColor: '#d1d5db' 
                }}
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1 block" style={{ color: '#4b5563' }}>Select Image</label>
            <input 
                type="file" 
                accept="image/*"
                className="w-full text-sm font-bold file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-green-100 file:text-green-800 hover:file:bg-green-200 cursor-pointer rounded-lg border-2 border-gray-200 p-2"
                // INLINE STYLES FOR FILE INPUT
                style={{ 
                    color: 'black', 
                    backgroundColor: '#ffffff' 
                }}
                onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button 
            disabled={uploading || !file || !title} 
            className="w-full text-white font-bold py-4 rounded-lg disabled:opacity-50 transition shadow-xl mt-4"
            style={{ backgroundColor: 'black' }}
          >
            {uploading ? 'Uploading...' : 'Save Document'}
          </button>
        </form>
      </div>

      <div className="space-y-3">
        {loading ? <p className="text-center" style={{ color: 'gray' }}>Loading...</p> : docs.length === 0 ? (
            <div className="text-center py-8">
                <p className="text-sm" style={{ color: 'gray' }}>No certificates uploaded yet.</p>
            </div>
        ) : (
            docs.map(doc => (
                <Link href={`/handler/documents/view/${doc.id}`} key={doc.id}>
                <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center border-l-4 border-purple-600 hover:bg-gray-50 transition cursor-pointer mb-3 group" style={{ backgroundColor: 'white' }}>
                    <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <FileText className="h-6 w-6 text-purple-700" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg" style={{ color: 'black' }}>{doc.title}</h4>
                        <p className="text-xs" style={{ color: 'gray' }}>{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                    </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-300 group-hover:text-purple-600 transition" />
                </div>
                </Link>
            ))
        )}
      </div>
    </div>
  )
}