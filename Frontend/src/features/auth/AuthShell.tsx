import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';
import { Avatar } from '../../components/ui/Avatar';

export interface AuthStep {
  label: string;
  state: 'active' | 'done' | 'upcoming';
}

interface AuthShellProps {
  hero: { title: string; subtitle: string };
  steps: AuthStep[];
  children: ReactNode;
}

export const AuthShell = ({ hero, steps, children }: AuthShellProps) => (
  <div className="min-h-screen bg-background font-sans text-primary p-4 sm:p-6 lg:p-8">
    <div className="mx-auto w-full max-w-[1400px] min-h-[calc(100vh-2rem)] sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)] rounded-md overflow-hidden grid grid-cols-1 md:grid-cols-2 shadow-xl">
      {/* Left panel — brand, hero, step indicator */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent-brand/25 via-accent-purple/10 to-accent-indigo/20 p-8 md:p-12 lg:p-14 flex flex-col">
        <div
          aria-hidden
          className="absolute -top-40 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent-purple/15 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute -bottom-40 -left-28 w-[24rem] h-[24rem] rounded-full bg-accent-brand/10 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden
          className="absolute top-1/3 left-1/3 w-[18rem] h-[18rem] rounded-full bg-accent-indigo/10 blur-3xl pointer-events-none"
        />

        <div className="relative flex items-center gap-2.5">
          <Avatar src="/leadsrack-logo.jpg" alt="Leadsrack" size="lg" />
          <span className="font-display font-semibold text-primary mt-1 text-[18px]">Leadsrack</span>
        </div>

        <div className="relative flex-1 flex flex-col justify-end mt-12 md:mt-0">
          <div className="md:flex md:items-end md:justify-between md:gap-6 mb-8 md:mb-10">
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-semibold text-primary leading-[1.1] md:max-w-[14ch]">
              {hero.title}
            </h2>
            <p className="text-secondary text-sm leading-relaxed md:max-w-[22ch] mt-3 md:mt-0">
              {hero.subtitle}
            </p>
          </div>

          <div className="flex md:grid md:grid-cols-3 gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-8 px-8 md:mx-0 md:px-0 md:overflow-visible">
            {steps.map((step, idx) => (
              <div
                key={step.label}
                className={cn(
                  'rounded-[10px] p-4 lg:p-5 min-w-[150px] md:min-w-0 min-h-[120px] lg:min-h-[140px] flex flex-col justify-between transition-colors flex-shrink-0',
                  step.state === 'active'
                    ? 'bg-gradient-to-br from-accent-brand/70 via-accent-purple/70 to-accent-indigo/70 text-ink shadow-xl ring-1 ring-white/30'
                    : 'bg-primary/5 border border-border text-secondary',
                )}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full text-[11px] font-semibold flex items-center justify-center',
                    step.state === 'active'
                      ? 'bg-ink text-white'
                      : step.state === 'done'
                        ? 'bg-accent-brand text-white'
                        : 'bg-primary/10 text-secondary',
                  )}
                >
                  {idx + 1}
                </div>
                <p
                  className={cn(
                    'font-display text-xs lg:text-sm leading-snug font-medium',
                    step.state === 'active'
                      ? 'text-ink'
                      : step.state === 'done'
                        ? 'text-primary'
                        : 'text-primary/70',
                  )}
                >
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form slot */}
      <div className="bg-background p-8 md:p-12 lg:p-16 flex flex-col justify-center">
        <div className="w-full max-w-md mx-auto">{children}</div>
      </div>
    </div>
  </div>
);
