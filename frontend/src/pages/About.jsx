import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Lightbulb, Zap, Users, Target } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

          <h1 className="relative text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200 bg-clip-text text-transparent">
            About MockMate AI
          </h1>

          <p className="relative text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            We believe that preparing for technical interviews shouldn't be stressful or expensive. MockMate AI was built to democratize interview preparation by making expert-level mock interviews accessible to everyone.
          </p>
        </div>
      </section>

      {/* Our Mission */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-slate-300 mb-4 leading-relaxed">
              MockMate AI is on a mission to transform how developers prepare for technical interviews. We've seen too many talented engineers struggle because they didn't have access to quality mock interviews and feedback.
            </p>
            <p className="text-slate-300 mb-4 leading-relaxed">
              Our AI-powered platform provides real-time, voice-to-voice interviews that adapt to your pace and skill level, giving you instant feedback and actionable insights to improve.
            </p>
            <p className="text-slate-300 leading-relaxed">
              Whether you're a fresh graduate or an experienced developer, MockMate AI helps you ace your interviews with confidence.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all">
              <div className="text-4xl font-bold text-teal-300 mb-2">10K+</div>
              <p className="text-slate-400">Engineers Trained</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 transition-all">
              <div className="text-4xl font-bold text-cyan-300 mb-2">95%</div>
              <p className="text-slate-400">Success Rate</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-emerald-500/50 transition-all">
              <div className="text-4xl font-bold text-emerald-300 mb-2">50+</div>
              <p className="text-slate-400">Interview Types</p>
            </div>
            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 transition-all">
              <div className="text-4xl font-bold text-amber-300 mb-2">24/7</div>
              <p className="text-slate-400">Available</p>
            </div>
          </div>
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
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="p-12 rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Thousands of Successful Developers</h2>
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
