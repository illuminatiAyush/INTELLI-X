import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ArrowLeft, 
  PhoneCall, 
  Download, 
  Calendar, 
  BookOpen, 
  Clock, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const BatchesView = () => {
  const { 
    currentRole, 
    batches, 
    students, 
    resources, 
    lectures,
    selectedBatchId, 
    setSelectedBatchId,
    setInspectStudent,
    setCallParentTarget,
    setReportPreviewStudent
  } = useDemo();

  const [activeTab, setActiveTab] = useState('Students'); // 'Students' | 'Teachers' | 'Lectures' | 'Resources'
  const [studentSearch, setStudentSearch] = useState('');

  // Selected batch entity
  const selectedBatch = batches.find(b => b.id === selectedBatchId);

  // Filter students for the batch
  const batchStudents = students.filter(s => s.batchId === selectedBatchId);
  const filteredStudents = batchStudents.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.rollNo.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Batch specific lectures and resources
  const batchLectures = lectures.filter(l => l.batchId === selectedBatchId);
  const batchResources = resources.filter(r => r.batchId === selectedBatchId);

  // ─────────────────────────────────────────────────────────────
  // 1. BATCH DETAIL VIEW (When a card is clicked)
  // ─────────────────────────────────────────────────────────────
  if (selectedBatch) {
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Back navigation & Batch Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedBatchId(null)}
              className="p-1.5 rounded border border-zinc-200 hover:bg-zinc-100 text-zinc-600 transition-colors"
              title="Back to Batches Grid"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900">{selectedBatch.name}</h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {selectedBatch.grade}
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Faculty: {selectedBatch.teacherName} · Room: {selectedBatch.room} · {selectedBatch.studentCount} Students Enrolled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-500">
              Avg Attendance: <strong className="text-zinc-900">{selectedBatch.avgAttendance}%</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-zinc-200 pb-2">
          {['Students', 'Teachers', 'Lectures', 'Resources'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-black text-white shadow-sm'
                  : 'text-zinc-600 hover:text-black hover:bg-zinc-100'
              }`}
            >
              {tab} {tab === 'Students' && `(${batchStudents.length})`}
            </button>
          ))}
        </div>

        {/* Tab Content: Students Roster */}
        {activeTab === 'Students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Filter student roster by name or roll no..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded focus:bg-white focus:outline-none focus:border-zinc-900"
                />
              </div>

              <span className="text-[11px] font-mono text-zinc-400">
                Click any row to open full Student Profile Drawer
              </span>
            </div>

            <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
                  <tr>
                    <th className="py-2.5 px-3">Roll No</th>
                    <th className="py-2.5 px-3">Student Name</th>
                    <th className="py-2.5 px-3">Parent Contact</th>
                    <th className="py-2.5 px-3 font-mono">Attendance %</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredStudents.map((s) => (
                    <tr 
                      key={s.id} 
                      className="hover:bg-zinc-50 cursor-pointer transition-colors"
                      onClick={() => setInspectStudent(s)}
                    >
                      <td className="py-2.5 px-3 font-mono text-zinc-500">{s.rollNo}</td>
                      <td className="py-2.5 px-3 font-semibold text-zinc-900">{s.name}</td>
                      <td className="py-2.5 px-3 text-zinc-600">
                        {s.parentName} · <span className="font-mono text-zinc-500">{s.parentPhone}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] border ${
                          s.attendanceRate < 75 
                            ? 'bg-red-50 border-red-200 text-red-600' 
                            : 'bg-zinc-50 border-zinc-200 text-zinc-800'
                        }`}>
                          {s.attendanceRate < 75 && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                          {s.attendanceRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setCallParentTarget(s)}
                            className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1"
                          >
                            <PhoneCall className="w-3 h-3" /> Call
                          </button>
                          <button
                            onClick={() => setReportPreviewStudent(s)}
                            className="p-1 text-zinc-400 hover:text-black transition-colors"
                            title="Download Report (PDF)"
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
        )}

        {/* Tab Content: Teachers */}
        {activeTab === 'Teachers' && (
          <div className="bg-white border border-zinc-200 rounded-lg p-5 max-w-lg space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Primary Assigned Instructor</h4>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold text-sm text-zinc-800">
                AR
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-zinc-900">{selectedBatch.teacherName}</h3>
                <p className="text-xs text-zinc-500 font-mono">Specialization: Advanced Coordinate Geometry & Calculus</p>
                <p className="text-xs text-zinc-600">Email: arvind.r@eskolaria.edu · Ext: 104</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Lectures */}
        {activeTab === 'Lectures' && (
          <div className="border border-zinc-200 rounded-lg overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Topic</th>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Roster</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {batchLectures.map((l) => (
                  <tr key={l.id}>
                    <td className="py-2.5 px-3 font-mono text-zinc-500">{l.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-zinc-900">{l.topic}</td>
                    <td className="py-2.5 px-3 font-mono text-zinc-600">{l.time}</td>
                    <td className="py-2.5 px-3 font-mono">{l.status}</td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {l.status === 'Finished' ? `${l.presentCount}/${l.totalEnrolled} Present` : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab Content: Resources */}
        {activeTab === 'Resources' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {batchResources.map((res) => (
              <div key={res.id} className="bg-white border border-zinc-200 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-900">{res.title}</h4>
                  <p className="text-[11px] text-zinc-400 font-mono mt-0.5">{res.category} · {res.size} · By {res.uploadedBy}</p>
                </div>
                <a
                  href={res.downloadUrl}
                  className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold rounded transition-colors flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Get
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. BATCH CARDS GRID VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Academic Batches & Cohorts</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Active instructional streams, class capacities, and student directories.
          </p>
        </div>
        {currentRole === 'Admin' && (
          <button 
            onClick={() => alert("Demo Notice: New cohort creation is restricted in this demo view.")}
            className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm"
          >
            + Create Batch
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {batches.map((batch) => (
          <div
            key={batch.id}
            onClick={() => setSelectedBatchId(batch.id)}
            className="bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between hover:border-black cursor-pointer transition-all shadow-xs group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {batch.grade}
                </span>
                <span className="text-xs font-mono font-bold text-zinc-900">{batch.studentCount} Students</span>
              </div>

              <h3 className="text-base font-bold text-zinc-900 group-hover:underline">{batch.name}</h3>
              <p className="text-xs text-zinc-500 font-mono mt-1">{batch.subject} · {batch.room}</p>
              <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">{batch.description}</p>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs">
              <span className="font-mono text-zinc-500 text-[11px]">
                Avg: <strong className="text-zinc-900">{batch.avgAttendance}%</strong>
              </span>
              <span className="text-xs font-semibold text-black flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Open Cohort Details →
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
