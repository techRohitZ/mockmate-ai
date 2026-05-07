import { useNavigate } from 'react-router-dom';
import { Globe, Users, Share2 } from 'lucide-react';

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MM</span>
              </div>
              <span className="font-bold text-lg text-white">MockMate AI</span>
            </div>
            <p className="text-slate-400 text-sm">
              Master your tech interviews with AI-powered mock interviews.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/about')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/contact')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Contact Us
                </button>
              </li>
            </ul>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-white font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">
                Voice AI Interviews
              </li>
              <li className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">
                Code Editor
              </li>
              <li className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">
                Instant Feedback
              </li>
              <li className="text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">
                Progress Tracking
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-teal-500 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
                title="GitHub"
              >
                <Globe size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-teal-500 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
                title="LinkedIn"
              >
                <Users size={20} />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-slate-900 hover:bg-teal-500 transition-colors flex items-center justify-center text-slate-400 hover:text-white"
                title="Twitter"
              >
                <Share2 size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-slate-500 text-sm">
              &copy; {currentYear} MockMate AI. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Privacy Policy
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
