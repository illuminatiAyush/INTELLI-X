import React from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  PhoneCall, 
  Download, 
  Play, 
  FileText, 
  ChevronRight,
  TrendingUp,
  GraduationCap
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const DashboardView = () => {
  const { 
    currentRole, 
    lectures, 
    students, 
    batches, 
    notices, 
    resources, 
    activityLog,
    setCurrentView,
    setInspectStudent,
    setCallParentTarget,
    setReportPreviewStudent,
    startLecture,
    setActiveAttendanceLectureId,
    institute
  } = useDemo();

  // Low attendance students (sub-75%)
  const lowAttendanceStudents = students.filter(s => s.attendanceRate < 75);

  // Today's lectures
  const todayLectures = lectures.slice(0, 3);

  // Attendance metrics
  const completedSessions = lectures.filter(l => l.status === 'Finished').length;
  const pendingAttendanceLectures = lectures.filter(l => l.status !== 'Finished');

  // Average attendance calculation
  const totalAvgAttendance = Math.round(
    students.reduce((acc, curr) => acc + curr.attendanceRate, 0) / (students.length || 1)
  );

  // ─────────────────────────────────────────────────────────────
  // 1. ADMIN DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (currentRole === 'Admin') {
    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        {/* Page Title & Context */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Academic Operations Command</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Live attendance oversight, daily lecture rosters, and guardian escalation feed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('attendance')}
              className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Attendance Session
            </button>
            <button
              onClick={() => setCurrentView('schedule')}
              className="px-3.5 py-2 bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold rounded hover:bg-zinc-50 transition-colors"
            >
              + Schedule Lecture
            </button>
          </div>
        </div>

        {/* Top Metric Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-zinc-200 rounded-lg">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Average Attendance Today</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-zinc-900">{totalAvgAttendance}%</span>
              <span className="text-[10px] text-zinc-500 font-mono">+1.8% vs last week</span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-black h-full rounded-full" style={{ width: `${totalAvgAttendance}%` }} />
            </div>
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded-lg">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Sessions Completed</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-zinc-900">{completedSessions} / {lectures.length}</span>
              <span className="text-[10px] text-zinc-500 font-mono">Today's Timetable</span>
            </div>
            <div className="w-full bg-zinc-100 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-black h-full rounded-full" style={{ width: `${(completedSessions / lectures.length) * 100}%` }} />
            </div>
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded-lg">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Enrolled Candidates</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-zinc-900">114</span>
              <span className="text-[10px] text-zinc-500 font-mono">Across 3 Batches</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-3 font-mono">JEE 2027 (A & B) · NEET 2026</p>
          </div>

          <div className="p-4 bg-white border border-zinc-200 rounded-lg">
            <span className="text-[11px] font-mono text-zinc-500 uppercase">Sub-75% Attendance Alerts</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold font-mono tracking-tight text-red-600">
                {lowAttendanceStudents.length}
              </span>
              <span className="text-[10px] text-red-600 font-mono font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> Action Required
              </span>
            </div>
            <button
              onClick={() => setCurrentView('analytics')}
              className="text-[11px] font-medium text-black hover:underline mt-3 block"
            >
              Open Low Attendance Watchlist →
            </button>
          </div>
        </div>

        {/* Today's Lectures Horizontal Cards */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">
              Today's Lectures & Cohort Progress
            </h3>
            <button 
              onClick={() => setCurrentView('schedule')}
              className="text-xs text-zinc-500 hover:text-black font-medium"
            >
              View Full Schedule →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {todayLectures.map((lec) => {
              const isFinished = lec.status === 'Finished';
              const isInProgress = lec.status === 'In Progress';
              return (
                <div 
                  key={lec.id}
                  className="bg-white border border-zinc-200 rounded-lg p-4 flex flex-col justify-between hover:border-zinc-300 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                        {lec.batchName}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                        isFinished 
                          ? 'bg-zinc-100 border-zinc-200 text-zinc-700' 
                          : isInProgress 
                            ? 'bg-black text-white border-black'
                            : 'bg-white border-zinc-200 text-zinc-500'
                      }`}>
                        {lec.status}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">{lec.subject}: {lec.topic}</h4>
                    <p className="text-xs text-zinc-500 mt-1 font-mono">{lec.time} · {lec.room}</p>
                    <p className="text-[11px] text-zinc-600 mt-0.5">{lec.teacherName}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    {isFinished ? (
                      <span className="text-[11px] text-zinc-600 font-mono">
                        Attendance: <span className="font-semibold text-black">{lec.presentCount}/{lec.totalEnrolled}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-zinc-400 font-mono">
                        {lec.totalEnrolled} students enrolled
                      </span>
                    )}

                    {isInProgress ? (
                      <button
                        onClick={() => {
                          setActiveAttendanceLectureId(lec.id);
                          setCurrentView('attendance');
                        }}
                        className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Mark Now
                      </button>
                    ) : isFinished ? (
                      <button
                        onClick={() => {
                          setActiveAttendanceLectureId(lec.id);
                          setCurrentView('attendance');
                        }}
                        className="text-[11px] text-zinc-500 hover:text-black font-medium"
                      >
                        Review Sheet →
                      </button>
                    ) : (
                      <button
                        onClick={() => startLecture(lec.id)}
                        className="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-semibold rounded transition-colors flex items-center gap-1"
                      >
                        <Play className="w-3 h-3" /> Start Lecture
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Split Grid: Low Attendance Alert Watchlist vs Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Low Attendance Watchlist (Sub-75%) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-lg p-5">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                  Low Attendance Watchlist (Sub-75% Candidates)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-400">Strict Escalation Protocol</span>
            </div>

            <div className="divide-y divide-zinc-100">
              {lowAttendanceStudents.map((s) => (
                <div key={s.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <button 
                      onClick={() => setInspectStudent(s)}
                      className="text-xs font-semibold text-zinc-900 hover:underline text-left block"
                    >
                      {s.name}
                    </button>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {s.rollNo} · {s.batchName} · Parent: {s.parentName}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
                      {s.attendanceRate}%
                    </span>

                    <button
                      onClick={() => setCallParentTarget(s)}
                      className="px-2.5 py-1 bg-black text-white text-[11px] font-semibold rounded hover:bg-zinc-800 transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <PhoneCall className="w-3 h-3" /> Call Parent
                    </button>

                    <button
                      onClick={() => setReportPreviewStudent(s)}
                      className="p-1 text-zinc-400 hover:text-black transition-colors"
                      title="Download Student Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log Compact Feed */}
          <div className="lg:col-span-5 bg-white border border-zinc-200 rounded-lg p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
                  Live Operations Audit
                </h3>
                <button
                  onClick={() => setCurrentView('activity')}
                  className="text-xs text-zinc-500 hover:text-black font-medium"
                >
                  Full Log →
                </button>
              </div>

              <div className="space-y-3">
                {activityLog.slice(0, 4).map((act) => (
                  <div key={act.id} className="text-xs border-l-2 border-black pl-3 py-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-900">{act.action}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">{act.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{act.details}</p>
                    <span className="text-[10px] text-zinc-400 font-mono block mt-1">
                      By {act.actorName} ({act.actorRole})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Traceable Audit Hash #IX-2026</span>
              <button 
                onClick={() => setCurrentView('activity')}
                className="text-black font-semibold hover:underline"
              >
                Inspect All Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. TEACHER DASHBOARD
  // ─────────────────────────────────────────────────────────────
  if (currentRole === 'Teacher') {
    // Only lectures assigned to Math / Teacher 1
    const teacherLectures = lectures.filter(l => l.batchId === 'batch-1');
    const teacherBatches = batches.filter(b => b.id === 'batch-1');

    return (
      <div className="space-y-8 animate-in fade-in duration-150">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">Faculty Workspace</h1>
            <p className="text-xs text-zinc-500 mt-1">
              Assigned: Prof. Arvind Ramanathan · Mathematics Department · JEE 2027
            </p>
          </div>
          <button
            onClick={() => {
              setActiveAttendanceLectureId('lec-1');
              setCurrentView('attendance');
            }}
            className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Open Session Roster
          </button>
        </div>

        {/* Assigned Lectures List */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">
            My Assigned Sessions Today
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teacherLectures.map((lec) => (
              <div key={lec.id} className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                      {lec.batchName}
                    </span>
                    <h4 className="text-sm font-semibold text-zinc-900 mt-2">{lec.topic}</h4>
                    <p className="text-xs text-zinc-500 font-mono mt-0.5">{lec.time} · {lec.room}</p>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold border ${
                    lec.status === 'Finished' ? 'bg-zinc-100 border-zinc-200 text-zinc-700' : 'bg-black text-white'
                  }`}>
                    {lec.status}
                  </span>
                </div>

                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-600 font-mono text-[11px]">
                    Roll Call: {lec.presentCount}/{lec.totalEnrolled} Present
                  </span>
                  <button
                    onClick={() => {
                      setActiveAttendanceLectureId(lec.id);
                      setCurrentView('attendance');
                    }}
                    className="px-3 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors"
                  >
                    Edit / Mark Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Assigned Batch Cards */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">
            My Teaching Cohort
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teacherBatches.map((b) => (
              <div key={b.id} className="bg-white border border-zinc-200 rounded-lg p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900">{b.name}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{b.grade}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-black">{b.studentCount} Students</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">{b.description}</p>
                <div className="pt-3 border-t border-zinc-100 flex justify-between items-center text-xs">
                  <span className="font-mono text-zinc-500 text-[11px]">Avg: {b.avgAttendance}%</span>
                  <button
                    onClick={() => setCurrentView('batches')}
                    className="text-black font-semibold hover:underline"
                  >
                    View Batch Roster →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 3. STUDENT DASHBOARD ("My Attendance" & Schedule)
  // ─────────────────────────────────────────────────────────────
  const studentData = students.find(s => s.id === 'stu-101') || students[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400 block">Student Portal</span>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">{studentData.name}</h1>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">
            {studentData.rollNo} · {studentData.batchName} · {institute.name}
          </p>
        </div>
        <button
          onClick={() => setReportPreviewStudent(studentData)}
          className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Download My Attendance Report (PDF)
        </button>
      </div>

      {/* Student Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={`p-5 rounded-lg border ${
          studentData.attendanceRate < 75 ? 'bg-zinc-50 border-red-200' : 'bg-white border-zinc-200'
        }`}>
          <span className="text-[11px] font-mono text-zinc-500 uppercase">My Overall Attendance</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold font-mono tracking-tight text-zinc-900">
              {studentData.attendanceRate}%
            </span>
            {studentData.attendanceRate < 75 && (
              <span className="text-xs font-mono font-semibold text-red-600">
                (Below 75% Threshold)
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            Minimum 75% attendance mandatory for JEE Test Series eligibility.
          </p>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-lg">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Today's Lecture</span>
          <div className="mt-2">
            <h4 className="text-sm font-semibold text-zinc-900">Mathematics</h4>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">09:30 AM - 11:30 AM · Hall 101</p>
            <span className="inline-block mt-2 text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
              Finished · Status: Absent
            </span>
          </div>
        </div>

        <div className="p-5 bg-white border border-zinc-200 rounded-lg">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">Registered Guardian</span>
          <div className="mt-2 text-xs">
            <p className="font-semibold text-zinc-900">{studentData.parentName}</p>
            <p className="text-zinc-500 font-mono mt-0.5">{studentData.parentPhone}</p>
            <p className="text-[11px] text-zinc-400 mt-2">Emergency calls dispatched directly to registered SIM.</p>
          </div>
        </div>
      </div>

      {/* Student Recent Attendance Table */}
      <div className="bg-white border border-zinc-200 rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-200">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 font-mono">
            My Recent Attendance History
          </h3>
          <button 
            onClick={() => setCurrentView('attendance')}
            className="text-xs text-zinc-500 hover:text-black font-medium"
          >
            Full Ledger →
          </button>
        </div>

        <div className="border border-zinc-200 rounded overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Subject</th>
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {studentData.attendanceHistory?.map((h, i) => (
                <tr key={i} className="hover:bg-zinc-50/50">
                  <td className="py-2.5 px-3 font-mono text-zinc-600">{h.date}</td>
                  <td className="py-2.5 px-3 font-medium">{h.subject}</td>
                  <td className="py-2.5 px-3 text-zinc-600">{h.topic}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-semibold">
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
    </div>
  );
};
