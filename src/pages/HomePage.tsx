import { ArrowRight, BookOpen, Compass, GraduationCap, Layers, MessageCircle, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import StatCard from '@/components/StatCard';
import InfoCard from '@/components/InfoCard';
import LiveDashboard from '@/components/LiveDashboard';
import { CATEGORIES } from '@/constants';
import type { CampusRecord, LoadStatus, Route } from '@/types';

interface HomePageProps {
  records: CampusRecord[];
  status: LoadStatus;
  onNavigate: (route: Route) => void;
}

const FEATURES: { route: Route; title: string; description: string; icon: typeof MessageCircle }[] = [
  {
    route: 'chat',
    title: 'Ask NexCampus',
    description: 'Ask a question in your own words and follow up for more detail.',
    icon: MessageCircle,
  },
  {
    route: 'hub',
    title: 'Campus Hub',
    description: 'Browse attendance, hostel, library, exam and scholarship information.',
    icon: BookOpen,
  },
  {
    route: 'tools',
    title: 'Campus Tools',
    description: 'Focus timer, interactive campus map, Find My Campus and preferences.',
    icon: Compass,
  },
  {
    route: 'students',
    title: 'Student Management',
    description: 'Register students, search by name and keep their details up to date.',
    icon: GraduationCap,
  },
];

export default function HomePage({ records, status, onNavigate }: HomePageProps) {
  const ready = status === 'ready';
  const newStudentRecords = records.filter((r) => r.audience === 'new-students' || r.category === 'general').slice(0, 3);
  const coveredTopics = CATEGORIES.filter((c) => records.some((r) => r.category === c.id)).length;

  return (
    <div className="animate-fade-in">
      <section className="relative isolate overflow-hidden bg-brand-900">
        <img
          src="https://images.pexels.com/photos/7972324/pexels-photo-7972324.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
          alt="Students walking on a sunny university campus"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-900 via-brand-900/85 to-brand-800/60" />
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-medium text-brand-100">
            <Sparkles className="h-4 w-4 text-amber-300" /> Your guide to campus life
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            Find your way around campus, with confidence.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-brand-50">
            NexCampus explains campus rules, facilities and student procedures in plain language. When it does not have a
            reliable answer, it points you to the right office instead of guessing.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={() => onNavigate('chat')} className="btn-primary bg-amber-400 text-slate-900 hover:bg-amber-300">
              Ask a question <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => onNavigate('hub')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/20">
              Explore the Campus Hub
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 py-14 sm:px-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Information records" value={ready ? records.length : '—'} icon={Layers} hint="Maintained by administrators" />
          <StatCard label="Topics covered" value={ready ? `${coveredTopics} of ${CATEGORIES.length}` : '—'} icon={ShieldCheck} hint="Rules, procedures and services" />
          <StatCard label="Newcomer guidance" value={ready ? newStudentRecords.length : '—'} icon={UserPlus} hint="Start here if you are new" />
        </section>

        <section>
          <div className="mb-6 max-w-2xl">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">What you can do here</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Ways to get the answers you need and manage student details, whether you are a newcomer or a returning student.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <button
                key={feature.route}
                onClick={() => onNavigate(feature.route)}
                className="card group p-6 text-left hover:-translate-y-1 hover:border-brand-400 hover:shadow-lg"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-600/25 transition group-hover:scale-105">
                  <feature.icon className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature.description}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 dark:text-brand-300">
                  Open <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </section>

        <LiveDashboard onNavigate={onNavigate} />

        <section>
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Important guidance for newcomers</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Read these first to settle in quickly.</p>
            </div>
            <button onClick={() => onNavigate('hub')} className="btn-secondary self-start sm:self-auto">
              View all information
            </button>
          </div>
          {!ready ? (
            <p className="card p-6 text-slate-600 dark:text-slate-300">
              {status === 'loading' ? 'Loading guidance…' : 'Guidance could not be loaded because the NexCampus server is unreachable.'}
            </p>
          ) : newStudentRecords.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-3">
              {newStudentRecords.map((record) => (
                <InfoCard key={record.id} record={record} />
              ))}
            </div>
          ) : (
            <p className="card p-6 text-slate-600 dark:text-slate-300">No newcomer guidance has been published yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
