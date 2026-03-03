import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { 
  Database, ShieldCheck, AlertCircle, Clock, CheckCircle2, 
  Sparkles, X, Search, Filter, AlertTriangle 
} from 'lucide-react'; 
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

export default function DataFeed() {
  const [dataset, setDataset] = useState({ fileName: "", headers: [], rawData: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [nlFilter, setNlFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/files/latest');
        const data = await res.json();
        if (data && data.rawData) setDataset({ fileName: data.fileName, headers: data.headers, rawData: data.rawData });
      } catch (e) { console.warn("Syncing..."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const filteredRows = useMemo(() => {
    let rows = dataset.rawData;
    if (searchQuery) {
      rows = rows.filter(row => Object.values(row).some(v => v?.toString().toLowerCase().includes(searchQuery.toLowerCase())));
    }
    if (nlFilter.includes(' ')) {
      const parts = nlFilter.toLowerCase().split(' ');
      const targetHeader = dataset.headers.find(h => nlFilter.toLowerCase().includes(h.toLowerCase().replace(/_/g, ' ')));
      if (targetHeader) {
        const operator = parts.find(p => ['>', '<', '=', 'is'].includes(p));
        const val = parts[parts.length - 1];
        rows = rows.filter(r => {
          const cell = r[targetHeader];
          if (operator === '>') return Number(cell) > Number(val);
          if (operator === '<') return Number(cell) < Number(val);
          if (operator === '=' || operator === 'is') return cell?.toString().toLowerCase() === val.toLowerCase();
          return true;
        });
      }
    }
    return rows;
  }, [dataset, searchQuery, nlFilter]);

  const audit = useMemo(() => {
    const { headers, rawData } = dataset;
    if (!headers || !rawData.length) return null;
    let missing = 0;
    const typeCounts = { Numeric: 0, Categorical: 0, Temporal: 0 };
    const issues = [];
    headers.forEach(h => {
      let n = 0, s = 0, e = 0;
      rawData.forEach(r => { if (!r[h]) e++; else if (!isNaN(Number(r[h]))) n++; else s++; });
      missing += e;
      if (h.toLowerCase().includes('date')) typeCounts.Temporal++; else if (n > s) typeCounts.Numeric++; else typeCounts.Categorical++;
      if (n > 0 && s > 0 && !h.toLowerCase().includes('id')) issues.push({ column: h, issue: "Mixed Types" });
    });
    const total = headers.length * rawData.length;
    return { missing, score: total > 0 ? ((total - missing) / total * 100).toFixed(1) : 0, typeData: Object.keys(typeCounts).map(k => ({ name: k, value: typeCounts[k] })), issues };
  }, [dataset]);

  return (
    <div className="min-h-screen bg-[#0a0b10] flex overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto relative">
        <Navbar title="Data Management" fileName={dataset.fileName} loading={loading} />
        <div className="p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-lime-400/50 transition-all" placeholder="Global Scoping Across All Columns..." />
                {searchQuery && <X onClick={() => setSearchQuery("")} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-white" />}
             </div>
             <div className="relative group">
                <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" size={18} />
                <input value={nlFilter} onChange={(e) => setNlFilter(e.target.value)} className="w-full bg-purple-500/5 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-4 text-xs text-white outline-none focus:border-purple-500/50 transition-all" placeholder="Agent Logic (e.g. Gross Revenue > 500000)..." />
                {nlFilter && <X onClick={() => setNlFilter("")} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-white" />}
             </div>
          </div>

          {audit && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-white"><ShieldCheck size={120} /></div>
                  <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">Integrity Score</h3>
                  <div className="text-7xl font-black text-white">{audit.score}<span className="text-lime-400 text-3xl">%</span></div>
                  <div className="mt-8 flex items-center gap-2 text-xs text-gray-400"><CheckCircle2 size={14} className="text-lime-400" /> Validation Active</div>
                </div>
                <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl h-64">
                   <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={audit.typeData} innerRadius={50} outerRadius={70} dataKey="value" stroke="none">{audit.typeData.map((e, i) => <Cell key={i} fill={['#a3e635', '#8b5cf6', '#3b82f6'][i % 3]} />)}</Pie><RechartsTooltip contentStyle={{ background: '#111', border: 'none' }} /><Legend iconType="circle" /></PieChart></ResponsiveContainer>
                </div>
                <div className="bg-white/[0.02] border border-white/10 p-8 rounded-3xl overflow-y-auto max-h-64 custom-scrollbar">
                  <h3 className="text-gray-500 text-[10px] font-bold uppercase mb-4 text-red-400 flex items-center gap-2"><AlertTriangle size={14}/> Audit Warnings</h3>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5 mb-4 text-white">
                    <span className="text-[10px] text-gray-400 flex items-center gap-2 uppercase tracking-widest"><Clock size={12}/> Null Values:</span>
                    <span className="font-mono text-xs text-purple-400">{audit.missing} Cells</span>
                  </div>
                  {audit.issues.map((iss, i) => (
                    <div key={i} className="flex gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10 mb-2">
                      <AlertCircle size={16} className="text-red-400 shrink-0" />
                      <div className="text-white"><p className="text-[11px] font-bold">{iss.column}</p><p className="text-[10px] text-gray-500">{iss.issue}</p></div>
                    </div>
                  ))}
                </div>
            </div>
          )}

          <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden shadow-2xl pb-20">
            <div className="p-6 border-b border-white/10 flex justify-between bg-white/[0.01]">
                <h3 className="font-bold flex items-center gap-2 text-sm text-white"><Database size={16} className="text-lime-400" /> Result Stream</h3>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-mono text-gray-500 uppercase flex items-center gap-1.5"><Filter size={12} /> Showing {filteredRows.length} rows</span>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] custom-scrollbar">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-[#0d0f17] z-10 text-white">
                  <tr>{dataset.headers.map((h, i) => <th key={i} className="p-4 text-[10px] font-bold text-gray-500 uppercase border-b border-white/10 whitespace-nowrap">{h.replace(/_/g, ' ')}</th>)}</tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, r) => (
                    <tr key={r} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      {dataset.headers.map((h, c) => <td key={c} className={`p-4 text-[11px] font-mono whitespace-nowrap border-r border-white/5 ${searchQuery && row[h]?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ? 'bg-lime-400/20 text-white font-bold' : 'text-gray-400'}`}>{row[h] || "NULL"}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}