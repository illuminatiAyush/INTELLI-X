import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  PhoneCall, 
  Download, 
  FileText,
  Users
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const AnalyticsView = () => {
  const { 
    currentRole, 
    students, 
    batches, 
    attendanceTrend,
    setInspectStudent,
    setCallParentTarget,
    setReportPreviewStudent
  } = useDemo();

  // If role is not Admin, RBAC restriction (defense in depth)
  if (currentRole !== 'Admin') {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Access Denied. Institutional Analytics is strictly accessible to Master Admin.
      </div>
    );
  }

  const lowAttendanceStudents = students.filter(s => s.attendanceRate < 75);

  const batchComparisonData = batches.map(b => ({
    name: b.name.replace(' - ', ' '),
    rate: b.avgAttendance,
    students: b.studentCount
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Institutional Analytics & Compliance</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Batch-wise attendance trends, weekly retention rates, and sub-75% escalation monitor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
            Academic Term: Autumn 2026
          </span>
        </div>
      </div>

      {/* Monochrome Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trend Chart */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                Weekly Attendance % Trends (5-Week Window)
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Comparative tracking across cohorts</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-black" /> JEE-A</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-zinc-500" /> JEE-B</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 bg-zinc-300" /> NEET-C</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis domain={[60, 100]} stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Line type="monotone" dataKey="JEE-A" stroke="#000000" strokeWidth={2} dot={{ r: 3, fill: '#000000' }} />
                <Line type="monotone" dataKey="JEE-B" stroke="#71717A" strokeWidth={2} dot={{ r: 3, fill: '#71717A' }} />
                <Line type="monotone" dataKey="NEET-C" stroke="#D4D4D8" strokeWidth={2} dot={{ r: 3, fill: '#D4D4D8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cohort Comparison Bar Chart */}
        <div className="bg-white border border-zinc-200 rounded-lg p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                Current Average Attendance by Batch
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">Threshold benchmark: 75%</p>
            </div>
            <span className="text-xs font-mono font-semibold text-zinc-800">Target &ge;85%</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="#F4F4F5" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#A1A1AA" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000000', color: '#FFFFFF', borderRadius: '6px', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="rate" fill="#18181B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sub-75% Critical Watchlist Table */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
              Critical Low Attendance Watchlist (Sub-75% Candidates)
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-500">
            {lowAttendanceStudents.length} candidates require formal guardian conference
          </span>
        </div>

        <div className="border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
              <tr>
                <th className="py-2.5 px-3">Roll No</th>
                <th className="py-2.5 px-3">Candidate Name</th>
                <th className="py-2.5 px-3">Assigned Batch</th>
                <th className="py-2.5 px-3">Primary Parent Contact</th>
                <th className="py-2.5 px-3 font-mono">Attendance Rate</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {lowAttendanceStudents.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-50/50">
                  <td className="py-3 px-3 font-mono text-zinc-500">{s.rollNo}</td>
                  <td className="py-3 px-3 font-semibold text-zinc-900">
                    <button onClick={() => setInspectStudent(s)} className="hover:underline">
                      {s.name}
                    </button>
                  </td>
                  <td className="py-3 px-3 text-zinc-600">{s.batchName}</td>
                  <td className="py-3 px-3 text-zinc-600">
                    {s.parentName} · <a href={`tel:${s.parentPhone}`} className="font-mono underline text-black">{s.parentPhone}</a>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-red-600">
                    <span className="inline-flex items-center gap-1 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      {s.attendanceRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setCallParentTarget(s)}
                        className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1 shadow-sm"
                      >
                        <PhoneCall className="w-3 h-3" /> Call Parent
                      </button>
                      <button
                        onClick={() => setReportPreviewStudent(s)}
                        className="p-1 text-zinc-400 hover:text-black"
                        title="Download In-Depth Report (PDF)"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
