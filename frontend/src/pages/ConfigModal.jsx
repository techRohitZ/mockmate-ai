import { useState } from 'react';
import { X } from 'lucide-react';

export default function ConfigModal({ 
  isOpen, 
  onClose, 
  onStart, 
  defaultCategory = 'frontend',
  defaultDifficulty = 'Junior (1-3 yrs)',
  defaultDuration = 5 
}) {
  const [domain] = useState(defaultCategory || 'frontend');
  const [difficulty] = useState(defaultDifficulty || 'Junior (1-3 yrs)');
  const [timeLimit] = useState(String(defaultDuration) || '5');

  const handleStart = () => {
    onStart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-6 py-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Start Interview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <p className="text-slate-400 mb-5 text-sm">You're all set! Let's begin your mock interview.</p>

        <div className="space-y-4">
          {/* Domain */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Interview Type</label>
            <p className="text-base font-semibold text-teal-300 capitalize">{domain}</p>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Experience Level</label>
            <p className="text-base font-semibold text-teal-300">{difficulty}</p>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Interview Duration</label>
            <p className="text-base font-semibold text-teal-300">{timeLimit} minutes</p>
          </div>

          {/* Summary */}
          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20">
            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-teal-200">Ready?</span> You'll have a {timeLimit}-minute{' '}
              <span className="font-semibold text-teal-200 capitalize">{domain}</span> interview as a{' '}
              <span className="font-semibold text-teal-200">{difficulty}</span>. Answer the AI's questions thoughtfully.
            </p>
          </div>

          {/* Tips */}
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <p className="text-xs font-semibold text-amber-300 mb-2">💡 TIPS:</p>
            <ul className="text-xs text-amber-200 space-y-1">
              <li>• Speak clearly and confidently</li>
              <li>• Take time to think before answering</li>
              <li>• Ask for clarification if needed</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-700 rounded-lg font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleStart}
              className="flex-1 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg font-semibold hover:shadow-lg hover:shadow-teal-500/50 transition-all text-white"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
