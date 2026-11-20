import React, { useState } from 'react';
import { 
  PhoneCall, 
  Printer, 
  Download, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  User, 
  BookOpen, 
  Clock,
  Send
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const DemoModals = () => {
  const { 
    callParentTarget, 
    setCallParentTarget, 
    recordParentCall,
    reportPreviewStudent,
    setReportPreviewStudent,
    inspectStudent,
    setInspectStudent,
    institute,
    showToast
  } = useDemo();

  const [callNotes, setCallNotes] = useState('');

  // 1. Call Parent Modal
  const renderCallModal = () => {
    if (!callParentTarget) return null;
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
          <div className="flex items-start justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-black" />
                Log Parent Contact
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Document guardian communication for student records
              </p>
            </div>
            <button 
              onClick={() => setCallParentTarget(null)}
              className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-black"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded p-3 text-xs space-y-1.5">
            <div className="flex justify-between">
              <span className="text-zinc-500">Student:</span>
              <span className="font-semibold text-zinc-900">{callParentTarget.name} ({callParentTarget.rollNo})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Parent / Guardian:</span>
              <span className="font-semibold text-zinc-900">{callParentTarget.parentName} ({callParentTarget.parentRelation || 'Guardian'})</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-zinc-200/60">
              <span className="text-zinc-500">Contact Number:</span>
              <a 
                href={`tel:${callParentTarget.parentPhone}`}
                className="font-mono font-bold text-black underline underline-offset-2 flex items-center gap-1"
              >
                {callParentTarget.parentPhone}
              </a>
            </div>
            <div className="flex justify-between text-[11px] pt-1">
              <span className="text-zinc-500">Attendance Flag:</span>
              <span className="font-mono font-semibold text-red-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {callParentTarget.attendanceRate}% (Sub-75% Critical)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-800 mb-1.5">
              Call Summary & Guardian Response Notes:
            </label>
            <textarea
              rows={3}
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="e.g. Informed parent regarding 3 consecutive absences. Father confirmed illness, doctor certificate to be submitted on Monday."
              className="w-full text-xs p-2.5 bg-zinc-50 border border-zinc-200 rounded focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              onClick={() => setCallParentTarget(null)}
              className="px-3 py-1.5 text-xs text-zinc-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                recordParentCall({
                  studentId: callParentTarget.id,
                  studentName: callParentTarget.name,
                  parentName: callParentTarget.parentName,
                  notes: callNotes
                });
                setCallNotes('');
              }}
              className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Confirm & Log Call in Activity
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 2. Student In-Depth Report Preview Modal (Printable Monochrome)
  const renderReportModal = () => {
    if (!reportPreviewStudent) return null;
    const s = reportPreviewStudent;
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
        <div className="bg-white border border-zinc-300 rounded-lg max-w-2xl w-full p-8 shadow-2xl my-8 space-y-6 text-zinc-900">
          {/* Header Controls */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-4 print:hidden">
            <div className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">
                Official Student Report Preview
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  window.print();
                  showToast("Opening system print dialog...");
                }}
                className="px-3 py-1 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Print / Save as PDF
              </button>
              <button 
                onClick={() => setReportPreviewStudent(null)}
                className="p-1 rounded hover:bg-zinc-100 text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Printable Report Canvas */}
          <div className="space-y-6">
            {/* Report Letterhead */}
            <div className="flex items-start justify-between border-b-2 border-black pb-4">
              <div>
                <h2 className="text-xl font-bold tracking-tight uppercase">{institute.name}</h2>
                <p className="text-xs text-zinc-600">{institute.location} · {institute.contact}</p>
                <p className="text-xs font-mono text-zinc-500 mt-1">Official Academic & Attendance Audit Report</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block">Report Date</span>
                <span className="text-xs font-semibold font-mono">20 November 2026</span>
              </div>
            </div>

            {/* Student Meta Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 border border-zinc-200 p-4 rounded text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Student Name</span>
                <span className="font-semibold text-zinc-900">{s.name}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Roll / Enrollment</span>
                <span className="font-mono font-semibold text-zinc-900">{s.rollNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Assigned Cohort</span>
                <span className="font-medium text-zinc-900">{s.batchName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block font-mono">Overall Rate</span>
                <span className={`font-mono font-bold ${s.attendanceRate < 75 ? 'text-red-600' : 'text-zinc-900'}`}>
                  {s.attendanceRate}% {s.attendanceRate < 75 && '(Low)'}
                </span>
              </div>
            </div>

            {/* Attendance Ledger Table */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2 font-mono">
                Recent Lecture Attendance Record
              </h4>
              <div className="border border-zinc-200 rounded overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-100 border-b border-zinc-200 font-semibold text-zinc-700">
                    <tr>
                      <th className="py-2 px-3">Date</th>
                      <th className="py-2 px-3">Subject</th>
                      <th className="py-2 px-3">Lecture Topic</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {s.attendanceHistory?.map((h, i) => (
                      <tr key={i} className="hover:bg-zinc-50/50">
                        <td className="py-2 px-3 font-mono text-zinc-600">{h.date}</td>
                        <td className="py-2 px-3 font-medium">{h.subject}</td>
                        <td className="py-2 px-3 text-zinc-600 truncate max-w-xs">{h.topic}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">
                          <span className={`px-2 py-0.5 rounded text-[11px] border ${
                            h.status === 'Present' 
                              ? 'bg-zinc-50 border-zinc-300 text-zinc-900' 
                              : h.status === 'Absent'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                          }`}>
                            {h.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Faculty Observations & Signoff */}
            <div className="border-t border-zinc-200 pt-4 space-y-4">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase font-mono block">Faculty Academic Remarks</span>
                <p className="text-xs text-zinc-700 italic mt-1 leading-relaxed bg-zinc-50 p-3 rounded border border-zinc-200">
                  "{s.remarks || 'Standard progression noted across curriculum. Regular revision drills recommended.'}"
                </p>
              </div>

              <div className="flex justify-between items-end pt-8 text-xs text-zinc-600 border-t border-zinc-100">
                <div>
                  <p className="font-semibold">{institute.principal}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">Head of Academic Board</p>
                </div>
                <div className="text-right">
                  <div className="w-36 border-b border-black mb-1" />
                  <p className="text-[10px] font-mono text-zinc-500">Authorized Academy Seal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 3. Student Profile Drawer
  const renderStudentDrawer = () => {
    if (!inspectStudent) return null;
    const s = inspectStudent;

    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
        <div className="bg-white border-l border-zinc-200 w-full max-w-lg h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 block">Student Profile</span>
                <h3 className="text-lg font-bold text-zinc-900 mt-0.5">{s.name}</h3>
                <p className="text-xs text-zinc-500 font-mono">{s.rollNo} · {s.batchName}</p>
              </div>
              <button
                onClick={() => setInspectStudent(null)}
                className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Attendance Status Card */}
            <div className={`p-4 rounded-lg border ${
              s.attendanceRate < 75 
                ? 'bg-zinc-50 border-red-200' 
                : 'bg-zinc-50 border-zinc-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase text-zinc-500">Overall Attendance</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold font-mono tracking-tight text-zinc-900">
                      {s.attendanceRate}%
                    </span>
                    {s.attendanceRate < 75 ? (
                      <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Sub-75% Alert
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-zinc-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" /> Compliant
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      setCallParentTarget(s);
                      setInspectStudent(null);
                    }}
                    className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    Call Parent
                  </button>
                  <button
                    onClick={() => {
                      setReportPreviewStudent(s);
                      setInspectStudent(null);
                    }}
                    className="px-3 py-1.5 bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold rounded hover:bg-zinc-50 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Report
                  </button>
                </div>
              </div>
            </div>

            {/* Parent & Contact Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Parent & Contact Information
              </h4>
              <div className="border border-zinc-200 rounded divide-y divide-zinc-100 text-xs">
                <div className="p-3 flex justify-between">
                  <span className="text-zinc-500">Primary Contact:</span>
                  <span className="font-semibold text-zinc-900">{s.parentName} ({s.parentRelation || 'Guardian'})</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-zinc-500">Parent Phone:</span>
                  <a href={`tel:${s.parentPhone}`} className="font-mono font-medium text-black underline">
                    {s.parentPhone}
                  </a>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-zinc-500">Student Phone:</span>
                  <span className="font-mono text-zinc-700">{s.phone}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="text-zinc-500">Email:</span>
                  <span className="font-mono text-zinc-700">{s.email}</span>
                </div>
              </div>
            </div>

            {/* Recent Attendance Log */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                Recent Session History
              </h4>
              <div className="border border-zinc-200 rounded divide-y divide-zinc-100 text-xs">
                {s.attendanceHistory?.slice(0, 5).map((h, i) => (
                  <div key={i} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-zinc-900">{h.subject}: {h.topic}</p>
                      <p className="text-[10px] text-zinc-400 font-mono">{h.date}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${
                      h.status === 'Present' 
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900' 
                        : h.status === 'Absent'
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-zinc-100 border-zinc-300 text-zinc-700'
                    }`}>
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-200">
            <button
              onClick={() => setInspectStudent(null)}
              className="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-semibold rounded transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderCallModal()}
      {renderReportModal()}
      {renderStudentDrawer()}
    </>
  );
};
