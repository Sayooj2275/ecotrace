'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle, Lock, Leaf, Info, Bell } from 'lucide-react'

export default function CreditReadiness() {
  const router = useRouter()
  const [notified, setNotified] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <button onClick={() => router.push('/dashboard')} className="flex items-center text-gray-500 hover:text-gray-800 transition font-medium mb-4">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Carbon & EPR Credit Readiness</h1>
            <span className="bg-gray-200 text-gray-600 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Coming Soon</span>
        </div>
        <p className="text-gray-500 mt-2">
          Understanding how EcoTrace preserves your data for future monetization.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. The Problem */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Why most institutions miss out on credits</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Credits are not awarded for "being green." They are awarded for <strong>provable data</strong>. Most institutions fail to monetize sustainability because:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-2 ml-2">
                        <li>Sustainability actions are not recorded consistently.</li>
                        <li>Waste handling is not verifiable by third parties.</li>
                        <li>Proof is scattered across emails and paper files.</li>
                    </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-lg border border-red-100 flex items-center justify-center text-center">
                    <p className="text-red-800 font-medium italic">
                        "Credit agencies require historical, auditable data chains, not last-minute claims."
                    </p>
                </div>
            </div>
        </div>

        {/* 2. EcoTrace's Role */}
        <div className="bg-blue-900 text-white p-8 rounded-xl shadow-lg border border-blue-800 relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-300" /> EcoTrace’s Infrastructure Role
                </h2>
                <p className="text-blue-100 leading-relaxed mb-6">
                    EcoTrace does not issue Carbon or EPR credits today. Instead, <strong>EcoTrace builds and preserves the verified data infrastructure</strong> required for authorized agencies to certify credits in the future.
                </p>
                <div className="flex gap-4">
                    <div className="bg-blue-800/50 p-4 rounded-lg flex-1 border border-blue-700">
                        <p className="font-bold text-sm mb-1 text-blue-200">We Do</p>
                        <p className="text-xs text-blue-300">Preserve verified waste logs, photos, and handler confirmations.</p>
                    </div>
                    <div className="bg-blue-800/50 p-4 rounded-lg flex-1 border border-blue-700">
                        <p className="font-bold text-sm mb-1 text-blue-200">We Don't</p>
                        <p className="text-xs text-blue-300">Invent numbers, estimate carbon arbitrarily, or sell credits directly.</p>
                    </div>
                </div>
            </div>
            <Leaf className="absolute right-0 bottom-0 h-48 w-48 text-blue-800 opacity-20 transform translate-x-10 translate-y-10" />
        </div>

        {/* 3. Comparison Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                    <tr>
                        <th className="p-5">Credit Type</th>
                        <th className="p-5">Depends On</th>
                        <th className="p-5">Why EcoTrace Matters</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    <tr>
                        <td className="p-5 font-bold text-gray-800">Carbon Credits</td>
                        <td className="p-5 text-gray-600">Long-term sustainability actions (Trees, Solar)</td>
                        <td className="p-5 text-gray-600">Creates activity timelines, proof, and continuity data.</td>
                    </tr>
                    <tr>
                        <td className="p-5 font-bold text-gray-800">EPR Credits</td>
                        <td className="p-5 text-gray-600">Verified Plastic & E-Waste handling</td>
                        <td className="p-5 text-gray-600">Provides OTP verification and Handler confirmation.</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* 4. Call to Action */}
        <div className="bg-gray-100 rounded-xl p-8 text-center border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-2">Register for Future Enablement</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-lg mx-auto">
                Carbon & EPR enablement will be activated once sufficient verified data and participating institutions are available.
            </p>
            
            {notified ? (
                <button disabled className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 mx-auto cursor-default shadow-sm">
                    <CheckCircle className="h-5 w-5" /> Interest Registered
                </button>
            ) : (
                <button 
                    onClick={() => setNotified(true)}
                    className="bg-gray-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-black transition flex items-center gap-2 mx-auto shadow-lg"
                >
                    <Bell className="h-4 w-4" /> Notify Me When Credits Open
                </button>
            )}
        </div>

      </div>
    </div>
  )
}