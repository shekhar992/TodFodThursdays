import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EVENT_TYPE_META,
  type ManagedEvent,
  type ManagedEventType,
  type ManagedEventStatus,
  type PhysicalEvent,
  type QuizEvent,
  type CreativeEvent,
  type StrategyEvent,
  type WildCardEvent,
} from '../data/mockData';

// ─── Shared primitives ────────────────────────────────────────────────────
const inputCls =
  'cyber-input w-full px-4 py-2.5 rounded-xl text-sm';
const labelCls =
  'block text-xs uppercase tracking-wider text-white/40 mb-1.5 font-medium';
const errorCls =
  'text-xs text-[#F87171] mt-1 flex items-center gap-1';

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="text-[#F87171] ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className={errorCls}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

// ─── Per-type form state + validators ─────────────────────────────────────

type CommonFields = { title: string; date: string; description: string };
type PhysicalFields = { venue: string; duration: string; equipment: string };
type QuizFields = { topic: string; numQuestions: string; difficulty: 'Easy' | 'Medium' | 'Hard' };
type CreativeFields = { medium: string; theme: string; materials: string };
type StrategyFields = { format: '1v1' | 'Team' | 'FFA'; teamSize: string; timeLimit: string };
type WildCardFields = { surprise: string; revealDate: string };

type FormState = CommonFields &
  PhysicalFields &
  QuizFields &
  CreativeFields &
  StrategyFields &
  WildCardFields;

const BLANK: FormState = {
  title: '',
  date: '',
  description: '',
  venue: '',
  duration: '',
  equipment: '',
  topic: '',
  numQuestions: '',
  difficulty: 'Medium',
  medium: '',
  theme: '',
  materials: '',
  format: 'Team',
  teamSize: '',
  timeLimit: '',
  surprise: '',
  revealDate: '',
};

// ─── Type-specific form sections ──────────────────────────────────────────

