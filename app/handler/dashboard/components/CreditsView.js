'use client'
import { ShieldCheck, Leaf, TrendingUp, Lock } from 'lucide-react'

export default function CreditsView() {
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4">
        <h2 className="text-2xl font-bold text-white">Carbon & EPR Credit Readiness</h2>
        
        {/* Hero Card */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center relative overflow-hidden">
            <div className="relative z-10">
                <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <TrendingUp className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Carbon & EPR Credit Readiness</h3>
                <span className="bg-green-900/50 text-green-400 border border-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">Coming Soon</span>
                
                <p className="text-gray-400 max-w-lg mx-auto leading-relaxed mt-4">
                    Your verified waste collection records are being securely preserved as auditable sustainability data. In the future, this data can be used to support Carbon and EPR credit certification through authorized agencies.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <button className="text-white bg-green-700 font-bold text-sm px-6 py-3 rounded-lg hover:bg-green-600 transition shadow-lg shadow-green-900/20">
                        Join Waitlist
                    </button>
                    <button className="text-gray-400 font-bold text-sm border border-gray-700 px-6 py-3 rounded-lg hover:bg-gray-800 transition cursor-not-allowed flex items-center gap-2">
                        <Lock className="h-4 w-4" /> Credit Enablement Not Active
                    </button>
                </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <ShieldCheck className="h-8 w-8 text-blue-500 mb-4" />
                <h4 className="font-bold text-white mb-2">Verified Audit Trail</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Every OTP-verified pickup creates an immutable, time-stamped audit trail that strengthens documentation for compliance, audits, and future credit certification.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <Leaf className="h-8 w-8 text-green-500 mb-4" />
                <h4 className="font-bold text-white mb-2">EPR Compliance</h4>
                <p className="text-xs text-gray-400 leading-relaxed">Helps waste handlers maintain organized, verifiable recovery records aligned with Extended Producer Responsibility (EPR) documentation requirements.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <TrendingUp className="h-8 w-8 text-yellow-500 mb-4" />
                <h4 className="font-bold text-white mb-2">Future Credit Value Participation</h4>
                <p className="text-xs text-gray-400 leading-relaxed">When Carbon and EPR credit enablement is activated through authorized partners, handlers with consistent, verified records may become eligible to participate in the value generated.</p>
            </div>
        </div>
    </div>
  )
}