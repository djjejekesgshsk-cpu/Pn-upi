import React from 'react';
import { CURRENT_USER } from '../data/mockData';
import { AppSettings } from '../utils/storage';
import {
  X,
  ShieldCheck,
  Smartphone,
  Mail,
  QrCode,
  Volume2,
  Lock,
  RefreshCw,
  Info,
  Check,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onResetDemoData: () => void;
  onOpenMyQr: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetDemoData,
  onOpenMyQr,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="profile-settings-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playKeyClick();
            onClose();
          }}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mt-2 mb-4 pb-4 border-b border-slate-800 flex-shrink-0">
          <div className="w-16 h-16 rounded-full ring-2 ring-emerald-500/80 p-0.5 overflow-hidden bg-slate-800 mb-2">
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5 justify-center">
            {CURRENT_USER.name}
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </h3>
          <p className="text-xs text-emerald-400 font-mono mt-0.5">{CURRENT_USER.upiId}</p>
          <p className="text-xs text-slate-400 mt-0.5">{CURRENT_USER.phone} • {CURRENT_USER.email}</p>

          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
              onOpenMyQr();
            }}
            className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            <span>Show My Personal QR</span>
          </button>
        </div>

        {/* Settings options */}
        <div className="overflow-y-auto space-y-3 flex-1 pr-1">
          <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            UPI Security & Sound Preferences
          </h4>

          {/* Sound toggle */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h5 className="text-xs font-semibold text-slate-200">Tap & Keypad Audio</h5>
                <p className="text-[10px] text-slate-400">Play pleasant haptic audio on key clicks</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundEnabled: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Soundbox Voice */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h5 className="text-xs font-semibold text-slate-200">Voice Soundbox Alert</h5>
                <p className="text-[10px] text-slate-400">Announce payments with speech synthesizer</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.soundboxVoiceEnabled}
              onChange={(e) =>
                onUpdateSettings({ ...settings, soundboxVoiceEnabled: e.target.checked })
              }
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          {/* Biometric lock */}
          <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-750 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-400" />
              <div>
                <h5 className="text-xs font-semibold text-slate-200">App Security Lock</h5>
                <p className="text-[10px] text-slate-400">NPCI 2-factor authentication protection</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
              ACTIVE
            </span>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-2">
            <button
              onClick={() => {
                sound.playKeyClick();
                if (confirm('Reset UPI balances, demo contacts, and transactions to fresh state?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Sample UPI Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 text-center flex-shrink-0">
          <p className="text-[10px] text-slate-500">
            UPI App v2.4 • Certified NPCI Unified Payments Interface
          </p>
        </div>
      </div>
    </div>
  );
};
