import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bug, Radio, TrendingUp, User, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Skeleton } from '../feedback/Skeleton';
import { useUIStore } from '../../store/uiStore';
import {
  useNotifications,
  useActivities,
  useContacts,
} from '../../features/dashboard/useDashboard';
import { formatRelativeTime } from '../../lib/time';

interface NotificationStyle {
  icon: ReactNode;
  color: string;
}

const NOTIFICATION_STYLES: Record<string, NotificationStyle> = {
  bug: { icon: <Bug size={14} className="text-ink" />, color: 'bg-accent-sky' },
  user: { icon: <User size={14} className="text-ink" />, color: 'bg-accent-purple' },
  'lead-status': {
    icon: <TrendingUp size={14} className="text-ink" />,
    color: 'bg-accent-green',
  },
  subscribe: { icon: <Radio size={14} className="text-white" />, color: 'bg-accent-brand' },
};

const FALLBACK_STYLE: NotificationStyle = {
  icon: <Bug size={14} className="text-ink" />,
  color: 'bg-accent-sky',
};

function activityAvatar(email: string): string {
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(email)}`;
}

export const RightDrawer = () => {
  const isOpen = useUIStore((s) => s.rightDrawerOpen);
  const close = useUIStore((s) => s.closeRightDrawer);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const { data: notifications, isLoading: notificationsLoading } = useNotifications();
  const { data: activities, isLoading: activitiesLoading } = useActivities();
  const { data: contacts, isLoading: contactsLoading } = useContacts();

  const handleClose = () => {
    close();
    requestAnimationFrame(() => {
      document.getElementById('right-drawer-trigger')?.focus();
    });
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);

    requestAnimationFrame(() => closeBtnRef.current?.focus());

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            key="right-drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleClose}
            aria-hidden="true"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
          <motion.aside
            key="right-drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="right-drawer-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-screen w-full sm:w-[380px] bg-sidebar border-l border-border z-50 flex flex-col shadow-2xl"
          >
            <header className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2
                id="right-drawer-title"
                className="font-display text-primary text-base font-semibold"
              >
                Notifications
              </h2>
              <button
                ref={closeBtnRef}
                type="button"
                onClick={handleClose}
                aria-label="Close notifications"
                className="p-1.5 rounded-lg text-secondary hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <X size={16} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-8">
              <section>
                <h3 className="text-primary text-sm font-semibold mb-4 px-1">Notifications</h3>
                <div className="space-y-4">
                  {notificationsLoading ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="flex gap-3 px-1">
                        <Skeleton className="w-6 h-6 rounded-lg shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                    ))
                  ) : !notifications || notifications.length === 0 ? (
                    <p className="text-secondary text-xs px-1">No notifications.</p>
                  ) : (
                    notifications.map((item) => {
                      const style = NOTIFICATION_STYLES[item.kind] ?? FALLBACK_STYLE;
                      return (
                        <div key={item.id} className="flex gap-3 px-1">
                          <div
                            className={`w-6 h-6 rounded-lg ${style.color} flex items-center justify-center shrink-0 mt-0.5`}
                          >
                            {style.icon}
                          </div>
                          <div className="flex flex-col">
                            <p className="text-primary text-xs leading-relaxed">{item.message}</p>
                            <span className="text-secondary text-[10px] mt-1">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-primary text-sm font-semibold mb-4 px-1">Activities</h3>
                <div className="space-y-4">
                  {activitiesLoading ? (
                    [0, 1, 2].map((i) => (
                      <div key={i} className="flex gap-3 px-1">
                        <Skeleton className="w-6 h-6 rounded-full shrink-0 mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-3 w-full" />
                          <Skeleton className="h-2 w-16" />
                        </div>
                      </div>
                    ))
                  ) : !activities || activities.length === 0 ? (
                    <p className="text-secondary text-xs px-1">No activities.</p>
                  ) : (
                    activities.map((item) => (
                      <div key={item.id} className="flex gap-3 px-1">
                        <Avatar
                          src={activityAvatar(item.actorEmail)}
                          alt={item.actorName}
                          size="sm"
                          className="mt-0.5"
                        />
                        <div className="flex flex-col">
                          <p className="text-primary text-xs leading-relaxed">
                            <span className="font-medium">{item.actorName}</span>: {item.action}
                          </p>
                          <span className="text-secondary text-[10px] mt-1">
                            {formatRelativeTime(item.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-primary text-sm font-semibold mb-4 px-1">Contacts</h3>
                <div className="space-y-3">
                  {contactsLoading ? (
                    [0, 1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 px-1 p-1">
                        <Skeleton className="w-6 h-6 rounded-full" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    ))
                  ) : !contacts || contacts.length === 0 ? (
                    <p className="text-secondary text-xs px-1">No contacts.</p>
                  ) : (
                    contacts.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-1 hover:bg-primary/5 p-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Avatar
                          src={item.avatar ?? activityAvatar(item.email ?? item.name)}
                          alt={item.name}
                          size="sm"
                        />
                        <div className="flex flex-col">
                          <span className="text-primary text-xs">{item.name}</span>
                          {item.linkedUserRole ? (
                            <span className="text-secondary text-[10px] uppercase tracking-wider">
                              {item.linkedUserRole}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
};
