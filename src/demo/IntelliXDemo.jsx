import React from 'react';
import { DemoProvider, useDemo } from './DemoContext';
import { DemoSidebar } from './components/DemoSidebar';
import { DemoHeader } from './components/DemoHeader';
import { DemoModals } from './components/DemoModals';

// Views
import { DashboardView } from './views/DashboardView';
import { BatchesView } from './views/BatchesView';
import { ScheduleView } from './views/ScheduleView';
import { AttendanceView } from './views/AttendanceView';
import { NoticesView } from './views/NoticesView';
import { ResourcesView } from './views/ResourcesView';
import { AnalyticsView } from './views/AnalyticsView';
import { ActivityLogView } from './views/ActivityLogView';
import { SettingsView } from './views/SettingsView';

const DemoContainer = () => {
  const { currentView, toastMessage } = useDemo();

  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'batches':
        return <BatchesView />;
      case 'schedule':
        return <ScheduleView />;
      case 'attendance':
        return <AttendanceView />;
      case 'notices':
        return <NoticesView />;
      case 'resources':
        return <ResourcesView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'activity':
        return <ActivityLogView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-zinc-900 font-sans selection:bg-zinc-200">
      {/* 1. Left Fixed Sidebar */}
      <DemoSidebar />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <DemoHeader />

        {/* Viewport Canvas */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#FAFAFA]/70">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* 3. Global Overlays & Modals */}
      <DemoModals />

      {/* 4. Minimalist Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black text-white px-4 py-2.5 rounded-md text-xs font-medium shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function IntelliXDemo() {
  return (
    <DemoProvider>
      <DemoContainer />
    </DemoProvider>
  );
}
