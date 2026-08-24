import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../api/client';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Send to backend
      await api.post('/api/contact', formData);
      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="absolute -top-40 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

          <h1 className="relative text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-200 bg-clip-text text-transparent">
            Get In Touch
          </h1>

          <p className="relative text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Have questions or feedback? We'd love to hear from you. Our team is here to help!
          </p>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
          {/* Contact Form */}
          <div className="p-8 md:p-12 rounded-3xl border border-slate-800 bg-slate-900/60">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold">Send us a Message</h2>
              <span className="text-xs uppercase tracking-[0.3em] text-slate-500">Support</span>
            </div>
            <p className="mt-3 text-sm text-slate-400">
              Share your question or feedback and we will follow up with actionable guidance.
            </p>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400">
              ✓ Your message has been sent successfully! We'll get back to you soon.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="Your name"
              />
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="your@email.com"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Subject</label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all"
                placeholder="How can we help?"
              />
            </div>

            {/* Message Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all resize-none"
                placeholder="Tell us more about your inquiry..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Message
                </>
              )}
            </button>
          </form>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 p-6">
              <h3 className="text-lg font-semibold">Support promise</h3>
              <p className="mt-2 text-sm text-slate-300">
                Most questions receive a response within 24 business hours. Enterprise requests are prioritized.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4">
                  <Mail size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold">Email</h3>
                <p className="text-slate-400 mt-2">support@mockmate.ai</p>
                <p className="text-xs text-slate-500 mt-1">Response within 24 hours</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4">
                  <Phone size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold">Phone</h3>
                <p className="text-slate-400 mt-2">+91 8109901132</p>
                <p className="text-xs text-slate-500 mt-1">Mon-Fri, 9AM-6PM IST</p>
              </div>

              <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 hover:border-amber-500/50 transition-all">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4">
                  <MapPin size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-semibold">Location</h3>
                <p className="text-slate-400 mt-2">Indore, Madhya Pradesh</p>
                <p className="text-xs text-slate-500 mt-1">Open to global partnerships</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              q: 'How quickly will I get a response?',
              a: 'We typically respond to all inquiries within 24 business hours.',
            },
            {
              q: 'Do you offer refunds?',
              a: 'Yes! We offer a 30-day money-back guarantee if you\'re not satisfied.',
            },
            {
              q: 'Can I schedule a demo?',
              a: 'Absolutely! Contact us and we\'ll set up a personalized demo for you.',
            },
            {
              q: 'Do you have enterprise plans?',
              a: 'Yes, we offer custom enterprise solutions. Contact sales@mockmate.ai',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-teal-500/50 transition-all"
            >
              <h3 className="text-lg font-semibold mb-3 text-white">{item.q}</h3>
              <p className="text-slate-400">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
