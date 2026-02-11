'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation' // Import router
import { Plus, FileText, Trash2, Eye, X, ArrowLeft } from 'lucide-react' // Import ArrowLeft

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DocumentVault() {
  const router = useRouter() // Initialize router
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)

  useEffect(() => {
    fetchDocuments()
  }, [])

  async function fetchDocuments() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('institution_documents')
      .select('*')
      .eq('institution_id', user.id)
      .order('uploaded_at', { ascending: false })

    if (data) setDocs(data)
    setLoading(false)
  }

  async function handleUpload() {
    if (!file || !title) return alert("Please select a file and enter a title.")
    setUploading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const fileName = `${user.id}/${Date.now()}_${file.name}`
      
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName)

      const { error: dbError } = await supabase
        .from('institution_documents')
        .insert([
          {
            institution_id: user.id,
            title: title,
            file_url: urlData.publicUrl,
            file_type: file.type,
            file_size: (file.size / 1024).toFixed(2) + ' KB'
          }
        ])

      if (dbError) throw dbError

      alert("Document uploaded successfully!")
      setShowModal(false)
      setTitle('')
      setFile(null)
      fetchDocuments()

    } catch (error) {
      console.error("Error:", error)
      alert("Upload Failed: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this document?")) return

    const { error } = await supabase
      .from('institution_documents')
      .delete()
      .eq('id', id)

    if (error) alert("Delete failed: " + error.message)
    else fetchDocuments()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      
      {/* 🟢 NEW: BACK BUTTON */}
      <button 
        onClick={() => router.back()} 
        className="mb-6 flex items-center text-gray-500 hover:text-gray-800 transition font-medium"
      >
        <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
      </button>

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Document Vault</h1>
          <p className="text-gray-500">Manage your compliance certificates and reports</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 transition shadow-md font-bold"
        >
          <Plus className="h-5 w-5" /> Upload Document
        </button>
      </div>

      {/* Document Grid */}
      {loading ? (
        <p className="text-gray-400">Loading documents...</p>
      ) : docs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-400">No documents found. Upload one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 truncate max-w-[150px]">{doc.title}</h3>
                  <p className="text-xs text-gray-400">
                    {doc.file_size} • {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={doc.file_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                >
                  <Eye className="h-5 w-5" />
                </a>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Upload New Document</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Annual Waste Audit 2024"
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                <input 
                  type="file" 
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
            </div>

            <div className="p-6 bg-gray-50 flex justify-end gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpload}
                disabled={uploading}
                className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg hover:bg-green-800 disabled:opacity-50 transition shadow-sm"
              >
                {uploading ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}