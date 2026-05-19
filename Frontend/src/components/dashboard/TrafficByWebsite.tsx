import React from 'react';
import { Card } from '../ui/Card';

const websites = [
  { name: 'Google', value: 80 },
  { name: 'YouTube', value: 60 },
  { name: 'Instagram', value: 90, active: true },
  { name: 'Pinterest', value: 50 },
  { name: 'Facebook', value: 70 },
  { name: 'Twitter', value: 40 },
  { name: 'Tumblr', value: 30 },
];

export const TrafficByWebsite = () => {
  return (
    <Card className="bg-white/5 flex flex-col h-full">
      <h3 className="text-primary text-sm font-semibold mb-6">Traffic by Website</h3>
      <div className="space-y-5 flex-1">
        {websites.map((site, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-primary text-xs w-16">{site.name}</span>
            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${site.active ? 'bg-accent-purple' : 'bg-white/10'}`}
                style={{ width: `${site.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
