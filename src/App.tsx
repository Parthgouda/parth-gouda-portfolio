import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  Code2,
  ExternalLink,
  Github,
  Layers3,
  Mail,
  Menu,
  X,
} from 'lucide-react';
import { supabase } from './lib/supabase';

const projects = [
  {
    name: 'RentMojo',
    url: 'https://rent-mojo-six.vercel.app/',
    github: 'https://github.com/Parthgouda/RentMojo',
    desc: 'A full-stack rental platform designed for renting furniture and appliances through a modern digital shopping experience.',
    tech: [
      'React',
      'Vite',
      'Tailwind CSS',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST API',
    ],
    features: [
      'Product browsing',
      'Product details',
      'Authentication',
      'Cart',
      'Checkout',
      'Order history',
      'Maintenance functionality',
      'Backend API',
      'Database integration',
    ],
  },
  {
    name: 'Little Steps Childcare Centre',
    url: 'https://little-steps-beige.vercel.app/',
    github: 'https://github.com/Parthgouda/Little-Steps',
    desc: 'A modern childcare platform concept designed to provide a convenient digital experience for parents and childcare services.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Responsive Design'],
    features: [
      'Childcare information',
      'Parent-focused interface',
      'Responsive layout',
      'Service presentation',
    ],
  },
  {
    name: 'Grove Color Studio',
    url: 'https://grove-color-studio.vercel.app/',
    github: 'https://github.com/Parthgouda/Grove-color-studio',
    desc: 'An interactive color exploration experience with a modern visual interface, designed to make discovering colors engaging and intuitive.',
    tech: ['React', 'JavaScript', 'CSS', 'Vite'],
    features: [
      'Color exploration',
      'Interactive interface',
      'Visual color experience',
      'Modern responsive design',
    ],
  },
  {
    name: 'SkyCast Weather',
    url: 'https://skycast-weather-lemon.vercel.app/',
    github: 'https://github.com/Parthgouda/skycast-weather',
    desc: 'A weather application that provides a clean interface for exploring weather information and checking conditions for different locations.',
    tech: ['React', 'JavaScript', 'CSS', 'Vite', 'Weather API'],
    features: [
      'Weather information',
      'Location-based search',
      'API integration',
      'Responsive interface',
    ],
  },
  {
    name: 'Personal Portfolio',
    url: 'https://parth-gouda-portfolio.vercel.app/',
    github: 'https://github.com/Parthgouda/parth-gouda-portfolio',
    desc: 'My personal developer portfolio showcasing projects, technical skills, web development services, and a project enquiry system.',
    tech: [
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Framer Motion',
      'Supabase',
    ],
    features: [
      'Animated user interface',
      'Project showcase',
      'Responsive design',
      'Project booking form',
      'Supabase integration',
    ],
  },
];

const skills = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Tailwind CSS',
  'Bootstrap',
  'Node.js',
  'Express.js',
  'REST APIs',
  'C',
  'Java',
  'TypeScript',
  'MongoDB',
  'PostgreSQL',
  'Supabase',
  'Git',
  'GitHub',
  'VS Code',
  'Vite',
];

const services = [
  [
    'Business Websites',
    'Modern responsive websites for businesses and brands.',
  ],
  [
    'Portfolio Websites',
    'Professional portfolios for students, developers and professionals.',
  ],
  ['Landing Pages', 'Modern responsive landing pages.'],
  [
    'Full-Stack Web Applications',
    'Frontend + backend + database development.',
  ],
  [
    'Resume / CV Websites',
    'Professional online resumes and personal branding websites.',
  ],
  [
    'Website Redesign',
    'Modernizing existing websites with improved UI, responsiveness and UX.',
  ],
];

function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

