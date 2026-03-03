import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Users, Settings } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", icon: <LayoutDashboard size={20} />, text: "Dashboard" },
    { to: "/data-feed", icon: <Wallet size={20} />, text: "Data Feed" },
    { to: "#", icon: <PieChart size={20} />, text: "Analytics" },
    { to: "#", icon: <Users size={20} />, text: "Audiences" },
  ];

  return (
    <aside className="w-64 h-screen bg-white/[0.02] backdrop-blur-xl border-r border-white/10 flex flex-col relative z-10 shadow-2xl shrink-0">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-lime-400 to-emerald-600 rounded-xl flex items-center justify-center text-black font-black text-xl shadow-[0_0_15px_rgba(163,230,53,0.2)]">h</div>
        <span className="text-2xl font-bold tracking-wider text-white">hisab.ai</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item, idx) => {
          const isActive = location.pathname === item.to;
          return (
            <Link 
              key={idx}
              to={item.to} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive 
                ? 'bg-lime-400/10 text-lime-400 border border-lime-400/20 shadow-lg' 
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.text}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <Link to="#" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 transition-all">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}