function PhysicalForm({
  form,
  set,
  errors,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="Venue" required error={errors.venue}>
        <input className={errors.venue ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. Office Courtyard" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
      </Field>
      <Field label="Duration" required error={errors.duration}>
        <input className={errors.duration ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. 90 min" value={form.duration} onChange={(e) => set('duration', e.target.value)} />
      </Field>
      <Field label="Equipment / Props">
        <input className={inputCls} placeholder="e.g. Cones, batons" value={form.equipment} onChange={(e) => set('equipment', e.target.value)} />
      </Field>
    </div>
  );
}

function QuizForm({
  form,
  set,
  errors,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="Topic / Theme" required error={errors.topic}>
        <input className={errors.topic ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. General Knowledge" value={form.topic} onChange={(e) => set('topic', e.target.value)} />
      </Field>
      <Field label="No. of Questions" required error={errors.numQuestions}>
        <input type="number" className={errors.numQuestions ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. 20" min="1" value={form.numQuestions} onChange={(e) => set('numQuestions', e.target.value)} />
      </Field>
      <Field label="Difficulty">
        <select className={`${inputCls} appearance-none`} value={form.difficulty} onChange={(e) => set('difficulty', e.target.value as 'Easy' | 'Medium' | 'Hard')}>
          {['Easy', 'Medium', 'Hard'].map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </Field>
    </div>
  );
}

function CreativeForm({
  form,
  set,
  errors,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="Medium" required error={errors.medium}>
        <select className={`${errors.medium ? `${inputCls} border-[#F87171]` : inputCls} appearance-none`} value={form.medium} onChange={(e) => set('medium', e.target.value)}>
          <option value="">Choose medium…</option>
          {['Art', 'Music', 'Writing', 'Design', 'Mixed'].map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>
      <Field label="Theme" required error={errors.theme}>
        <input className={errors.theme ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. Futuristic Studio" value={form.theme} onChange={(e) => set('theme', e.target.value)} />
      </Field>
      <Field label="Materials / Tools">
        <input className={inputCls} placeholder="e.g. Figma, Whiteboard" value={form.materials} onChange={(e) => set('materials', e.target.value)} />
      </Field>
    </div>
  );
}

function StrategyForm({
  form,
  set,
  errors,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Field label="Format">
        <select className={`${inputCls} appearance-none`} value={form.format} onChange={(e) => set('format', e.target.value as '1v1' | 'Team' | 'FFA')}>
          {(['1v1', 'Team', 'FFA'] as const).map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Team Size" required error={errors.teamSize}>
        <input type="number" className={errors.teamSize ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. 3" min="1" value={form.teamSize} onChange={(e) => set('teamSize', e.target.value)} />
      </Field>
      <Field label="Time Limit" required error={errors.timeLimit}>
        <input className={errors.timeLimit ? `${inputCls} border-[#F87171]` : inputCls} placeholder="e.g. 60 min" value={form.timeLimit} onChange={(e) => set('timeLimit', e.target.value)} />
      </Field>
    </div>
  );
}

function WildCardForm({
  form,
  set,
  errors,
}: {
  form: FormState;
  set: (k: keyof FormState, v: string) => void;
  errors: Partial<Record<keyof FormState, string>>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <Field label="Surprise Description" required error={errors.surprise}>
        <textarea
          className={`${errors.surprise ? `${inputCls} border-[#F87171]` : inputCls} resize-none`}
          rows={2}
          placeholder="What's the twist? (admin-only until reveal)"
          value={form.surprise}
          onChange={(e) => set('surprise', e.target.value)}
        />
      </Field>
      <Field label="Reveal Date">
        <input type="date" className={inputCls} value={form.revealDate} onChange={(e) => set('revealDate', e.target.value)} />
      </Field>
    </div>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────

const STATUS_META: Record<ManagedEventStatus, { label: string; color: string; bg: string }> = {
  draft:     { label: 'Draft',     color: '#FFFFFF66', bg: 'rgba(255,255,255,0.06)' },
  scheduled: { label: 'Scheduled', color: '#38BDF8',   bg: 'rgba(56,189,248,0.1)' },
  completed: { label: 'Completed', color: '#34D399',   bg: 'rgba(52,211,153,0.1)' },
};

function StatusPill({ status }: { status: ManagedEventStatus }) {
  const s = STATUS_META[status];
  return (
    <span
      className="text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.color}33` }}
    >
      {s.label}
    </span>
  );
}

// ─── Event card ───────────────────────────────────────────────────────────

function EventCard({
  event,
  onPublish,
  onComplete,
  onDelete,
}: {
  event: ManagedEvent;
  onPublish: () => void;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const meta = EVENT_TYPE_META[event.type];
  const [confirmDelete, setConfirmDelete] = useState(false);

  const typeSpecificBadges = () => {
    switch (event.type) {
      case 'Physical': {
        const e = event as PhysicalEvent;
        return [e.venue && `📍 ${e.venue}`, e.duration && `⏱ ${e.duration}`].filter(Boolean) as string[];
      }
      case 'Quiz': {
        const e = event as QuizEvent;
        return [e.topic && `📚 ${e.topic}`, e.numQuestions && `${e.numQuestions} Qs`, e.difficulty].filter(Boolean) as string[];
      }
      case 'Creative': {
        const e = event as CreativeEvent;
        return [e.medium && `🎭 ${e.medium}`, e.theme && `✨ ${e.theme}`].filter(Boolean) as string[];
      }
      case 'Strategy': {
        const e = event as StrategyEvent;
        return [e.format && `⚔️ ${e.format}`, e.teamSize && `${e.teamSize}-player teams`, e.timeLimit].filter(Boolean) as string[];
      }
      case 'WildCard': {
        const e = event as WildCardEvent;
        return [e.revealDate && `👁 Reveals ${e.revealDate}`].filter(Boolean) as string[];
      }
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="rounded-xl border p-4 group"
      style={{
        background: '#131A27',
        borderColor: `${meta.color}22`,
      }}
    >
      {/* Header row */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-base flex-shrink-0 mt-0.5"
          style={{ background: `${meta.color}1A`, border: `1px solid ${meta.color}33` }}
        >
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-white text-sm leading-tight truncate">{event.title}</h4>
            <StatusPill status={event.status} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs" style={{ color: meta.color }}>{meta.emoji} {meta.label}</span>
            {event.date && <span className="text-xs text-white/30">📅 {event.date}</span>}
          </div>
        </div>
      </div>

      {/* Description */}
      {event.description && (
        <p className="text-xs text-white/40 leading-relaxed mb-3 line-clamp-2">{event.description}</p>
      )}

      {/* Type-specific badges */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {typeSpecificBadges().map((badge) => (
          <span
            key={badge}
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: `${meta.color}0F`, color: `${meta.color}BB`, border: `1px solid ${meta.color}1A` }}
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        {event.status === 'draft' && (
          <button
            onClick={onPublish}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer hover:opacity-90"
            style={{ background: `${meta.color}22`, color: meta.color, border: `1px solid ${meta.color}33` }}
          >
            ↑ Publish
          </button>
        )}
        {event.status === 'scheduled' && (
          <button
            onClick={onComplete}
            className="flex-1 text-xs py-1.5 rounded-lg font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer hover:opacity-90"
            style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            ✓ Mark Completed
          </button>
        )}
        {event.status === 'completed' && (
          <span className="flex-1 text-xs text-white/20 text-center py-1.5">Event finished</span>
        )}

        {/* Delete */}
        {confirmDelete ? (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-white/40">Sure?</span>
            <button onClick={onDelete} className="text-xs px-2.5 py-1.5 rounded-lg bg-[rgba(248,113,113,0.15)] text-[#F87171] border border-[rgba(248,113,113,0.25)] font-semibold cursor-pointer hover:bg-[rgba(248,113,113,0.25)] transition-colors">
              Delete
            </button>
            <button onClick={() => setConfirmDelete(false)} className="text-xs px-2.5 py-1.5 rounded-lg bg-white/5 text-white/40 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg text-white/30 border border-white/10 cursor-pointer hover:text-[#F87171] hover:border-[rgba(248,113,113,0.25)] transition-all duration-200"
          >
            🗑
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Main EventManager ────────────────────────────────────────────────────

interface EventManagerProps {
  events: ManagedEvent[];
  onEventsUpdate: (events: ManagedEvent[]) => void;
}

export function EventManager({ events, onEventsUpdate }: EventManagerProps) {
  const [activeTab, setActiveTab] = useState<ManagedEventStatus>('scheduled');
  const [selectedType, setSelectedType] = useState<ManagedEventType | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);
  const [submitted, setSubmitted] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const setField = (k: keyof FormState, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // ── Validation ────────────────────────────────────────────────────────
  const validate = (): Partial<Record<keyof FormState, string>> => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = 'Required';
    if (selectedType === 'Physical') {
      if (!form.venue.trim()) e.venue = 'Required';
      if (!form.duration.trim()) e.duration = 'Required';
    }
    if (selectedType === 'Quiz') {
      if (!form.topic.trim()) e.topic = 'Required';
      if (!form.numQuestions.trim()) e.numQuestions = 'Required';
    }
    if (selectedType === 'Creative') {
      if (!form.medium) e.medium = 'Required';
      if (!form.theme.trim()) e.theme = 'Required';
    }
    if (selectedType === 'Strategy') {
      if (!form.teamSize.trim()) e.teamSize = 'Required';
      if (!form.timeLimit.trim()) e.timeLimit = 'Required';
    }
    if (selectedType === 'WildCard') {
      if (!form.surprise.trim()) e.surprise = 'Required';
    }
    return e;
  };

  const handleCreate = (saveAsDraft: boolean) => {
    if (!selectedType) return;
    setSubmitted(true);
    const errors = validate();
    if (Object.keys(errors).length > 0) return;

    const base = {
      id: `me-${Date.now()}`,
      type: selectedType,
      status: (saveAsDraft ? 'draft' : 'scheduled') as ManagedEventStatus,
      title: form.title.trim(),
      date: form.date
        ? new Date(form.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'TBD',
      description: form.description.trim(),
      createdAt: Date.now(),
    };

    let newEvent: ManagedEvent;
    switch (selectedType) {
      case 'Physical':
        newEvent = { ...base, type: 'Physical', venue: form.venue, duration: form.duration, equipment: form.equipment } as PhysicalEvent;
        break;
      case 'Quiz':
        newEvent = { ...base, type: 'Quiz', topic: form.topic, numQuestions: form.numQuestions, difficulty: form.difficulty } as QuizEvent;
        break;
      case 'Creative':
        newEvent = { ...base, type: 'Creative', medium: form.medium, theme: form.theme, materials: form.materials } as CreativeEvent;
        break;
      case 'Strategy':
        newEvent = { ...base, type: 'Strategy', format: form.format, teamSize: form.teamSize, timeLimit: form.timeLimit } as StrategyEvent;
        break;
      case 'WildCard':
        newEvent = { ...base, type: 'WildCard', surprise: form.surprise, revealDate: form.revealDate } as WildCardEvent;
        break;
    }

    onEventsUpdate([newEvent, ...events]);
    setForm(BLANK);
    setSubmitted(false);
    setSelectedType(null);
    setFormOpen(false);
    setActiveTab(saveAsDraft ? 'draft' : 'scheduled');
  };

  const transitionStatus = (id: string, to: ManagedEventStatus) => {
    onEventsUpdate(events.map((e) => (e.id === id ? { ...e, status: to } : e)));
  };

  const deleteEvent = (id: string) => {
    onEventsUpdate(events.filter((e) => e.id !== id));
  };

  const filtered = events.filter((e) => e.status === activeTab);
  const counts: Record<ManagedEventStatus, number> = {
    draft: events.filter((e) => e.status === 'draft').length,
    scheduled: events.filter((e) => e.status === 'scheduled').length,
    completed: events.filter((e) => e.status === 'completed').length,
  };

  const errors = submitted ? validate() : {};

  const TABS: { key: ManagedEventStatus; label: string; color: string }[] = [
    { key: 'scheduled', label: 'Scheduled', color: '#38BDF8' },
    { key: 'draft',     label: 'Draft',     color: '#FFFFFF66' },
    { key: 'completed', label: 'Completed', color: '#34D399' },
  ];

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ background: 'rgba(56,189,248,0.10)', border: '1px solid rgba(56,189,248,0.20)' }}
          >
            📋
          </div>
          <div>
            <h2 className="text-lg font-black text-white" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>Event Manager</h2>
            <p className="text-xs text-white/30 mt-0.5">{events.length} events · admin only</p>
          </div>
        </div>

        <button
          onClick={() => { setFormOpen((v) => !v); setSelectedType(null); setForm(BLANK); setSubmitted(false); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white cursor-pointer transition-all duration-200"
          style={{
            background: formOpen ? 'rgba(56,189,248,0.10)' : 'linear-gradient(135deg, #38BDF8, #34D399)',
            border: formOpen ? '1px solid rgba(56,189,248,0.25)' : 'none',
            boxShadow: formOpen ? 'none' : '0 0 20px rgba(56,189,248,0.25)',
          }}
        >
          <span style={{ display: 'inline-block', transform: formOpen ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }}>+</span>
          {formOpen ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {/* Create form panel */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div
              className="rounded-2xl border p-6 space-y-5"
              style={{
                background: 'rgba(13,17,23,0.9)',
                border: selectedType
                  ? `1px solid ${EVENT_TYPE_META[selectedType].color}33`
                  : '1px solid rgba(56,189,248,0.15)',
              }}
            >
              {/* Step 1: Pick type */}
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3 font-medium">
                  Step 1 — Choose event type
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(Object.keys(EVENT_TYPE_META) as ManagedEventType[]).map((type) => {
                    const m = EVENT_TYPE_META[type];
                    const active = selectedType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => { setSelectedType(type); setForm(BLANK); setSubmitted(false); }}
                        className="flex flex-col items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all duration-200 group"
                        style={{
                          background: active ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                          borderColor: active ? `${m.color}55` : 'rgba(255,255,255,0.07)',
                          boxShadow: active ? `0 0 16px ${m.color}22` : 'none',
                        }}
                      >
                        <span className="text-2xl">{m.emoji}</span>
                        <span
                          className="text-xs font-bold uppercase tracking-wider leading-tight text-center"
                          style={{ color: active ? m.color : 'rgba(255,255,255,0.35)' }}
                        >
                          {m.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Fill form */}
              <AnimatePresence mode="wait">
                {selectedType && (
                  <motion.div
                    key={selectedType}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Type badge */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-px flex-1"
                        style={{ background: `linear-gradient(90deg, ${EVENT_TYPE_META[selectedType].color}44, transparent)` }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                        style={{
                          color: EVENT_TYPE_META[selectedType].color,
                          background: `${EVENT_TYPE_META[selectedType].color}18`,
                          border: `1px solid ${EVENT_TYPE_META[selectedType].color}33`,
                        }}
                      >
                        {EVENT_TYPE_META[selectedType].emoji} {EVENT_TYPE_META[selectedType].label} Event
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: `linear-gradient(90deg, transparent, ${EVENT_TYPE_META[selectedType].color}44)` }}
                      />
                    </div>

                    <p className="text-xs text-white/30 italic">{EVENT_TYPE_META[selectedType].description}</p>

                    {/* Common fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Field label="Event Title" required error={errors.title}>
                        <input
                          className={errors.title ? `${inputCls} border-[#F87171]` : inputCls}
                          placeholder="e.g. Spring Quiz Blitz"
                          value={form.title}
                          onChange={(e) => setField('title', e.target.value)}
                        />
                      </Field>
                      <Field label="Date">
                        <input
                          type="date"
                          className={inputCls}
                          value={form.date}
                          onChange={(e) => setField('date', e.target.value)}
                        />
                      </Field>
                    </div>

                    <Field label="Description">
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={2}
                        placeholder="Brief overview visible to team coordinators"
                        value={form.description}
                        onChange={(e) => setField('description', e.target.value)}
                      />
                    </Field>

                    {/* Type-specific fields */}
                    {selectedType === 'Physical'  && <PhysicalForm  form={form} set={setField} errors={errors} />}
                    {selectedType === 'Quiz'      && <QuizForm      form={form} set={setField} errors={errors} />}
                    {selectedType === 'Creative'  && <CreativeForm  form={form} set={setField} errors={errors} />}
                    {selectedType === 'Strategy'  && <StrategyForm  form={form} set={setField} errors={errors} />}
                    {selectedType === 'WildCard'  && <WildCardForm  form={form} set={setField} errors={errors} />}

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 pt-1">
                      <button
                        onClick={() => handleCreate(false)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider text-white cursor-pointer transition-all duration-200 hover:opacity-90"
                        style={{
                          background: `linear-gradient(135deg, ${EVENT_TYPE_META[selectedType].color}CC, ${EVENT_TYPE_META[selectedType].color})`,
                          boxShadow: `0 0 20px ${EVENT_TYPE_META[selectedType].color}44`,
                          color: '#0D1117',
                        }}
                      >
                        ↑ Save & Schedule
                      </button>
                      <button
                        onClick={() => handleCreate(true)}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider cursor-pointer transition-all duration-200"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(255,255,255,0.5)',
                        }}
                      >
                        Save as Draft
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-all duration-200"
            style={{
              background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.3)',
              boxShadow: activeTab === tab.key ? `0 0 12px ${tab.color}22` : 'none',
            }}
          >
            {tab.label}
            <span
              className="px-1.5 py-0.5 rounded-md text-xs"
              style={{
                background: activeTab === tab.key ? `${tab.color}22` : 'rgba(255,255,255,0.05)',
                color: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.25)',
              }}
            >
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Event list */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-12 rounded-xl border border-dashed border-white/8"
            style={{ background: 'rgba(15,15,26,0.4)' }}
          >
            <span className="text-3xl opacity-25">
              {activeTab === 'draft' ? '📝' : activeTab === 'scheduled' ? '🗓️' : '✅'}
            </span>
            <p className="text-white/25 text-sm font-medium">
              No {activeTab} events yet
            </p>
            {activeTab === 'scheduled' && (
              <p className="text-white/15 text-xs">Publish a draft or create a new event to see it here</p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPublish={() => transitionStatus(event.id, 'scheduled')}
                  onComplete={() => transitionStatus(event.id, 'completed')}
                  onDelete={() => deleteEvent(event.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
