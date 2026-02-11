'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ArrowLeft, FileText, Upload, Trash2, Eye } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function MyDocuments() {
  const router = useRouter()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  
  // Upload State
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    loadDocs()
  }, [])

  async function loadDocs() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase.from('handler_documents').select('*').eq('user_id', user.id)
    if (data) setDocs(data)
    setLoading(false)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) return
    setUploading(true)

    const { data: { user } } = await supabase.auth.getUser()
    
    // 1. Upload File
    const fileName = `${user.id}/${Date.now()}_${file.name}`
    
    // 🔴 FIX: Changed 'handler-docs' to 'documents' to match your SQL Script
    const { error: uploadError } = await supabase.storage
      .from('documents') 
      .upload(fileName, file)
    
    if (uploadError) {
      console.error("Upload Error:", uploadError)
      alert("Upload failed! " + uploadError.message)
      setUploading(false)
      return
    }

    // 2. Get URL
    // 🔴 FIX: Changed 'handler-docs' to 'documents' here too
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName)

    // 3. Save to DB
    const { error: dbError } = await supabase.from('handler_documents').insert({
      user_id: user.id,
      title: title,
      file_url: urlData.publicUrl
    })

    if (dbError) {
        alert('File uploaded but database save failed: ' + dbError.message)
    }

    // Reset
    setTitle('')
    setFile(null)
    setUploading(false)
    loadDocs() // Refresh list
  }

  const handleDelete = async (id) => {
    if(!confirm("Delete this document?")) return
    await supabase.from('handler_documents').delete().eq('id', id)
    loadDocs()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={() => router.back()} className="mr-4 bg-white p-2 rounded-full shadow-sm text-gray-500 hover:text-gray-800 transition">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center">
          <Upload className="h-5 w-5 mr-2 text-green-600" /> Upload New Document
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">Document Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Driving License, Pollution Permit"
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-green-500 mt-1 transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase">File</label>
            <input 
              required
              type="file" 
              className="w-full mt-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>
          <button 
            disabled={uploading || !file} 
            className="w-full bg-black text-white font-bold py-3 rounded-lg disabled:opacity-50 hover:bg-gray-800 transition"
          >
            {uploading ? 'Uploading...' : 'Save Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {loading ? <p className="text-center text-gray-400">Loading...</p> : docs.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
             <p className="text-gray-400">No documents uploaded yet.</p>
          </div>
        ) : (
          docs.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center border-l-4 border-blue-500 hover:shadow-md transition">
              <div className="flex items-center">
                <div className="bg-blue-50 p-2 rounded-lg mr-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{doc.title}</h4>
                  <p className="text-xs text-gray-400">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <a href={doc.file_url} target="_blank" className="p-2 text-gray-400 hover:text-blue-600 transition">
                  <Eye className="h-5 w-5" />
                </a>
                <button onClick={() => handleDelete(doc.id)} className="p-2 text-gray-400 hover:text-red-600 transition">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}