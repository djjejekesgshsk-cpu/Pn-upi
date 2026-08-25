import React from 'react';
import { X, Bell, CheckCircle2, ArrowDownLeft, Gift, ShieldAlert, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPayNotificationRequest?: (name: string, upiId: string, amount: number) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  onPayNotificationRequest,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n1',
      title: 'Payment Request from Rohan Verma',
      desc: 'Requested ₹350 for Friday Badminton Court booking',
      time: '10 mins ago',
      type: 'REQUEST',
      amount: 350,
      vpa: 'rohan.verma@paytm',
      name: 'Rohan Verma',
    },
    {
      id: 'n2',
      title: 'Cashback Credited: ₹25',
      desc: 'Cashback on your electricity bill payment was credited to HDFC Bank XX4092',
      time: '2 hours ago',
      type: 'CASHBACK',
    },
    {
      id: 'n3',
      title: 'AutoPay Mandate Scheduled',
      desc: 'Netflix Subscription mandate of ₹649 scheduled for 28th Aug',
      time: 'Yesterday',
      type: 'MANDATE',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="notifications-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Activity & Alerts</h3>
              <p className="text-[11px] text-slate-400">Payment requests and UPI mandates</p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-2xl bg-slate-850 border border-slate-800 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{n.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{n.desc}</p>
                </div>
                <span className="text-[10px] text-slate-500 whitespace-nowrap">{n.time}</span>
              </div>

              {n.type === 'REQUEST' && onPayNotificationRequest && (
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => {
                      sound.playKeyClick();
                      onClose();
                      onPayNotificationRequest(n.name!, n.vpa!, n.amount!);
                    }}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                  >
                    Pay ₹{n.amount}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
