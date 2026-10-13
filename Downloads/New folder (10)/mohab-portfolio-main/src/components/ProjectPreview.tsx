import { Coffee, Dumbbell, Flame, WalletCards, Zap, type LucideIcon } from 'lucide-react';
import type { Project } from '@/data/projects';

interface ProjectPreviewProps {
  project: Project;
  compact?: boolean;
}

const previews: Record<string, { bg: string; tagline: string; icon: LucideIcon; lines: [string, string] }> = {
  'reds-gym': { bg: '#130707', tagline: 'Train without limits', icon: Dumbbell, lines: ['REDS', 'GYM'] },
  'expense-tracker': { bg: '#07121b', tagline: 'Money, made simple', icon: WalletCards, lines: ['EXPENSE', 'TRACKER'] },
  'fort-fitness': { bg: '#071039', tagline: 'Doha, Qatar', icon: Zap, lines: ['FORT', 'FITNESS'] },
  'loganitus-training': { bg: '#0b1311', tagline: 'Humble, TX', icon: Flame, lines: ['LOGANITUS', 'TRAINING'] },
  'batch-no9': { bg: '#140d07', tagline: 'Coffee · Deli · Dessert', icon: Coffee, lines: ['BATCH', 'NO.9'] },
  gymtech: { bg: '#150b08', tagline: 'Riyadh & Jeddah', icon: Dumbbell, lines: ['GYM', 'TECH'] },
};

export default function ProjectPreview({ project, compact = false }: ProjectPreviewProps) {
  const { bg, tagline, icon: Icon, lines } = previews[project.id];
  const long = lines[0].length > 7 || lines[1].length > 7;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ backgroundColor: bg }}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `radial-gradient(circle at 76% 18%, ${project.accent}45 0, transparent 31%), linear-gradient(135deg, transparent 0 48%, ${project.accent}18 48% 49%, transparent 49% 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.055)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.055)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className={`relative flex h-full flex-col ${compact ? 'p-5' : 'p-7 sm:p-9'}`}>
        <div className="flex items-center justify-between">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.28em] text-white/60">
            {tagline}
          </span>
          <span className="rounded-full border border-white/15 px-2.5 py-1 font-body text-[9px] uppercase tracking-widest text-white/50">Website</span>
        </div>

        <div className="my-auto">
          <div className={`mb-4 flex ${compact ? 'h-10 w-10' : 'h-14 w-14'} items-center justify-center rounded-2xl border border-white/15 bg-white/10`}>
            <Icon className="text-white" size={compact ? 19 : 27} />
          </div>
          <p className={`font-display font-bold uppercase tracking-[-0.06em] text-white ${compact ? (long ? 'text-2xl' : 'text-3xl') : long ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'}`}>
            {lines[0]}
            <br />
            <span style={{ color: project.accent }}>{lines[1]}</span>
          </p>
        </div>

        <div className="flex items-end justify-between border-t border-white/10 pt-3">
          <span className="font-body text-[10px] uppercase tracking-[0.22em] text-white/45">{project.subtitle}</span>
          <span className="h-1 w-12 rounded-full" style={{ backgroundColor: project.accent }} />
        </div>
      </div>
    </div>
  );
}
