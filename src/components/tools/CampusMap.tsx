import { useState } from 'react';
import { BookOpen, Dumbbell, FlaskConical, Landmark, LogIn, Bed, Utensils, Trees, type LucideIcon } from 'lucide-react';

interface Building {
  id: string;
  name: string;
  description: string;
  x: number;
  y: number;
  w: number;
  h: number;
  icon: LucideIcon;
}

const BUILDINGS: Building[] = [
  { id: 'gate', name: 'Main Gate', description: 'Main entrance for students. Carry your student ID card when entering campus.', x: 40, y: 300, w: 110, h: 60, icon: LogIn },
  { id: 'admin', name: 'Administration Block', description: 'Offices for academic records, the ID Card Section, fees and student services.', x: 250, y: 40, w: 150, h: 80, icon: Landmark },
  { id: 'library', name: 'Central Library', description: 'Reading halls, book issue and return desk, and the reference section.', x: 430, y: 150, w: 130, h: 90, icon: BookOpen },
  { id: 'labs', name: 'Science Labs', description: 'Practical laboratories. Follow lab safety rules and wear your ID card.', x: 60, y: 60, w: 130, h: 90, icon: FlaskConical },
  { id: 'canteen', name: 'Student Canteen', description: 'Food court and seating area open during college hours.', x: 250, y: 170, w: 120, h: 70, icon: Utensils },
  { id: 'hostel', name: 'Hostel Block', description: 'Residential hostel. Check the entry and curfew timings at the warden’s office.', x: 430, y: 300, w: 130, h: 70, icon: Bed },
  { id: 'sports', name: 'Sports Ground', description: 'Playing field and gymnasium for sports and fitness activities.', x: 230, y: 290, w: 160, h: 90, icon: Dumbbell },
];

const ROADS = [
  'M 0 270 L 600 270',
  'M 220 0 L 220 400',
  'M 400 0 L 400 400',
];

export default function CampusMap() {
  const [selectedId, setSelectedId] = useState<string>(BUILDINGS[0].id);
  const selected = BUILDINGS.find((b) => b.id === selectedId) ?? BUILDINGS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="card overflow-hidden p-4 sm:p-5">
        <svg viewBox="0 0 600 400" className="h-auto w-full rounded-xl bg-emerald-50 dark:bg-slate-950" role="img" aria-label="Schematic campus map">
          <rect x="0" y="0" width="600" height="400" className="fill-emerald-50 dark:fill-slate-950" />
          <g className="stroke-slate-300 dark:stroke-slate-700" strokeWidth="18" strokeLinecap="round" fill="none">
            {ROADS.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
          {BUILDINGS.map((b) => {
            const active = b.id === selectedId;
            return (
              <g
                key={b.id}
                onClick={() => setSelectedId(b.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') setSelectedId(b.id);
                }}
                role="button"
                tabIndex={0}
                aria-label={b.name}
                aria-pressed={active}
                className="cursor-pointer outline-none transition-transform duration-200 hover:opacity-90"
              >
                <rect
                  x={b.x}
                  y={b.y}
                  width={b.w}
                  height={b.h}
                  rx="14"
                  className={`transition-all duration-300 ${
                    active ? 'fill-brand-600 stroke-amber-400' : 'fill-white stroke-brand-300 dark:fill-slate-800 dark:stroke-brand-700'
                  }`}
                  strokeWidth={active ? 4 : 2}
                />
                <text
                  x={b.x + b.w / 2}
                  y={b.y + b.h / 2 + 5}
                  textAnchor="middle"
                  className={`pointer-events-none select-none text-[15px] font-semibold ${active ? 'fill-white' : 'fill-slate-700 dark:fill-slate-200'}`}
                >
                  {b.name}
                </text>
              </g>
            );
          })}
          <g className="pointer-events-none">
            <circle cx="555" cy="30" r="14" className="fill-amber-400" />
            <text x="555" y="35" textAnchor="middle" className="fill-slate-900 text-[14px] font-bold">N</text>
          </g>
        </svg>
        <p className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Trees className="h-3.5 w-3.5" /> Schematic sample map, not to scale. Tap a building to see what it is used for.
        </p>
      </div>

      <aside className="card flex flex-col p-6 animate-fade-in" key={selected.id}>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
          <selected.icon className="h-6 w-6" />
        </span>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{selected.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{selected.description}</p>
        <div className="mt-6 grid grid-cols-2 gap-2">
          {BUILDINGS.filter((b) => b.id !== selectedId).slice(0, 4).map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedId(b.id)}
              className="truncate rounded-lg border border-slate-200 px-2 py-2 text-xs font-medium text-slate-700 transition hover:border-brand-400 hover:text-brand-700 dark:border-slate-700 dark:text-slate-300 dark:hover:text-brand-300"
            >
              {b.name}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
