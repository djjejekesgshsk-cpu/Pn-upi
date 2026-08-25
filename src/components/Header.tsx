import React, { useState } from 'react';
import { QrCode, Bell, Volume2, VolumeX, ShieldCheck, Check, Sparkles, AlertCircle } from 'lucide-react';
import { CURRENT_USER } from '../data/mockData';
import { sound } from '../utils/audio';

interface HeaderProps {
  onOpenMyQr: () => void;
  onOpenScanner: () => void;
  onOpenProfile: () => void;
  onOpenNotifications: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  unreadCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMyQr,
  onOpenScanner,
  onOpenProfile,
  onOpenNotifications,
  soundEnabled,
  onToggleSound,
  unreadCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: User Profile & Identity */}
        <div className="flex items-center gap-3">
          <button
            id="profile-avatar-btn"
            onClick={onOpenProfile}
            className="relative group focus:outline-none"
            title="View Profile & Settings"
          >
            <div className="w-10 h-10 rounded-full ring-2 ring-emerald-500/80 p-0.5 overflow-hidden bg-slate-800 transition-transform group-hover:scale-105">
              <img
                src={CURRENT_USER.avatar}
                alt={CURRENT_USER.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
          </button>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-semibold text-slate-100 tracking-tight flex items-center gap-1">
                {CURRENT_USER.name}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
              <span>{CURRENT_USER.upiId}</span>
            </p>
          </div>
        </div>

        {/* Right Actions: Soundbox Toggle, My QR, Scan, Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Sound Toggle */}
          <button
            id="sound-toggle-btn"
            onClick={() => {
              onToggleSound();
              sound.playKeyClick();
            }}
            className={`p-2 rounded-xl border transition-colors ${
              soundEnabled
                ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
                : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title={soundEnabled ? 'Audio & Soundbox Enabled' : 'Audio Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* My QR Button */}
          <button
            id="my-qr-btn"
            onClick={() => {
              sound.playKeyClick();
              onOpenMyQr();
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700/90 text-slate-200 text-xs font-medium rounded-xl border border-slate-700/80 transition-all active:scale-95"
            title="Receive Money with My QR"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Receive</span>
          </button>

          {/* Notifications */}
          <button
            id="notifications-btn"
            onClick={() => {
              sound.playKeyClick();
              onOpenNotifications();
            }}
            className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 transition-all active:scale-95"
            title="Notifications & Alerts"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-slate-950 text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
