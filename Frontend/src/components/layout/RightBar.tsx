import { Bug, User, Radio } from 'lucide-react';
import { Avatar } from '../ui/Avatar';

const notifications = [
  { icon: <Bug size={14} />, message: 'You have a bug that needs to be fixed.', time: 'Just now', color: 'bg-accent-sky' },
  { icon: <User size={14} />, message: 'New user registered', time: '59 minutes ago', color: 'bg-accent-visits' },
  { icon: <Bug size={14} />, message: 'You have a bug that needs to be fixed.', time: '12 hours ago', color: 'bg-accent-sky' },
  { icon: <Radio size={14} />, message: 'Andi Lane subscribed to you', time: 'Today, 11:59 AM', color: 'bg-accent-visits' },
];

const activities = [
  { avatar: 'https://i.pravatar.cc/150?u=1', action: 'You have a bug that needs to be fixed.', time: 'Just now' },
  { avatar: 'https://i.pravatar.cc/150?u=2', action: 'Released a new version', time: '59 minutes ago' },
  { avatar: 'https://i.pravatar.cc/150?u=3', action: 'Submitted a bug', time: '12 hours ago' },
  { avatar: 'https://i.pravatar.cc/150?u=4', action: 'Modified A data in Page X', time: 'Today, 11:59 AM' },
  { avatar: 'https://i.pravatar.cc/150?u=5', action: 'Deleted a page in Project X', time: 'Feb 2, 2023' },
];

const contacts = [
  { name: 'Natali Craig', avatar: 'https://i.pravatar.cc/150?u=6' },
  { name: 'Drew Cano', avatar: 'https://i.pravatar.cc/150?u=7' },
  { name: 'Orlando Diggs', avatar: 'https://i.pravatar.cc/150?u=8' },
  { name: 'Andi Lane', avatar: 'https://i.pravatar.cc/150?u=9' },
  { name: 'Kate Morrison', avatar: 'https://i.pravatar.cc/150?u=10' },
  { name: 'Koray Okumus', avatar: 'https://i.pravatar.cc/150?u=11' },
];

export const RightBar = () => {
  return (
    <aside className="w-[280px] h-screen bg-sidebar border-l border-border flex flex-col p-5 fixed right-0 top-0 overflow-y-auto hidden xl:flex">
      <div className="space-y-8">
        <section>
          <h3 className="text-primary text-sm font-semibold mb-4 px-1">Notifications</h3>
          <div className="space-y-4">
            {notifications.map((item, idx) => (
              <div key={idx} className="flex gap-3 px-1">
                <div className={`w-6 h-6 rounded-lg ${item.color} flex items-center justify-center shrink-0 mt-0.5`}>
                  {item.icon}
                </div>
                <div className="flex flex-col">
                  <p className="text-primary text-xs leading-relaxed">{item.message}</p>
                  <span className="text-secondary text-[10px] mt-1">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-primary text-sm font-semibold mb-4 px-1">Activities</h3>
          <div className="space-y-4">
            {activities.map((item, idx) => (
              <div key={idx} className="flex gap-3 px-1">
                <Avatar src={item.avatar} alt="User" size="sm" className="mt-0.5" />
                <div className="flex flex-col">
                  <p className="text-primary text-xs leading-relaxed">{item.action}</p>
                  <span className="text-secondary text-[10px] mt-1">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-primary text-sm font-semibold mb-4 px-1">Contacts</h3>
          <div className="space-y-3">
            {contacts.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 px-1 hover:bg-white/5 p-1 rounded-lg transition-colors cursor-pointer">
                <Avatar src={item.avatar} alt={item.name} size="sm" />
                <span className="text-primary text-xs">{item.name}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </aside>
  );
};
