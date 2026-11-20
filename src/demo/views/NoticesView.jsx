import React, { useState } from 'react';
import { 
  Megaphone, 
  Plus, 
  Send, 
  X, 
  AlertCircle, 
  Calendar, 
  Users,
  Filter
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const NoticesView = () => {
  const { currentRole, notices, batches, publishNotice } = useDemo();

  const [filterBatch, setFilterBatch] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form state for Publish Notice Modal
  const [form, setForm] = useState({
    title: '',
    batchId: 'all',
    content: '',
    urgent: false
  });

  const filteredNotices = filterBatch === 'all'
    ? notices
    : notices.filter(n => n.batchId === 'all' || n.batchId === filterBatch);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">Academic Bulletins & Notices</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Official announcements, examination notifications, and administrative circulars.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="text-xs px-3 py-2 bg-white border border-zinc-200 rounded text-zinc-700 focus:outline-none focus:border-zinc-900"
          >
            <option value="all">All Bulletins</option>
            {batches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Admin only publish trigger */}
          {currentRole === 'Admin' && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-3.5 py-2 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Publish Notice
            </button>
          )}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4 max-w-4xl">
        {filteredNotices.map((n) => (
          <div 
            key={n.id}
            className={`p-5 bg-white border rounded-lg transition-colors ${
              n.urgent ? 'border-red-200 bg-red-50/20' : 'border-zinc-200'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {n.batchName}
                  </span>
                  {n.urgent && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-200 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Urgent
                    </span>
                  )}
                  <span className="text-xs font-mono text-zinc-400">{n.date}</span>
                </div>

                <h3 className="text-sm font-bold text-zinc-900">{n.title}</h3>
                <p className="text-xs text-zinc-700 mt-2 leading-relaxed whitespace-pre-line">
                  {n.content}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] font-mono text-zinc-400 block uppercase">Published By</span>
                <span className="text-xs font-semibold text-zinc-800 block mt-0.5">{n.author}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Publish Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-zinc-200 rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-semibold text-zinc-900">Publish Academy Bulletin</h3>
              <button 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded text-zinc-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Target Audience / Cohort:</label>
                <select
                  value={form.batchId}
                  onChange={(e) => setForm({ ...form, batchId: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                >
                  <option value="all">Broadcast to All Batches (Institute-Wide)</option>
                  {batches.map(b => (
                    <option key={b.id} value={b.id}>{b.name} ({b.grade})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Notice Title:</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="e.g. Schedule Revision for National Ranker Test #4"
                />
              </div>

              <div>
                <label className="block text-zinc-600 mb-1 font-medium">Circular Content:</label>
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full p-2 bg-zinc-50 border border-zinc-200 rounded"
                  placeholder="Draft official instructions here..."
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="urgentNotice"
                  checked={form.urgent}
                  onChange={(e) => setForm({ ...form, urgent: e.target.checked })}
                  className="rounded border-zinc-300"
                />
                <label htmlFor="urgentNotice" className="text-xs text-zinc-700 font-medium cursor-pointer">
                  Flag as Critical / Urgent Announcement
                </label>
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
                  if (!form.title || !form.content) return alert("Please fill title and content");
                  publishNotice(form);
                  setModalOpen(false);
                  setForm({ title: '', batchId: 'all', content: '', urgent: false });
                }}
                className="px-4 py-1.5 bg-black text-white text-xs font-semibold rounded hover:bg-zinc-800 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Broadcast Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
