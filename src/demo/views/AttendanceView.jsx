import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  PhoneCall, 
  Save, 
  Download, 
  AlertCircle,
  Users,
  Calendar,
  ArrowRight
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const AttendanceView = () => {
  const { 
    currentRole, 
    lectures, 
    students, 
    batches,
    activeAttendanceLectureId,
    setActiveAttendanceLectureId,
    saveAttendanceSession,
    setCallParentTarget,
    setReportPreviewStudent,
    setInspectStudent
  } = useDemo();

  // Find active lecture session
  const activeLecture = lectures.find(l => l.id === activeAttendanceLectureId) || lectures[0];

  // Candidates belonging to this lecture's batch
  const batchStudents = students.filter(s => s.batchId === activeLecture.batchId);

  // Local state for segmented toggles: { [studentId]: 'Present' | 'Absent' | 'Late' }
  const [rosterStatuses, setRosterStatuses] = useState({});

  useEffect(() => {
    // Populate default statuses from student history or default to Present
    const initial = {};
    batchStudents.forEach(stu => {
      const match = stu.attendanceHistory?.find(h => h.lectureId === activeLecture.id);
      initial[stu.id] = match ? match.status : 'Present';
    });
    setRosterStatuses(initial);
  }, [activeAttendanceLectureId, activeLecture.id]);

  const setStatus = (studentId, status) => {
    setRosterStatuses(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const markAll = (status) => {
    const updated = {};
    batchStudents.forEach(s => {
      updated[s.id] = status;
    });
    setRosterStatuses(updated);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. STUDENT VIEW ("My Attendance" Read-Only Mode)
  // ─────────────────────────────────────────────────────────────
  if (currentRole === 'Student') {
    const myProfile = students.find(s => s.id === 'stu-101') || students[0];
    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block">Personal Ledger</span>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">My Attendance & Compliance</h1>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">
              Roll No: {myProfile.rollNo} · {myProfile.batchName}
            </p>
          </div>
          <button
            onClick={() => setReportPreviewStudent(myProfile)}
            className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Download My Official Report (PDF)
          </button>
        </div>

        {/* Attendance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-xs text-zinc-500 font-mono uppercase">Cumulative Attendance Rate</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-4xl font-bold font-mono tracking-tight ${
                myProfile.attendanceRate < 75 ? 'text-red-600' : 'text-zinc-900'
              }`}>
                {myProfile.attendanceRate}%
              </span>
              {myProfile.attendanceRate < 75 && (
                <span className="text-xs font-semibold text-red-600 font-mono">(Action Required)</span>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Academy regulation requires &ge;75% attendance for examination clearance.
            </p>
          </div>

          <div className="p-5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-xs text-zinc-500 font-mono uppercase">Recorded Lectures</span>
            <div className="text-3xl font-bold font-mono tracking-tight text-zinc-900 mt-2">
              {myProfile.attendanceHistory?.length || 0} Sessions
            </div>
            <p className="text-xs text-zinc-500 mt-2 font-mono">
              {myProfile.attendanceHistory?.filter(h => h.status === 'Present').length || 0} Attended · {myProfile.attendanceHistory?.filter(h => h.status === 'Absent').length || 0} Absences
            </p>
          </div>

          <div className="p-5 bg-white border border-zinc-200 rounded-lg">
            <span className="text-xs text-zinc-500 font-mono uppercase">Registered Guardian</span>
            <div className="text-sm font-bold text-zinc-900 mt-2">
              {myProfile.parentName} ({myProfile.parentRelation || 'Guardian'})
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{myProfile.parentPhone}</p>
            <p className="text-[11px] text-zinc-400 mt-2">Automated SMS dispatch on mark of absence.</p>
          </div>
        </div>

        {/* Read-Only History Table */}
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-200 bg-zinc-50 flex justify-between items-center">
            <span className="text-xs font-semibold text-zinc-900 font-mono uppercase">Curriculum Session Logs</span>
            <span className="text-[11px] font-mono text-zinc-400">Chronological verification</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 font-semibold text-zinc-700">
              <tr>
                <th className="py-2.5 px-4 font-mono">Date</th>
                <th className="py-2.5 px-4">Subject</th>
                <th className="py-2.5 px-4">Curriculum Topic</th>
                <th className="py-2.5 px-4 text-right">Recorded Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {myProfile.attendanceHistory?.map((h, i) => (
                <tr key={i} className="hover:bg-zinc-50/50">
                  <td className="py-3 px-4 font-mono text-zinc-600">{h.date}</td>
                  <td className="py-3 px-4 font-medium">{h.subject}</td>
                  <td className="py-3 px-4 text-zinc-600">{h.topic}</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold">
                    <span className={`px-2.5 py-1 rounded text-[11px] border ${
                      h.status === 'Present'
                        ? 'bg-zinc-50 border-zinc-300 text-zinc-900'
                        : h.status === 'Absent'
                          ? 'bg-red-50 border-red-200 text-red-600'
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
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. ADMIN & TEACHER VIEW: LECTURE-BASED ATTENDANCE SHEET
  // ─────────────────────────────────────────────────────────────
  const counts = {
    present: Object.values(rosterStatuses).filter(v => v === 'Present').length,
    absent: Object.values(rosterStatuses).filter(v => v === 'Absent').length,
    late: Object.values(rosterStatuses).filter(v => v === 'Late').length
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Session Header Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block">Roll-Call Operations</span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Lecture-Based Attendance Sheet</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Roll call is strictly anchored to lecture sessions. Every modification updates the traceable audit log.
          </p>
        </div>

        {/* Lecture Session Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-zinc-500 font-mono">Select Session:</span>
            <select
              value={activeAttendanceLectureId}
              onChange={(e) => setActiveAttendanceLectureId(e.target.value)}
              className="text-xs px-3 py-2 bg-white border border-zinc-200 rounded font-medium text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              {lectures.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.batchName} · {l.subject} ({l.date}) [{l.status}]
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              saveAttendanceSession({
                lectureId: activeLecture.id,
                studentRosterStatuses: rosterStatuses
              });
            }}
            className="px-4 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            Save Attendance
          </button>
        </div>
      </div>

      {/* Active Lecture Context Box */}
      <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900">{activeLecture.batchName}</span>
            <span className="text-zinc-400">·</span>
            <span className="font-medium text-zinc-700">{activeLecture.subject}: {activeLecture.topic}</span>
          </div>
          <p className="text-[11px] text-zinc-500 font-mono mt-1">
            Faculty: {activeLecture.teacherName} · Room: {activeLecture.room} · Scheduled: {activeLecture.time}
          </p>
        </div>

        {/* Real-time Tally Pill Strip & Quick Bulk Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="px-2.5 py-1 rounded bg-white border border-zinc-200 text-zinc-900 font-semibold">
              {counts.present} Present
            </span>
            <span className={`px-2.5 py-1 rounded border font-semibold ${
              counts.absent > 0 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-zinc-200 text-zinc-600'
            }`}>
              {counts.absent} Absent
            </span>
            <span className="px-2.5 py-1 rounded bg-white border border-zinc-200 text-zinc-600">
              {counts.late} Late
            </span>
          </div>

          <div className="border-l border-zinc-200 pl-3 flex items-center gap-1">
            <button
              onClick={() => markAll('Present')}
              className="text-[11px] text-zinc-600 hover:text-black hover:underline"
            >
              All Present
            </button>
            <span className="text-zinc-300">·</span>
            <button
              onClick={() => markAll('Absent')}
              className="text-[11px] text-zinc-600 hover:text-black hover:underline"
            >
              All Absent
            </button>
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
            <tr>
              <th className="py-2.5 px-4 font-mono">Roll No</th>
              <th className="py-2.5 px-4">Student Candidate</th>
              <th className="py-2.5 px-4">Parent Information</th>
              <th className="py-2.5 px-4 font-mono">Overall Rate</th>
              <th className="py-2.5 px-4 text-center">Session Status Toggle</th>
              <th className="py-2.5 px-4 text-right">Quick Escalation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {batchStudents.map((s) => {
              const currentStatus = rosterStatuses[s.id] || 'Present';
              const isAbsent = currentStatus === 'Absent';

              return (
                <tr key={s.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-500">{s.rollNo}</td>
                  
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setInspectStudent(s)}
                      className="font-semibold text-zinc-900 hover:underline text-left block"
                    >
                      {s.name}
                    </button>
                    <span className="text-[11px] text-zinc-400 font-mono">{s.email}</span>
                  </td>

                  <td className="py-3 px-4 text-zinc-600">
                    <span className="font-medium text-zinc-800">{s.parentName}</span>
                    <span className="text-[11px] font-mono text-zinc-500 block">{s.parentPhone}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border ${
                      s.attendanceRate < 75 
                        ? 'bg-red-50 border-red-200 text-red-600' 
                        : 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    }`}>
                      {s.attendanceRate < 75 && <span className="w-1.5 h-1.5 rounded-full bg-red-600" />}
                      {s.attendanceRate}%
                    </span>
                  </td>

                  {/* Crisp Segmented Toggle */}
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex rounded border border-zinc-200 p-0.5 bg-zinc-100 text-xs">
                      {['Present', 'Absent', 'Late'].map((opt) => {
                        const isSelected = currentStatus === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setStatus(s.id, opt)}
                            className={`px-3 py-1 text-[11px] font-semibold rounded transition-all ${
                              isSelected
                                ? opt === 'Absent'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-black text-white shadow-xs'
                                : 'text-zinc-600 hover:text-black'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </td>

                  {/* Actions & Parent Escalation Button */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isAbsent ? (
                        <button
                          onClick={() => setCallParentTarget(s)}
                          className="px-2.5 py-1 bg-red-600 text-white text-[11px] font-semibold rounded hover:bg-red-700 transition-colors flex items-center gap-1 shadow-sm animate-pulse"
                          title="Candidate marked absent — Contact Guardian immediately"
                        >
                          <PhoneCall className="w-3 h-3" /> Call Parent
                        </button>
                      ) : (
                        <button
                          onClick={() => setCallParentTarget(s)}
                          className="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[11px] font-medium rounded transition-colors flex items-center gap-1"
                        >
                          <PhoneCall className="w-3 h-3 text-zinc-400" /> Contact
                        </button>
                      )}

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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
