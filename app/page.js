import Link from 'next/link'
import { ArrowRight, Leaf, ShieldCheck, BarChart3, Lock, CheckCircle } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-green-100 selection:text-green-900">
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-2 rounded-lg text-white">
            <Leaf className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">EcoTrace</span>
        </div>
        
        <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500">
          <a href="#features" className="hover:text-green-700 transition">Features</a>
          <a href="#impact" className="hover:text-green-700 transition">Our Impact</a>
        </div>

        <Link href="/login">
          <button className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-black transition shadow-lg shadow-gray-200">
            Login
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
          Compliance made <span className="text-green-600">simple</span>. <br/>
          Sustainability made <span className="text-green-600">real</span>.
        </h1>
        
        <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          The official digital platform for institutions to track waste disposal, verify handler pickups, and generate government-compliant sustainability reports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/signup">
            <button className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition flex items-center gap-2 shadow-xl shadow-green-100 transform hover:-translate-y-1">
              Get Started <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
          <Link href="/login">
            <button className="px-8 py-4 rounded-full font-bold text-lg text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-400 transition bg-white">
              Login to Dashboard
            </button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-24 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12">
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Leaf className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Waste Tracking</h3>
              <p className="text-gray-500 leading-relaxed">
                Log daily waste generation across categories like plastic, e-waste, and organic matter with ease.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Pickups</h3>
              <p className="text-gray-500 leading-relaxed">
                Ensure accountability with OTP-based handler verification. No more fake disposal records.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Auto-Reports</h3>
              <p className="text-gray-500 leading-relaxed">
                One-click generation of NAAC & environmental audit reports compliant with state regulations.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Carbon & EPR Credit Readiness Section */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12">
            
            <div className="flex-1">
                <div className="inline-flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-green-400 mb-6 border border-gray-700">
                    <Lock className="h-3 w-3" /> Coming Soon
                </div>
                <h2 className="text-4xl font-bold mb-6">Carbon & EPR Credit Readiness</h2>
                <p className="text-gray-400 text-lg leading-relaxed mb-6">
                    Most institutions miss out on Carbon and EPR credits not because they are ineligible, but because they lack structured, verified, and auditable data.
                </p>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                    EcoTrace is building the foundation required to make sustainability actions credit-ready by preserving verified records, waste confirmations, and activity timelines.
                </p>
                <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold text-white italic">"Credits are issued later. Evidence must exist today."</p>
                </div>
            </div>

            <div className="flex-1 bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl transform rotate-1 hover:rotate-0 transition duration-500">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-green-500" /> Infrastructure Layer
                </h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <span className="text-gray-300">Verified Logs</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <span className="text-gray-300">Handler Confirmation</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg">
                        <span className="text-gray-300">Audit Trail Preservation</span>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-900 rounded-lg opacity-50">
                        <span className="text-gray-500">Credit Monetization</span>
                        <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                </div>
            </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400 text-sm border-t border-gray-100">
        <p>© 2026 EcoTrace Platform. All rights reserved.</p>
      </footer>
    </div>
  )
}