import React from 'react';
import { CheckCheck, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
}) => {
  const { notifications, markNotificationRead, markAllNotificationsRead, setActiveTab } = useApp();

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-80 md:w-96 rounded-2xl bg-[#171923]/95 dark:bg-[#13151f]/95 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-4 text-white z-50 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Notificações</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            {notifications.filter((n) => !n.read).length} novas
          </span>
        </div>
        <button
          onClick={markAllNotificationsRead}
          className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
        >
          <CheckCheck size={14} />
          Marcar todas como lidas
        </button>
      </div>

      <div className="mt-3 max-h-80 overflow-y-auto space-y-2.5 pr-1">
        {notifications.length === 0 ? (
          <p className="text-xs text-white/40 py-6 text-center">Nenhuma notificação no momento</p>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.linkTab) {
                  setActiveTab(notif.linkTab);
                  onClose();
                }
              }}
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                notif.read
                  ? 'bg-white/[0.02] border-white/5 text-white/60 hover:bg-white/[0.05]'
                  : 'bg-white/[0.07] border-white/15 text-white hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                    )}
                    <h4 className="text-xs font-semibold text-white/90 leading-tight">
                      {notif.title}
                    </h4>
                  </div>
                  <p className="text-[11px] text-white/50 mt-1 line-clamp-2">
                    {notif.subtitle}
                  </p>
                </div>
                <span className="text-[10px] text-white/40 shrink-0 flex items-center gap-1">
                  <Clock size={10} />
                  {notif.time}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-white/40">
        <span>Notificações do Pane</span>
        <button
          onClick={() => {
            setActiveTab('settings');
            onClose();
          }}
          className="hover:text-white transition-colors flex items-center gap-1"
        >
          Configurações
          <ExternalLink size={11} />
        </button>
      </div>
    </div>
  );
};
