import React from 'react';
import { Contact } from '../types';
import { Plus, UserCheck, Search, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface PeopleSectionProps {
  contacts: Contact[];
  onSelectContact: (contact: Contact) => void;
  onAddNewContact: () => void;
}

export const PeopleSection: React.FC<PeopleSectionProps> = ({
  contacts,
  onSelectContact,
  onAddNewContact,
}) => {
  return (
    <section className="px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              People & Businesses
            </h2>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {contacts.length}
            </span>
          </div>

          <button
            id="add-new-contact-header-btn"
            onClick={() => {
              sound.playKeyClick();
              onAddNewContact();
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Payee</span>
          </button>
        </div>

        {/* Horizontal avatar list + grid on larger screens */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
          {/* Add New Payee Tile */}
          <button
            id="add-payee-quick-tile"
            onClick={() => {
              sound.playKeyClick();
              onAddNewContact();
            }}
            className="flex-shrink-0 flex flex-col items-center justify-center w-16 group focus:outline-none snap-start"
          >
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-slate-700 hover:border-emerald-500/80 bg-slate-800/40 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-all group-hover:scale-105">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-slate-200 mt-1.5 font-medium text-center truncate w-full">
              Add New
            </span>
          </button>

          {/* Contact Avatars */}
          {contacts.map((contact) => (
            <button
              key={contact.id}
              id={`contact-item-${contact.id}`}
              onClick={() => {
                sound.playKeyClick();
                onSelectContact(contact);
              }}
              className="flex-shrink-0 flex flex-col items-center w-16 group focus:outline-none snap-start"
              title={`Pay ${contact.name} (${contact.upiId})`}
            >
              <div className="relative">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-0.5 ring-2 ring-transparent group-hover:ring-emerald-500/70 overflow-hidden bg-slate-800 transition-all group-hover:scale-105 shadow-md">
                  {contact.avatar ? (
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm">
                      {contact.initials || contact.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {contact.isFavorite && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] text-slate-950 font-bold">
                    ★
                  </span>
                )}
              </div>

              <span className="text-[11px] font-medium text-slate-200 group-hover:text-emerald-300 mt-1.5 truncate w-full text-center">
                {contact.name.split(' ')[0]}
              </span>
              <span className="text-[9px] text-slate-500 truncate w-full text-center">
                {contact.lastAmount ? `₹${contact.lastAmount}` : 'Pay'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
