import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { BarChart3, Lightbulb, MessageSquare, ShieldCheck, Sparkles, Target, Users, Zap } from 'lucide-react';

export default function About() {
  const steps = [
    {
      title: 'Practice with intention',
      description: 'Every mock interview is aligned to a goal so you know what to improve next.',
      icon: Sparkles,
    },
    {
      title: 'Communicate clearly',
      description: 'We score clarity, structure, and confidence, not just correctness.',
      icon: MessageSquare,
    },
    {
      title: 'Review real signals',
      description: 'Get a breakdown of strengths, gaps, and next-step drills after each session.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-6">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-teal-500/20 blur-3xl" />
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-start">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-teal-200">
              <ShieldCheck size={14} />
              Built for real interviews
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white">
              We build interview confidence through deliberate practice.
            </h1>
            <p className="text-lg text-slate-300">
              MockMate AI gives every engineer a structured way to practice technical interviews with live AI feedback,
              analytics, and a clear growth path.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Engineers trained', value: '10K+' },
                { label: 'Success rate', value: '95%' },
                { label: 'Interview types', value: '50+' },
                { label: 'Always-on access', value: '24/7' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-teal-200">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-semibold">Our Mission</h2>
              <p className="mt-3 text-slate-300 leading-relaxed">
                We want interview prep to feel focused, human, and affordable. MockMate AI simulates real interview
                pressure while keeping the feedback loop supportive and clear.
              </p>
              <div className="mt-6 flex items-center gap-3 text-sm text-slate-300">
                <Target size={18} className="text-amber-200" />
                Build clarity, structure, and confidence in every mock session.
              </div>
            </div>
            <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-6">
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="text-teal-200" />
                <h3 className="text-lg font-semibold">Our Promise</h3>
              </div>
              <p className="mt-3 text-sm text-slate-300">
                Practical practice plans, realistic mock interviews, and feedback you can act on immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Our approach</p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold">Practice that mirrors real interviews</h2>
          </div>
          <p className="text-slate-300 max-w-2xl">
            We keep the loop simple: prepare, perform, and review. That is where lasting confidence is built.
          </p>
        </div>
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-200">
                  <step.icon size={18} />
                </div>
                <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Step {index + 1}</span>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Values */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Our Core Values</h2>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 hover:bg-slate-900/80 transition-all group text-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-teal-500/40 transition-all">
              <Lightbulb size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Innovation</h3>
            <p className="text-slate-400">
              We constantly innovate to bring the best AI-powered interview experience.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 hover:bg-slate-900/80 transition-all group text-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/40 transition-all">
              <Users size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Community</h3>
            <p className="text-slate-400">
              We believe in building a supportive community of developers helping each other.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900/80 transition-all group text-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-emerald-500/40 transition-all">
              <Zap size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Excellence</h3>
            <p className="text-slate-400">
              We strive for excellence in every interaction and feature we create.
            </p>
          </div>

          <div className="p-8 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 hover:bg-slate-900/80 transition-all group text-center">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg group-hover:shadow-amber-500/40 transition-all">
              <Target size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Accessibility</h3>
            <p className="text-slate-400">
              Interview prep should be affordable and accessible to everyone worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="p-12 rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-center">
          <h2 className="text-3xl font-bold mb-4">Join thousands of successful developers</h2>
          <p className="text-slate-400 mb-8">
            Start your journey to acing your next interview with MockMate AI.
          </p>
          <button className="px-8 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all">
            Get Started Free
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
