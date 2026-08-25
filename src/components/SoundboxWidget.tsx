import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Play, Globe, Radio } from 'lucide-react';
import { sound } from '../utils/audio';

interface SoundboxWidgetProps {
  soundEnabled: boolean;
  soundboxVoiceEnabled: boolean;
  soundboxLanguage: 'hi-IN' | 'en-IN';
  onToggleSoundboxVoice: () => void;
  onChangeLanguage: (lang: 'hi-IN' | 'en-IN') => void;
  lastAmount: number;
}

export const SoundboxWidget: React.FC<SoundboxWidgetProps> = ({
  soundEnabled,
  soundboxVoiceEnabled,
  soundboxLanguage,
  onToggleSoundboxVoice,
  onChangeLanguage,
  lastAmount,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const handleTestAnnouncement = () => {
    sound.playKeyClick();
    setIsPlaying(true);
    sound.playPaymentSuccessChime();
    sound.announceSoundbox(lastAmount || 500, soundboxLanguage);
    setTimeout(() => setIsPlaying(false), 2500);
  };

  return (
    <section className="px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl p-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          {/* Soundbox Identity */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Volume2 className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Smart Voice Soundbox
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  LIVE AUDIO
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Voice alerts on payment receipt via Web Audio & Speech
              </p>
            </div>
          </div>

          {/* Controls: Language toggle + Test Play */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Language Switch */}
            <div className="flex bg-slate-800 rounded-xl p-0.5 border border-slate-700">
              <button
                onClick={() => {
                  sound.playKeyClick();
                  onChangeLanguage('en-IN');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  soundboxLanguage === 'en-IN'
                    ? 'bg-slate-700 text-slate-100 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => {
                  sound.playKeyClick();
                  onChangeLanguage('hi-IN');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  soundboxLanguage === 'hi-IN'
                    ? 'bg-slate-700 text-slate-100 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Test Button */}
            <button
              id="test-soundbox-voice-btn"
              onClick={handleTestAnnouncement}
              disabled={isPlaying}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Test Audio</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
