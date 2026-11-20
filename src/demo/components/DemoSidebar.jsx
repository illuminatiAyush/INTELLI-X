import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CheckSquare, 
  Megaphone, 
  FolderArchive, 
  LineChart, 
  Clock, 
  Settings,
  ArrowUpRight,
  Shield
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const DemoSidebar = () => {
  const { currentRole, currentView, setCurrentView } = useDemo();

  // Navigation Items per Role:
  // Admin: Dashboard, Batches, Schedule, Attendance, Notices, Resources, Analytics, Activity Log
  // Teacher: Dashboard, Batches, Schedule, Attendance, Notices, Resources (No Analytics, No Activity Log)
  // Student: Dashboard, Schedule, My Attendance, Notices, Resources (No Batches, No Analytics, No Activity Log)

  const adminNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'resources', label: 'Resources', icon: FolderArchive },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'activity', label: 'Activity Log', icon: Clock }
  ];

  const teacherNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'batches', label: 'Batches', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'attendance', label: 'Attendance', icon: CheckSquare },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'resources', label: 'Resources', icon: FolderArchive }
  ];

  const studentNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
    { id: 'notices', label: 'Notices', icon: Megaphone },
    { id: 'resources', label: 'Resources', icon: FolderArchive }
  ];

  const activeNavList = currentRole === 'Admin' 
    ? adminNav 
    : currentRole === 'Teacher' 
      ? teacherNav 
      : studentNav;

  return (
    <aside className="w-64 bg-black text-white flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none border-r border-zinc-900">
      {/* Top: Wordmark & Role Pill */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-white text-black flex items-center justify-center font-bold text-xs tracking-tight">
              IX
            </div>
            <div>
              <span className="font-semibold text-sm tracking-tight text-white block">IntelliX</span>
              <span className="text-[10px] text-zinc-500 font-mono tracking-widest block uppercase">Academic OS</span>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded border border-zinc-800 text-zinc-400 font-mono uppercase">
            {currentRole}
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[10px] font-semibold tracking-wider text-zinc-600 uppercase">
            Menu
          </div>

          {activeNavList.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-zinc-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Settings & Academy Metadata */}
      <div className="p-3 border-t border-zinc-900 space-y-2">
        <button
          onClick={() => setCurrentView('settings')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            currentView === 'settings'
              ? 'bg-white text-black font-semibold'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </button>

        <div className="px-3 py-2 rounded bg-zinc-950 border border-zinc-900 text-[11px] text-zinc-500 font-mono flex items-center justify-between">
          <span>Eskolaria Academy</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="System Operational" />
        </div>
      </div>
    </aside>
  );
};
