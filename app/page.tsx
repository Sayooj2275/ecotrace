'use client'
import Link from 'next/link'
import { Leaf, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center">
      <div className="text-center max-w-2xl px-4">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <Leaf className="h-12 w-12 text-green-600" />
          </div>
        </div>
        
        {/* Title */}
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          EcoTrace
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          The verified sustainability compliance platform.
        </p>
        
        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <Link 
            href="/login" 
            className="px-8 py-3 bg-green-700 text-white rounded-lg font-semibold hover:bg-green-800 transition flex items-center shadow-md"
          >
            Login to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link 
            href="/signup" 
            className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Create Account
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-gray-400 text-sm">
        © 2026 EcoTrace Compliance Systems
      </div>
    </div>
  )
}