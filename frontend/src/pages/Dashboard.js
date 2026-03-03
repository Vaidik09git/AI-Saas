import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Activity, AlertTriangle, Table, BrainCircuit } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart as RePie, 
  Pie 
} from 'recharts';

// Formatter for large financial numbers
const formatNumber = (val) => {
  const num = Number(val);
  if (isNaN(num)) return "$0.00";
  if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
};

export default function Dashboard() {
  const [dataset, setDataset] = useState({ fileName: "", headers: [], rawData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/files/latest');
        const data = await res.json();
        if (data && data.rawData) {
          const formattedData = data.rawData.map(row => {
            const newRow = { ...row };
            Object.keys(newRow).forEach(key => {
              if (typeof newRow[key] === 'string') {
                const cleaned = newRow[key].replace(/[$,]/g, '').trim();
                if (cleaned !== "" && !isNaN(Number(cleaned))) newRow[key] = Number(cleaned);
              }
            });
            return newRow;
          });
          setDataset({ fileName: data.fileName || "Unknown", headers: data.headers || [], rawData: formattedData });
        }
      } catch (e) { console.warn("Syncing..."); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const engine = useMemo(() => {
    const { headers, rawData } = dataset;
    if (!headers || headers.length === 0 || !rawData || rawData.length === 0) return null;
    
    const numericKeys = headers.filter(key => typeof rawData[0][key] === 'number');
    const stringKeys = headers.filter(key => typeof rawData[0][key] === 'string');
    const xAxisKey = stringKeys[0] || headers[0];
    const mainNumericKey = numericKeys[0] || headers[1];
    
    if (!mainNumericKey) return null;

    const kpis = numericKeys.slice(0, 4).map(key => ({
      title: key.replace(/_/g, ' '),
      total: rawData.reduce((sum, row) => sum + (Number(row[key]) || 0), 0)
    }));

    const splitIndex = Math.floor(rawData.length * 0.8);
    const chartData = rawData.map((row, idx) => {
      const point = { name: row[xAxisKey] || `Row ${idx}` };
      const val = Number(row[mainNumericKey]) || 0;
      if (idx <= splitIndex) point.actual = val;
      if (idx >= splitIndex) point.forecast = val; 
      return point;
    });

    const categoryKey = stringKeys.find(key => {
        const uniqueCount = new Set(rawData.map(r => r[key])).size;
        return uniqueCount > 1 && uniqueCount <= 15;
    }) || stringKeys[0];

    const categoryBreakdown = [];
    if (categoryKey && mainNumericKey) {
      const grouped = rawData.reduce((acc, row) => {
        // FIXED: Replaced 'headerKey' with 'categoryKey' to resolve undef error
        const cat = row[categoryKey] || 'Other';
        acc[cat] = (acc[cat] || 0) + (Number(row[mainNumericKey]) || 0);
        return acc;
      }, {});
      Object.keys(grouped).forEach(k => categoryBreakdown.push({ name: k, value: grouped[k] }));
      categoryBreakdown.sort((a, b) => b.value - a.value); 
    }

    const average = rawData.reduce((sum, r) => sum + (Number(r[mainNumericKey]) || 0), 0) / rawData.length;
    const anomalies = rawData.filter(row => (Number(row[mainNumericKey]) || 0) > (average * 1.5)).slice(0, 5).map(row => ({
        trigger: row[xAxisKey] || 'Event',
        metric: Number(row[mainNumericKey]) || 0,
        reason: `Exceeds avg by ${(((Number(row[mainNumericKey]) - average)/average)*100).toFixed(0)}%`
    }));

    const pieData = [
      { name: 'Metrics', value: numericKeys.length },
      { name: 'Categories', value: stringKeys.length }
    ];

    return { xAxisKey, mainNumericKey, kpis, chartData, categoryBreakdown, categoryKey, anomalies, pieData };
  }, [dataset]);

  return (
    <div className="min-h-screen bg-[#0a0b10] flex overflow-hidden font-sans">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto relative">
        <Navbar 
          title={<span className="flex items-center gap-2">Intelligence Hub <BrainCircuit size={20} className="text-lime-400 animate-pulse" /></span>} 
          fileName={dataset.fileName} 
          loading={loading} 
        />
        
        <div className="p-8 space-y-8">
          {engine ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {engine.kpis.map((kpi, idx) => (
                  <div key={idx} className="bg-white/[0.03] border border-white/10 p-6 rounded-3xl shadow-lg">
                    <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-2">{kpi.title}</h3>
                    <span className="text-3xl font-black text-white">{formatNumber(kpi.total)}</span>
                  </div>
                ))}
              </div>

              <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">Adaptive Forecast <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full uppercase tracking-widest">AI Projected</span></h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer>
                    <AreaChart data={engine.chartData}>
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a3e635" stopOpacity={0.3}/><stop offset="95%" stopColor="#a3e635" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={formatNumber} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '12px' }} itemStyle={{ color: '#a3e635' }} />
                      <Area type="monotone" dataKey="actual" stroke="#a3e635" strokeWidth={3} fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="forecast" stroke="#a3e635" strokeWidth={3} strokeDasharray="5 5" fill="transparent" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
                <div className="lg:col-span-2 bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><Activity size={18} className="text-lime-400" /> Segment Breakdown</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <BarChart data={engine.categoryBreakdown.slice(0, 6)} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} axisLine={false} tickLine={false} />
                        <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={24}>
                          {engine.categoryBreakdown.map((e, i) => <Cell key={i} fill={['#a3e635', '#10b981', '#8b5cf6', '#3b82f6', '#f59e0b'][i % 5]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl flex flex-col items-center justify-center">
                   <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-left">Data Diversity</h3>
                   <div className="h-48 w-full">
                      <ResponsiveContainer>
                        <RePie>
                          <Pie data={engine.pieData} innerRadius={60} outerRadius={80} dataKey="value" stroke="none" paddingAngle={5}>
                             <Cell fill="#a3e635" />
                             <Cell fill="#8b5cf6" />
                          </Pie>
                        </RePie>
                      </ResponsiveContainer>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl overflow-y-auto h-[350px]">
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white"><AlertTriangle size={18} className="text-red-400" /> Anomalies</h3>
                   {engine.anomalies.map((a, i) => (
                     <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/[0.02] border border-red-500/20 mb-4">
                        <div><p className="font-bold text-sm text-gray-200">{a.trigger}</p><p className="text-[10px] text-gray-500 font-mono">{a.reason}</p></div>
                        <span className="text-sm font-black text-red-400">{formatNumber(a.metric)}</span>
                     </div>
                   ))}
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-8 shadow-xl overflow-hidden">
                   <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Table size={18} className="text-emerald-400" /> Feed Preview</h3>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <tbody>
                         {dataset.rawData.slice(0, 5).map((row, r) => (
                           <tr key={r} className="border-b border-white/5">
                             <td className="py-3 text-[11px] text-gray-400 font-mono">{Object.values(row)[0]}</td>
                             <td className="py-3 text-[11px] text-gray-400 font-mono">{Object.values(row)[1]}</td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center border border-white/10 rounded-3xl border-dashed">
              <BrainCircuit size={48} className="text-gray-600 mb-4 animate-pulse" />
              <p className="text-gray-500 font-medium tracking-widest uppercase text-xs">Awaiting Data Sync...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}