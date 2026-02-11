'use client'
import { LayoutDashboard, Truck, History, FileText, ShieldCheck, TrendingUp, LogOut, Leaf, X } from 'lucide-react'

export default function Sidebar({ activeView, setActiveView, isOpen, setIsOpen, handleSignOut, marketCount }) {
  
  const NavBtn = ({ icon: Icon, label, id, alert }) => (
    <button 
        onClick={() => { setActiveView(id); setIsOpen(false); }}
        className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition relative ${
            activeView === id ? 'bg-green-900/20 text-green-400 border border-green-900' : 'text-gray-400 hover:text-white hover:bg-gray-900'
        }`}
    >
        <Icon className="h-5 w-5" /> {label}
        {alert && <span className="absolute right-3 top-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
    </button>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (<div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsOpen(false)}></div>)}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-gray-950 border-r border-gray-800 p-6 flex flex-col justify-between transform transition-transform z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-2xl font-bold text-green-500 flex items-center gap-2"><Leaf className="h-6 w-6" /> EcoTrace</h1>
                <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400"><X /></button>
            </div>
            <nav className="space-y-2">
                <NavBtn icon={LayoutDashboard} label="Dashboard" id="dashboard" />
                <NavBtn icon={Truck} label="Live Feed" id="feed" alert={marketCount > 0} />
                <NavBtn icon={History} label="History" id="history" />
                <NavBtn icon={FileText} label="Reports" id="reports" />
                <NavBtn icon={ShieldCheck} label="Documents" id="documents" />
                <NavBtn icon={TrendingUp} label="Credit Readiness" id="credits" />
            </nav>
        </div>
        <button onClick={handleSignOut} className="flex items-center gap-3 p-3 rounded-lg text-gray-400 hover:text-white hover:bg-gray-900 transition"><LogOut className="h-5 w-5" /> Sign Out</button>
      </aside>
    </>
  )
}