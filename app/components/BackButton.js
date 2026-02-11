'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ href = '/dashboard' }) {
  const router = useRouter()

  return (
    <button 
      onClick={() => router.push(href)}
      className="flex items-center text-gray-500 hover:text-green-600 transition mb-6 font-bold group"
    >
      <div className="p-2 bg-white rounded-full shadow-sm border border-gray-200 group-hover:border-green-500 mr-3">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition" />
      </div>
      <span className="group-hover:underline">Back</span>
    </button>
  )
}