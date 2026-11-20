import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Check, 
  X,
  PhoneCall,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useDemo } from '../DemoContext';

export const DemoHeader = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentPersona, 
    notifications, 
    setNotifications,
    showToast,
    institute
  } = useDemo();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read");
  };

  return (
    <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Organization context & Global search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Academy</span>
          <span className="text-sm font-semibold text-zinc-900">{institute.name}</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
            {institute.academicYear}
          </span>
        </div>

        <div className="relative flex-1 hidden md:block">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students, batches, lectures (Press '/' to focus)..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:bg-white focus:outline-none focus:border-zinc-900 transition-colors placeholder:text-zinc-400"
          />
        </div>
      </div>

      {/* Right: Actions, Notifications, Role Switcher & Profile */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setBellOpen(!bellOpen)}
            className="relative p-2 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-lg shadow-lg p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-900">Activity Alerts</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[11px] text-zinc-500 hover:text-black font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    className={`p-2 rounded text-xs transition-colors ${
                      n.read ? 'bg-white text-zinc-500' : 'bg-zinc-50 font-medium text-zinc-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="leading-snug">{n.title}</p>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1 shrink-0" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 mt-1 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Role Switcher (Critical Demo Feature) */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-black transition-colors focus:outline-none shadow-sm"
          >
            <span className="text-zinc-400 font-normal">Role:</span>
            <span className="font-semibold">{currentRole}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-100">
                Switch Live Persona
              </div>
              
              <button
                onClick={() => {
                  setCurrentRole('Admin');
                  setRoleDropdownOpen(false);
                  showToast("Switched persona to Admin (Full Access)");
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-50 ${
                  currentRole === 'Admin' ? 'font-semibold text-black bg-zinc-50' : 'text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Admin</span>
                </div>
                {currentRole === 'Admin' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentRole('Teacher');
                  setRoleDropdownOpen(false);
                  showToast("Switched persona to Teacher (Assigned Batches)");
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-50 ${
                  currentRole === 'Teacher' ? 'font-semibold text-black bg-zinc-50' : 'text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Teacher</span>
                </div>
                {currentRole === 'Teacher' && <Check className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => {
                  setCurrentRole('Student');
                  setRoleDropdownOpen(false);
                  showToast("Switched persona to Student (My View)");
                }}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-zinc-50 ${
                  currentRole === 'Student' ? 'font-semibold text-black bg-zinc-50' : 'text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Student</span>
                </div>
                {currentRole === 'Student' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* User Profile Thumbnail */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-200">
          <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center text-xs font-semibold text-zinc-800">
            {currentPersona.avatarText}
          </div>
          <div className="hidden lg:block text-left leading-tight">
            <p className="text-xs font-semibold text-zinc-900">{currentPersona.name}</p>
            <p className="text-[10px] text-zinc-500 font-mono">{currentPersona.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
