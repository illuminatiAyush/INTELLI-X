import React from 'react';
import { Settings, Shield, Bell, Lock, Database, UserCheck } from 'lucide-react';
import { useDemo } from '../DemoContext';

export const SettingsView = () => {
  const { institute, currentRole, currentPersona } = useDemo();

  return (
    <div className="space-y-6 max-w-3xl animate-in fade-in duration-150">
      <div className="border-b border-zinc-200 pb-5">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900">System Configuration</h1>
        <p className="text-xs text-zinc-500 mt-1">
          Academy institutional parameters, role simulation parameters, and attendance thresholds.
        </p>
      </div>

      <div className="space-y-4">
        {/* Academy Meta */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Institution Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-500 block">Academy Name</span>
              <span className="font-semibold text-zinc-900">{institute.name}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Academic Year</span>
              <span className="font-mono text-zinc-900">{institute.academicYear}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Campus Address</span>
              <span className="text-zinc-900">{institute.location}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Authorized Principal</span>
              <span className="text-zinc-900">{institute.principal}</span>
            </div>
          </div>
        </div>

        {/* Current Active Persona */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Simulated Persona Session
          </h3>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center font-bold text-sm text-zinc-800">
              {currentPersona.avatarText}
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-900">{currentPersona.name}</p>
              <p className="text-[11px] text-zinc-500 font-mono">Active RBAC Scope: {currentRole}</p>
              <p className="text-[11px] text-zinc-400 font-mono">{currentPersona.email}</p>
            </div>
          </div>
        </div>

        {/* Attendance Rule Parameters */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
            Compliance Policy Rules
          </h3>
          <div className="text-xs space-y-2 text-zinc-700">
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span>Low Attendance Trigger Threshold</span>
              <span className="font-mono font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                &lt; 75.0%
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-zinc-100">
              <span>Automatic Parent Escalation Notice</span>
              <span className="font-mono text-zinc-900 font-medium">Enabled (Direct Phone & SMS Dispatch)</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span>Immutable Activity Trail Persistence</span>
              <span className="font-mono text-zinc-900 font-medium">Active (Linear Audit Ledger)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
