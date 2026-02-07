'use client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Leaf, Shield, Truck, BarChart3, CheckCircle } from 'lucide-react'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-green-600 rounded-lg flex items-center justify-center text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">EcoTrace</span>
          </div>
          <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-green-600 transition">Features</a>
            <a href="#impact" className="hover:text-green-600 transition">Our Impact</a>
          </div>
          <button 
            onClick={() => router.push('/login')}
            className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition"
          >
            Login
          </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-6 uppercase tracking-wide">
            Kerala's #1 Waste Tracking Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 leading-tight">
            Compliance made <span className="text-green-600">simple</span>.<br/>
            Sustainability made <span className="text-green-600">real</span>.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            The official digital platform for institutions to track waste disposal, verify handler pickups, and generate government-compliant sustainability reports.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-green-600 text-white rounded-xl font-bold text-lg hover:bg-green-700 transition shadow-lg shadow-green-200 flex items-center justify-center"
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button 
              onClick={() => router.push('/login')}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition flex items-center justify-center"
            >
              Login to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* --- FEATURES --- */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <BarChart3 className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Real-time Reports</h3>
                <p className="text-gray-600 mt-2">Generate audit-ready PDF reports for NAAC instantly.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <Shield className="h-10 w-10 text-blue-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Secure Verification</h3>
                <p className="text-gray-600 mt-2">OTP-based driver verification ensures 100% data integrity.</p>
            </div>
            <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
                <Truck className="h-10 w-10 text-orange-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Handler Tracking</h3>
                <p className="text-gray-600 mt-2">Connect with government-certified waste handlers easily.</p>
            </div>
        </div>
      </section>

    </div>
  )
}