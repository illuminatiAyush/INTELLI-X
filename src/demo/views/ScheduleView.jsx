import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Play, 
  CheckCircle2, 
  Users, 
  BookOpen, 
  X,
  Filter
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const ScheduleView = () => {
  const { 
    currentRole, 
    lectures, 
    batches, 
    scheduleLecture, 
    startLecture,
    setActiveAttendanceLectureId,
    setCurrentView 
  } = useDemo();

  const [filterBatch, setFilterBatch] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);

  // Form for Schedule Lecture Modal
  const [form, setForm] = useState({
    batchId: 'batch-1',
    subject: 'Mathematics',
    topic: '',
    date: '2026-11-21',
    time: '10:00 AM - 12:00 PM',
    room: 'Hall 101',
    teacherName: 'Prof. Arvind Ramanathan'
  });

  const filteredLectures = filterBatch === 'All'
    ? lectures
    : lectures.filter(l => l.batchId === filterBatch);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Lecture Master Schedule</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time classroom allocations, faculty assignments, and scheduled curriculum delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Batch Filter dropdown */}
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-zinc-200 rounded text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="All">All Batches (Showing 3)</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Admin Schedule Action */}
          {currentRole === 'Admin' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Schedule Lecture
            </button>
          )}
        </div>
      </div>

      {/* Lectures List */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 border-b border-zinc-200 font-semibold text-zinc-700">
            <tr>
              <th className="py-2.5 px-4 font-mono">Date & Slot</th>
              <th className="py-2.5 px-4">Batch Cohort</th>
              <th className="py-2.5 px-4">Subject & Topic</th>
              <th className="py-2.5 px-4">Faculty & Room</th>
              <th className="py-2.5 px-4 font-mono">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredLectures.map((l) => {
              const isFinished = l.status === 'Finished';
              const isInProgress = l.status === 'In Progress';

              return (
                <tr key={l.id} className="hover:bg-zinc-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-zinc-600">
                    <span className="font-semibold text-zinc-900 block">{l.date}</span>
                    <span className="text-[11px] text-zinc-400">{l.time}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-zinc-900 block">{l.batchName}</span>
                    <span className="text-[11px] font-mono text-zinc-400">{l.totalEnrolled} students</span>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-medium text-zinc-900 block truncate">{l.subject}</span>
                    <span className="text-zinc-500 text-[11px] block truncate">{l.topic}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-zinc-800 block">{l.teacherName}</span>
                    <span className="text-[11px] font-mono text-zinc-400">{l.room}</span>
                  </td>

                  <td className="py-3 px-4 font-mono font-semibold">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                      isFinished
                        ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
                        : isInProgress
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-zinc-200 text-zinc-500'
                    }`}>
                      {l.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {currentRole !== 'Student' && (
                      <div>
                        {isInProgress ? (
                          <button
                            onClick={() => {
                              setActiveAttendanceLectureId(l.id);
                              setCurrentView('attendance');
                            }}
                            className="px-3 py-1 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Mark Attendance
                          </button>
                        ) : isFinished ? (
                          <button
                            onClick={() => {
                              setActiveAttendanceLectureId(l.id);
                              setCurrentView('attendance');
                            }}
                            className="text-xs text-zinc-500 hover:text-black font-medium"
                          >
                            Review Roster ({l.presentCount}/{l.totalEnrolled})
                          </button>
                        ) : (
                          <button
                            onClick={() => startLecture(l.id)}
                            className="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded transition-colors inline-flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" /> Start Lecture
                          </button>
                        )}
                      </div>
                    )}

                    {currentRole === 'Student' && (
                      <span className="text-[11px] font-mono text-zinc-400">
                        {isFinished ? 'Completed' : 'Upcoming'}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Schedule Lecture Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Schedule New Lecture Session</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Target Batch Cohort:</label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                >
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Subject:</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="e.g. Physics / Mathematics / Chemistry"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Curriculum Topic / Unit:</label>
                <input
                  type="text"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="e.g. Thermodynamics - Second Law & Entropy"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Date:</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded font-mono"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Slot Time:</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Room Allocation:</label>
                  <input
                    type="text"
                    value={form.room}
                    onChange={(e) => setForm({ ...form, room: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 mb-1 font-medium">Instructor:</label>
                  <input
                    type="text"
                    value={form.teacherName}
                    onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                    className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!form.topic) return alert("Please specify a lecture topic");
                  scheduleLecture(form);
                  setModalOpen(false);
                }}
                className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm"
              >
                Add to Timetable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
