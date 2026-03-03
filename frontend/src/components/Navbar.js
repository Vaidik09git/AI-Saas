import React from 'react';
import { Search, Bell, FileCheck } from 'lucide-react';

export default function Navbar({ title, fileName, loading }) {
  return (
    <header className="h-24 px-8 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0a0b10]/80 backdrop-blur-md z-30 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          {title} <FileCheck size={18} className="text-lime-400" />
        </h1>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
          {loading ? "Analyzing Engine..." : `Active Feed: ${fileName || 'Disconnected'}`}
        </p>
      </div>
      
      <div className="flex gap-4 items-center">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
          <input 
            className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:outline-none focus:border-lime-400/50 text-white" 
            placeholder="Search variables..." 
          />
        </div>
        <button className="p-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors">
          <Bell size={18} className="text-gray-400" />
        </button>
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 border border-white/20 shadow-md"></div>
      </div>
    </header>
  );
}