function Booking({ close }: { close: () => void }) {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [f, setF] = useState({
    full_name: '',
    email: '',
    phone: '',
    website_type: '',
    company_name: '',
    project_description: '',
    required_features: '',
    reference_website: '',
    budget: '',
    timeline: '',
    preferred_contact: '',
    additional_message: '',
    consent: false,
  });

  const upd = (key: string, value: string | boolean) => {
    setF((current) => ({ ...current, [key]: value }));
  };

  const next = () => {
    setError('');

    if (
      step === 1 &&
      (!f.full_name.trim() || !f.email.trim() || !f.phone.trim())
    ) {
      setError('Please complete your personal details.');
      return;
    }

    if (
      step === 2 &&
      (!f.website_type || !f.project_description.trim())
    ) {
      setError('Please choose a website type and describe the project.');
      return;
    }

    if (step === 3 && !f.budget) {
      setError('Please select a budget.');
      return;
    }

    if (step < 4) {
      setStep(step + 1);
    }
  };

  const submit = async () => {
    setError('');

    if (!f.timeline || !f.preferred_contact || !f.consent) {
      setError(
        'Please complete the final details and accept the consent checkbox.',
      );
      return;
    }

    if (!supabase) {
      setError(
        'Supabase is not configured. Add the environment variables before using the live booking system.',
      );
      return;
    }

    setBusy(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        'submit-booking',
        { body: f },
      );

      if (error) throw error;

      if (!data?.request_id) {
        throw new Error('No request ID returned');
      }

      setDone(data.request_id);
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : 'Something went wrong while submitting your request. Please try again.',
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface max-h-[92vh] w-full max-w-2xl overflow-auto rounded-2xl p-6 sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[.25em] text-violet-400">
              Project enquiry
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Book a Website</h2>
          </div>

          <button
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-2 hover:bg-white/5"
          >
            <X />
          </button>
        </div>

        {done ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-violet-400/40 bg-violet-500/10">
              <Check className="text-violet-300" />
            </div>

            <h3 className="text-2xl font-semibold">Request Received</h3>

            <p className="mx-auto mt-3 max-w-md text-zinc-400">
              Thanks for reaching out. Your project request has been received
              successfully.
            </p>

            <p className="mt-5 text-sm text-zinc-400">Request ID</p>
            <p className="mt-1 font-mono text-violet-300">{done}</p>

            <button
              onClick={close}
              className="mt-8 rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500"
            >
              Back to Portfolio
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8 flex gap-2">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`h-1 flex-1 rounded ${
                    n <= step ? 'bg-violet-500' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
              >
                {step === 1 && (
                  <Fields title="Personal Details">
                    <Input
                      label="Full Name"
                      value={f.full_name}
                      onChange={(v) => upd('full_name', v)}
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={f.email}
                      onChange={(v) => upd('email', v)}
                    />

                    <Input
                      label="Phone Number"
                      value={f.phone}
                      onChange={(v) => upd('phone', v)}
                    />
                  </Fields>
                )}

                {step === 2 && (
                  <Fields title="Project Details">
                    <Select
                      label="Website Type"
                      value={f.website_type}
                      options={[
                        'Portfolio',
                        'Business Website',
                        'Landing Page',
                        'E-commerce',
                        'Full-Stack Web Application',
                        'Other',
                      ]}
                      onChange={(v) => upd('website_type', v)}
                    />

                    <Input
                      label="Company / Brand Name (optional)"
                      value={f.company_name}
                      onChange={(v) => upd('company_name', v)}
                    />

                    <Area
                      label="Project Description"
                      value={f.project_description}
                      onChange={(v) => upd('project_description', v)}
                    />

                    <Area
                      label="Required Features"
                      value={f.required_features}
                      onChange={(v) => upd('required_features', v)}
                    />

                    <Input
                      label="Reference Website (optional)"
                      value={f.reference_website}
                      onChange={(v) => upd('reference_website', v)}
                    />
                  </Fields>
                )}

                {step === 3 && (
                  <Fields title="Budget">
                    <Select
                      label="Budget"
                      value={f.budget}
                      options={[
                        '₹5,000 - ₹10,000',
                        '₹10,000 - ₹20,000',
                        '₹20,000 - ₹40,000',
                        '₹40,000+',
                        'Not sure yet',
                      ]}
                      onChange={(v) => upd('budget', v)}
                    />
                  </Fields>
                )}

                {step === 4 && (
                  <Fields title="Timeline & Contact">
                    <Select
                      label="Timeline"
                      value={f.timeline}
                      options={[
                        'As soon as possible',
                        '1-2 weeks',
                        '2-4 weeks',
                        '1-2 months',
                        'Flexible',
                      ]}
                      onChange={(v) => upd('timeline', v)}
                    />

                    <Select
                      label="Preferred Contact Method"
                      value={f.preferred_contact}
                      options={['Email', 'Phone', 'WhatsApp']}
                      onChange={(v) => upd('preferred_contact', v)}
                    />

                    <Area
                      label="Additional Message"
                      value={f.additional_message}
                      onChange={(v) => upd('additional_message', v)}
                    />

                    <label className="flex gap-3 text-sm text-zinc-400">
                      <input
                        type="checkbox"
                        checked={f.consent}
                        onChange={(e) => upd('consent', e.target.checked)}
                        className="mt-1 accent-violet-600"
                      />
                      <span>
                        I consent to my information being used to respond to
                        this project enquiry.
                      </span>
                    </label>
                  </Fields>
                )}
              </motion.div>
            </AnimatePresence>

            {error && (
              <p className="mt-5 rounded-lg border border-red-400/20 bg-red-500/5 p-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <div className="mt-7 flex justify-between gap-3">
              <button
                disabled={step === 1 || busy}
                onClick={() => setStep(step - 1)}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm disabled:opacity-30"
              >
                Back
              </button>

              {step < 4 ? (
                <button
                  onClick={next}
                  className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500"
                >
                  Continue
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={submit}
                  className="rounded-lg bg-violet-600 px-5 py-3 text-sm font-medium hover:bg-violet-500 disabled:opacity-60"
                >
                  {busy ? 'Sending...' : 'Send Project Request'}
                </button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function Fields({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold">{title}</h3>
      <div className="grid gap-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-zinc-300">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-[#0b0b0d] px-4 py-3 outline-none focus:border-violet-500"
      />
    </label>
  );
}

function Area({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-zinc-300">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="resize-y rounded-lg border border-white/10 bg-[#0b0b0d] px-4 py-3 outline-none focus:border-violet-500"
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="text-zinc-300">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-white/10 bg-[#0b0b0d] px-4 py-3 outline-none focus:border-violet-500"
      >
        <option value="">Select...</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function App() {
  const [book, setBook] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    document.title = 'Parth Gouda | Full-Stack Developer';
  }, []);

  const nav = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenu(false);
  };

  return (
    <div className="noise min-h-screen bg-[#080808] text-zinc-100">
      <header className="fixed left-0 right-0 top-0 z-40 border-b border-white/5 bg-[#080808]/70 backdrop-blur-xl">
        <div className="container-x flex h-16 items-center justify-between">
          <button
            onClick={() => nav('home')}
            className="font-semibold tracking-tight"
          >
            PG<span className="text-violet-400">.</span>
          </button>

          <nav className="hidden items-center gap-7 text-sm text-zinc-400 md:flex">
            {[
              'home',
              'about',
              'skills',
              'projects',
              'services',
              'process',
              'contact',
            ].map((item) => (
              <button
                key={item}
                onClick={() => nav(item)}
                className="capitalize transition hover:text-white"
              >
                {item}
              </button>
            ))}
          </nav>

          <button
            onClick={() => setBook(true)}
            className="hidden rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium hover:bg-violet-500 md:block"
          >
            Book a Website
          </button>

          <button
            onClick={() => setMenu(!menu)}
            className="md:hidden"
            aria-label="Menu"
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-white/5 bg-[#0b0b0d] p-4 md:hidden">
            {[
              'home',
              'about',
              'skills',
              'projects',
              'services',
              'process',
              'contact',
            ].map((item) => (
              <button
                key={item}
                onClick={() => nav(item)}
                className="block w-full py-3 text-left capitalize text-zinc-300"
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => {
                setBook(true);
                setMenu(false);
              }}
              className="mt-2 w-full rounded-lg bg-violet-600 py-3 font-medium"
            >
              Book a Website
            </button>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section id="home" className="grid-bg relative overflow-hidden pt-32">
          <div className="container-x grid min-h-[720px] items-center gap-14 py-20 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <Reveal>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-xs text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,.7)]" />
                  Available for freelance projects
                </div>

                <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-[-.04em] sm:text-6xl lg:text-7xl">
                  Building Digital Experiences That{' '}
                  <span className="text-violet-400">Actually Work.</span>
                </h1>

                <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400">
                  Full-Stack Developer focused on building modern, responsive
                  and scalable web experiences.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">
                  <button
                    onClick={() => nav('projects')}
                    className="group rounded-lg bg-violet-600 px-5 py-3 font-medium hover:bg-violet-500"
                  >
                    View My Work{' '}
                    <ArrowUpRight className="ml-1 inline h-4 w-4 transition group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>

                  <button
                    onClick={() => setBook(true)}
                    className="rounded-lg border border-white/10 px-5 py-3 font-medium hover:border-violet-500/50 hover:bg-white/[.03]"
                  >
                    Book a Website
                  </button>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <div className="relative mx-auto w-full max-w-xl">
                <div className="absolute -inset-12 bg-violet-600/10 blur-3xl" />

                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101012] shadow-2xl">
                  <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="ml-3 font-mono text-xs text-zinc-500">
                      parth.dev / workspace
                    </span>
                  </div>

                  <div className="grid grid-cols-[54px_1fr] font-mono text-xs sm:text-sm">
                    <div className="border-r border-white/5 p-4 text-right leading-7 text-zinc-700">
                      1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9
                      <br />10
                    </div>

                    <div className="p-5 leading-7">
                      <p>
                        <span className="text-violet-400">const</span>{' '}
                        <span className="text-zinc-200">experience</span> = {'{'}
                      </p>
                      <p className="pl-5 text-zinc-400">
                        design: <span className="text-zinc-200">"intentional"</span>,
                      </p>
                      <p className="pl-5 text-zinc-400">
                        frontend:{' '}
                        <span className="text-zinc-200">"React + TypeScript"</span>,
                      </p>
                      <p className="pl-5 text-zinc-400">
                        backend: <span className="text-zinc-200">"Node + APIs"</span>,
                      </p>
                      <p className="pl-5 text-zinc-400">
                        data: <span className="text-zinc-200">"PostgreSQL"</span>,
                      </p>
                      <p className="pl-5 text-zinc-400">
                        quality: <span className="text-violet-300">true</span>
                      </p>
                      <p>{'}'}</p>
                      <p className="mt-4 text-zinc-500">
                        // ship useful software.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="container-x py-28">
          <Reveal>
            <Eyebrow>About</Eyebrow>

            <div className="mt-5 grid gap-10 lg:grid-cols-[1.2fr_.8fr]">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Building useful products with a developer mindset.
              </h2>

              <p className="leading-8 text-zinc-400">
                I'm Parth Gouda, a BCA student and full-stack developer
                passionate about building useful, modern and visually polished
                web applications.
                <br />
                <br />
                I enjoy turning ideas into responsive digital products and
                working across frontend interfaces, backend systems, APIs and
                databases.
                <br />
                <br />
                My focus is continuously improving my development skills and
                creating projects that solve real problems.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              '5 Featured Projects',
              'Frontend + Backend',
              'Responsive Web Development',
              'Continuous Learning',
            ].map((item, i) => (
              <Reveal key={item} delay={i * 0.05}>
                <div className="surface rounded-xl p-5">
                  <p className="text-sm text-zinc-300">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SKILLS */}
        <section
          id="skills"
          className="border-y border-white/5 bg-[#0b0b0d] py-28"
        >
          <div className="container-x">
            <Reveal>
              <Eyebrow>Tech Stack</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
                Tools I build with.
              </h2>
            </Reveal>

            <div className="mt-10 flex flex-wrap gap-3">
              {skills.map((skill, i) => (
                <motion.div
                  key={skill}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.025 }}
                  className="group rounded-lg border border-white/8 bg-[#111113] px-4 py-3 text-sm text-zinc-300 transition hover:-translate-y-1 hover:border-violet-500/50 hover:text-white"
                >
                  <Code2 className="mr-2 inline h-4 w-4 text-violet-400 transition group-hover:rotate-6" />
                  {skill}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section id="projects" className="container-x py-28">
          <Reveal>
            <Eyebrow>Selected Work</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              Projects built to be used.
            </h2>
            <p className="mt-4 max-w-2xl leading-7 text-zinc-500">
              Explore my projects, check out their live versions, and browse
              the source code on GitHub.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, i) => (
              <Reveal key={project.name} delay={i * 0.06}>
                <article className="group surface h-full overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-500/40">
                  <div className="grid-bg flex h-44 items-end border-b border-white/5 p-5">
                    <div className="w-full rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[.2em] text-violet-300">
                          Project {String(i + 1).padStart(2, '0')}
                        </span>
                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                      </div>

                      <div className="mt-4 h-1.5 w-2/3 rounded bg-white/10" />
                      <div className="mt-2 h-1.5 w-1/2 rounded bg-white/5" />
                    </div>
                  </div>

                  <div className="flex h-[calc(100%-11rem)] flex-col p-6">
                    <h3 className="text-xl font-semibold">{project.name}</h3>

                    <p className="mt-3 min-h-[96px] text-sm leading-6 text-zinc-400">
                      {project.desc}
                    </p>

                    {project.tech.length > 0 && (
                      <div className="mt-5 flex flex-wrap gap-2">
                        {project.tech.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md bg-white/[.04] px-2 py-1 text-xs text-zinc-400"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}

                    {project.features.length > 0 && (
                      <ul className="mt-5 space-y-2 text-xs text-zinc-500">
                        {project.features.slice(0, 4).map((feature) => (
                          <li key={feature}>• {feature}</li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto flex flex-wrap gap-3 pt-7">
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500"
                      >
                        Live Demo
                        <ArrowUpRight className="h-4 w-4" />
                      </a>

                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:border-violet-500/50 hover:bg-white/[.03]"
                      >
                        <Github className="h-4 w-4" />
                        Source Code
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section
          id="services"
          className="border-y border-white/5 bg-[#0b0b0d] py-28"
        >
          <div className="container-x">
            <Reveal>
              <Eyebrow>Services</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
                What I Can Build
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(([title, description]) => (
                <div
                  key={title}
                  className="group bg-[#111113] p-7 transition hover:bg-[#151517]"
                >
                  <div className="mb-10 flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-violet-400">
                    <Layers3 className="h-5 w-5 transition group-hover:-translate-y-1" />
                  </div>

                  <h3 className="font-semibold">{title}</h3>

                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="container-x py-28">
          <Reveal>
            <Eyebrow>Process</Eyebrow>
            <h2 className="mt-5 text-3xl font-semibold sm:text-4xl">
              From idea to deployed product.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              [
                '01',
                'DISCOVER',
                'Understand the idea, requirements and goals.',
              ],
              [
                '02',
                'DESIGN',
                'Plan the structure, visual direction and user experience.',
              ],
              [
                '03',
                'DEVELOP',
                'Build the frontend, backend, API and database functionality.',
              ],
              [
                '04',
                'DEPLOY',
                'Test, optimize and deploy the finished website.',
              ],
            ].map(([number, title, description], i) => (
              <Reveal key={number} delay={i * 0.06}>
                <div className="relative border-t border-white/10 pt-5">
                  <span className="font-mono text-sm text-violet-400">
                    {number}
                  </span>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-500">
                    {description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* JOURNEY */}
        <section className="border-y border-white/5 bg-[#0b0b0d] py-28">
          <div className="container-x">
            <Reveal>
              <Eyebrow>Journey</Eyebrow>
              <h2 className="mt-5 text-3xl font-semibold">
                My Development Journey
              </h2>
            </Reveal>

            <div className="mt-10 grid gap-3 md:grid-cols-5">
              {[
                'BCA Student',
                'Full-Stack Development',
                'Personal Projects',
                'Real-World Application Building',
                'Continuous Learning',
              ].map((item) => (
                <div key={item} className="border-l border-violet-500/40 pl-4">
                  <p className="text-sm text-zinc-300">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GITHUB */}
        <section className="container-x py-28">
          <div className="surface grid gap-8 rounded-2xl p-7 sm:p-10 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <Eyebrow>GitHub</Eyebrow>
              <h2 className="mt-4 text-3xl font-semibold">
                Open code, continuous learning.
              </h2>
              <p className="mt-3 max-w-xl text-zinc-500">
                Explore my public repositories and development work on GitHub.
              </p>
            </div>

            <a
              href="https://github.com/Parthgouda"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-5 py-3 font-medium hover:border-violet-500/50"
            >
              <Github className="h-5 w-5" />
              View GitHub Profile
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="grid-bg border-t border-white/5 py-28"
        >
          <div className="container-x text-center">
            <Reveal>
              <Eyebrow>Start a Project</Eyebrow>

              <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Have an idea worth building?
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-zinc-500">
                Tell me what you want to build, and I’ll have the right context
                to start the conversation.
              </p>

              <button
                onClick={() => setBook(true)}
                className="mt-8 rounded-lg bg-violet-600 px-6 py-3 font-medium hover:bg-violet-500"
              >
                Book a Website
                <ChevronRight className="ml-1 inline h-4 w-4" />
              </button>

              <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-zinc-400">
                <a
                  href="mailto:goudaparth07@gmail.com"
                  className="hover:text-white"
                >
                  <Mail className="mr-2 inline h-4 w-4" />
                  goudaparth07@gmail.com
                </a>

                <a href="tel:+917205377369" className="hover:text-white">
                  +91 7205377369
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 py-8">
        <div className="container-x flex flex-col justify-between gap-3 text-sm text-zinc-600 sm:flex-row">
          <span>© {new Date().getFullYear()} Parth Gouda</span>
          <span>Full-Stack Developer | BCA Student</span>
        </div>
      </footer>

      {book && <Booking close={() => setBook(false)} />}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[.25em] text-violet-400">
      {children}
    </p>
  );
}