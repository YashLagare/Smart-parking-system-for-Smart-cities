'use client';

import React, { useState } from 'react';
import { useStore, User } from '../store';
import { Bell, User as UserIcon, ShieldAlert, Cpu, LogOut, CheckCircle, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  const { user, activeRole, setActiveRole, logout, notifications, setNotifications } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const roles = [
    { id: 'DRIVER', label: 'Driver / User' },
    { id: 'OPERATOR', label: 'Parking Operator' },
    { id: 'SUPER_ADMIN', label: 'Super Admin' },
    { id: 'CITY_AUTHORITY', label: 'City Authority' },
  ];

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-blue to-cyber-purple flex items-center justify-center shadow-lg shadow-cyber-blue/20">
          <Cpu className="w-5 h-5 text-white animate-pulse" />
        </div>
        <Link href="/" className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-cyber-blue via-white to-cyber-purple bg-clip-text text-transparent">
          SMARTPARK AI
        </Link>
        <span className="hidden sm:inline text-[10px] tracking-widest text-cyber-blue bg-cyber-blue/10 px-2 py-0.5 rounded-full border border-cyber-blue/20">
          PRO-SaaS
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Role Selector Trigger */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-cyber-blue/40 text-xs font-semibold text-gray-300 transition-all"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-cyber-blue" />
            <span>Role: {activeRole.replace('_', ' ')}</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>
          
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl glass-panel border border-white/10 p-1 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-[10px] uppercase font-bold tracking-widest text-gray-500 border-b border-white/5">
                Simulate View Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setActiveRole(r.id as any);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-all flex items-center justify-between ${
                    activeRole === r.id 
                      ? 'bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 text-cyber-blue font-semibold border-l-2 border-cyber-blue' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.label}
                  {activeRole === r.id && <CheckCircle className="w-3.5 h-3.5 text-cyber-blue" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifyOpen(!notifyOpen)}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyber-pink animate-ping" />
            )}
          </button>

          {notifyOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl glass-panel border border-white/10 p-4 shadow-2xl z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                <span className="text-xs font-bold text-gray-300">Live Alerts</span>
                {notifications.length > 0 && (
                  <button onClick={clearNotifications} className="text-[10px] text-cyber-pink hover:underline">
                    Clear All
                  </button>
                )}
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-gray-500 py-4">No active system alerts.</p>
                ) : (
                  notifications.map((n: any) => (
                    <div key={n.id} className="text-xs border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div className="font-semibold text-white">{n.title}</div>
                      <div className="text-gray-400 mt-0.5">{n.message}</div>
                      <div className="text-[10px] text-gray-500 mt-1">{n.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card & Logout */}
        {user ? (
          <div className="flex items-center gap-3 border-l border-white/10 pl-6">
            <div className="hidden md:block text-right">
              <div className="text-xs font-semibold text-white">{user.name}</div>
              <div className="text-[10px] text-gray-400">{user.email}</div>
            </div>
            <button 
              onClick={logout}
              className="p-2 rounded-lg bg-cyber-pink/10 hover:bg-cyber-pink/20 text-cyber-pink transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyber-blue to-cyber-purple hover:opacity-90 text-xs font-bold text-white shadow-lg transition-all"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Portal Sign-in</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
