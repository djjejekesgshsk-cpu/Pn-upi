import React, { useState } from 'react';
import { Contact, SplitGroup, SplitMember } from '../types';
import {
  X,
  Split,
  Plus,
  Check,
  Users,
  Send,
  Sparkles,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { sound } from '../utils/audio';

interface SplitBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  splitGroups: SplitGroup[];
  onSaveGroup: (group: SplitGroup) => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({
  isOpen,
  onClose,
  contacts,
  splitGroups,
  onSaveGroup,
}) => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'EXISTING'>('NEW');
  const [title, setTitle] = useState<string>('');
  const [totalAmount, setTotalAmount] = useState<string>('');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState<string>('');

  if (!isOpen) return null;

  const numTotal = parseFloat(totalAmount) || 0;
  const memberCount = selectedContactIds.length + 1; // +1 for "You"
  const perPersonAmount = memberCount > 0 && numTotal > 0 ? Math.round(numTotal / memberCount) : 0;

  const toggleContact = (id: string) => {
    sound.playKeyClick();
    if (selectedContactIds.includes(id)) {
      setSelectedContactIds(selectedContactIds.filter((cid) => cid !== id));
    } else {
      setSelectedContactIds([...selectedContactIds, id]);
    }
  };

  const handleCreateSplit = () => {
    if (!title.trim() || numTotal <= 0) return;

    sound.playPaymentSuccessChime();

    const members: SplitMember[] = [
      {
        id: 'me',
        name: 'You (Host)',
        phone: '+91 98765 43210',
        amount: perPersonAmount,
        isPaid: true,
      },
      ...selectedContactIds.map((cid) => {
        const contact = contacts.find((c) => c.id === cid)!;
        return {
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          amount: perPersonAmount,
          isPaid: false,
        };
      }),
    ];

    const newGroup: SplitGroup = {
      id: `sg-${Date.now()}`,
      title: title.trim(),
      totalAmount: numTotal,
      createdAt: new Date().toISOString().split('T')[0],
      members,
    };

    onSaveGroup(newGroup);
    setTitle('');
    setTotalAmount('');
    setSelectedContactIds([]);
    setActiveTab('EXISTING');
  };

  const handleToggleMemberPaid = (group: SplitGroup, memberId: string) => {
    sound.playKeyClick();
    const updatedMembers = group.members.map((m) =>
      m.id === memberId ? { ...m, isPaid: !m.isPaid } : m
    );
    onSaveGroup({ ...group, members: updatedMembers });
  };

  const handleSendReminder = (name: string, amount: number) => {
    sound.playKeyClick();
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(''), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div
        id="split-bill-modal"
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <Split className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Split Bill with Friends</h3>
              <p className="text-[11px] text-slate-400">Equal split & instant UPI collect</p>
            </div>
          </div>

          <button
            id="close-split-btn"
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex gap-2 my-3 p-1 bg-slate-800 rounded-xl flex-shrink-0">
          <button
            onClick={() => {
              sound.playKeyClick();
              setActiveTab('NEW');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'NEW'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            + Create New Split
          </button>
          <button
            onClick={() => {
              sound.playKeyClick();
              setActiveTab('EXISTING');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'EXISTING'
                ? 'bg-slate-700 text-slate-100 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active Groups ({splitGroups.length})
          </button>
        </div>

        {/* Tab 1: Create New */}
        {activeTab === 'NEW' && (
          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Event / Bill Name
              </label>
              <input
                type="text"
                placeholder="e.g. Friday Pizza Night, Trip to Coorg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1">
                Total Bill Amount (₹)
              </label>
              <input
                type="number"
                placeholder="₹0"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full text-sm font-bold font-mono px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Select Friends */}
            <div>
              <label className="text-[11px] font-semibold uppercase text-slate-400 block mb-1.5">
                Select Friends ({selectedContactIds.length} added)
              </label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {contacts.map((contact) => {
                  const isSelected = selectedContactIds.includes(contact.id);
                  return (
                    <button
                      key={contact.id}
                      type="button"
                      onClick={() => toggleContact(contact.id)}
                      className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                        isSelected
                          ? 'bg-pink-950/30 border-pink-500/60 ring-1 ring-pink-500/30'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {contact.initials || contact.name.slice(0, 2)}
                      </div>
                      <span className="text-xs font-medium text-slate-200 truncate flex-1">
                        {contact.name.split(' ')[0]}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Split Breakdown Preview */}
            {numTotal > 0 && (
              <div className="p-3 rounded-xl bg-pink-950/20 border border-pink-500/30 text-center">
                <span className="text-[10px] uppercase tracking-wider text-pink-300 block">
                  Per Person Share ({memberCount} people)
                </span>
                <span className="text-xl font-bold text-pink-400 font-mono">
                  ₹{perPersonAmount.toLocaleString('en-IN')} / each
                </span>
              </div>
            )}

            <button
              onClick={handleCreateSplit}
              disabled={!title.trim() || numTotal <= 0}
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-400 disabled:opacity-40 text-slate-950 font-bold text-xs transition-all shadow-md shadow-pink-500/20"
            >
              Create Split & Send UPI Collect
            </button>
          </div>
        )}

        {/* Tab 2: Existing Groups */}
        {activeTab === 'EXISTING' && (
          <div className="overflow-y-auto space-y-3 flex-1 pr-1">
            {splitGroups.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">No active split groups</div>
            ) : (
              splitGroups.map((group) => {
                const totalPaid = group.members
                  .filter((m) => m.isPaid)
                  .reduce((s, m) => s + m.amount, 0);

                return (
                  <div
                    key={group.id}
                    className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700/80 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-100">{group.title}</h4>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        ₹{group.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Collected: ₹{totalPaid}</span>
                        <span>{Math.round((totalPaid / group.totalAmount) * 100)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${(totalPaid / group.totalAmount) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Member list */}
                    <div className="space-y-1 pt-1">
                      {group.members.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between text-xs py-1 border-t border-slate-750/50"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-slate-300 font-medium">{member.name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ₹{member.amount}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleMemberPaid(group, member.id)}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                                member.isPaid
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {member.isPaid ? 'Paid' : 'Pending'}
                            </button>

                            {!member.isPaid && (
                              <button
                                onClick={() => handleSendReminder(member.name, member.amount)}
                                className="p-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-300"
                                title="Send UPI Reminder"
                              >
                                <Send className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {copiedLink && (
                      <p className="text-[10px] text-emerald-400 text-center animate-fadeIn">
                        Payment reminder link sent to {copiedLink}!
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};
