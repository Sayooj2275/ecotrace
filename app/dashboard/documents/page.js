'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { Upload, FileText, Image as ImageIcon, File, Download, Filter, ArrowLeft } from 'lucide-react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function DocumentVault() {
  const router = useRouter() // <--- NEW: Needed for navigation
  const [docs, setDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    fetchDocs()
  }, [])

  async function fetchDocs() {
    const { data: { user } } = await supabase.auth.getUser()
    if(!user) return
    const { data } = await supabase.from('institution_documents').select('*').eq('institution_id', user.id).order('uploaded_at', { ascending: false })
    setDocs(data || [])
  }

  const handleUpload = async () => {
    if (!file || !title) return alert("Please select a file and give it a name.")
    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('institution-docs').upload(fileName, file)
      if (uploadError) throw uploadError
      
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/institution-docs/${fileName}`
      const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + ' MB'
      
      const { error: dbError } = await supabase.from('institution_documents').insert({
        institution_id: user.id, title: title, file_url: fileUrl, file_type: fileExt.toUpperCase(), file_size: sizeInMB
      })
      if (dbError) throw dbError

      alert("Document Saved!")
      setIsUploadModalOpen(false)
      setFile(null)
      setTitle('')
      fetchDocs()
    } catch (error) {
      alert("Error: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  const getFileIcon = (type) => {
    if (['JPG', 'PNG', 'JPEG'].includes(type)) return <ImageIcon className="h-8 w-8 text-gray-500" />
    if (['PDF'].includes(type)) return <FileText className="h-8 w-8 text-red-500" />
    return <File className="h-8 w-8 text-blue-500" />
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
            {/* NEW BACK BUTTON */}
            <button onClick={() => router.push('/dashboard')} className="bg-white p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
            </button>
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Document Vault</h1>
                <p className="text-gray-500">Manage your compliance certificates and reports</p>
            </div>
        </div>
        <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition flex items-center shadow-md"
        >
            <Upload className="h-4 w-4 mr-2" /> Upload Document
        </button>
      </div>

      {/* FILTERS TOOLBAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 flex justify-between items-center">
        <div className="flex items-center space-x-4">
             <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <select className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>All Documents</option>
                    <option>PDFs</option>
                    <option>Images</option>
                </select>
             </div>
        </div>
        <div className="text-gray-400 text-sm">{docs.length} Documents Found</div>
      </div>

      {/* DOCUMENTS GRID */}
      {docs.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
            <div className="bg-gray-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <File className="h-10 w-10 text-gray-300" />
            </div>
            <p>No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {docs.map((doc) => (
                <div key={doc.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition flex flex-col justify-between h-48 group">
                    <div className="flex justify-between items-start">
                        <div className="bg-gray-50 p-3 rounded-lg">{getFileIcon(doc.file_type)}</div>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">{doc.file_type}</span>
                    </div>
                    <div className="mt-4"><h3 className="font-bold text-gray-800 text-sm line-clamp-2" title={doc.title}>{doc.title}</h3></div>
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div className="text-xs text-gray-400"><p>{doc.file_size}</p><p>{new Date(doc.uploaded_at).toLocaleDateString()}</p></div>
                        <a href={doc.file_url} target="_blank" download className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-blue-50 hover:text-blue-600 transition"><Download className="h-4 w-4" /></a>
                    </div>
                </div>
            ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <h2 className="text-xl font-bold mb-6 text-gray-800">Upload New Document</h2>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label><input type="text" className="w-full p-3 border border-gray-300 rounded-lg text-black" placeholder="e.g. Q1 Report" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1">Select File</label><input type="file" className="w-full p-2 border border-gray-300 rounded-lg text-sm text-gray-600" onChange={(e) => setFile(e.target.files[0])} /></div>
                </div>
                <div className="mt-8 flex justify-end space-x-3">
                    <button onClick={() => setIsUploadModalOpen(false)} className="px-5 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={handleUpload} disabled={uploading} className="px-5 py-2 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 flex items-center">{uploading ? 'Uploading...' : 'Save Document'}</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}