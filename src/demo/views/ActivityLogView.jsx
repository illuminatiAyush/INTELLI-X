import React, { useState } from 'react';
import { 
  Clock, 
  Filter, 
  CheckCircle2, 
  PhoneCall, 
  Megaphone, 
  Calendar, 
  FolderArchive,
  Search,
  ShieldCheck
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const ActivityLogView = () => {
  const { currentRole, activityLog } = useDemo();

  const [filterCategory, setFilterCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // RBAC protection
  if (currentRole !== 'Admin') {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        Access Denied. Activity Audit Trail is strictly reserved for Admin oversight.
      </div>
    );
  }

  const categories = ['All', 'Attendance', 'Parent Calls', 'Notices', 'Lectures', 'Resources'];

  const filteredLogs = activityLog.filter(item => {
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    const matchesSearch = item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.actorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Attendance': return CheckCircle2;
      case 'Parent Calls': return PhoneCall;
      case 'Notices': return Megaphone;
      case 'Lectures': return Calendar;
      case 'Resources': return FolderArchive;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">System Activity & Audit Trail</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Chronological, immutable audit log of all academic actions, attendance modifications, and parent calls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-900" />
            Integrity Verified (SHA-256)
          </span>
        </div>
      </div>

      {/* Filter Ribbon & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                filterCategory === cat
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white border border-zinc-200 text-zinc-600 hover:text-black hover:bg-zinc-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit actions or actor..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded focus:bg-white focus:outline-none focus:border-zinc-900"
          />
        </div>
      </div>

      {/* Audit Log Chronological Feed */}
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden divide-y divide-zinc-100">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400 font-mono">
            No audit records matching current filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const Icon = getCategoryIcon(log.category);
            return (
              <div key={log.id} className="p-4 hover:bg-zinc-50/50 transition-colors flex items-start gap-4">
                <div className="p-2 rounded bg-zinc-100 border border-zinc-200 shrink-0 text-zinc-800">
                  <Icon className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-900">{log.action}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {log.batchName}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-zinc-400">{log.timestamp}</span>
                  </div>

                  <p className="text-xs text-zinc-700 leading-relaxed font-sans">{log.details}</p>

                  <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                    <span>Actor: <strong className="text-zinc-700">{log.actorName}</strong> ({log.actorRole})</span>
                    <span>·</span>
                    <span>Category: {log.category}</span>
                    <span>·</span>
                    <span>Ref: #{log.id}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
