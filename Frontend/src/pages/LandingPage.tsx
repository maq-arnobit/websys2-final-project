import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, TrendingUp, Zap, Terminal } from 'lucide-react';

const LandingPage = () => {
  const [glitchText, setGlitchText] = useState('SECURE PORTAL');
  const [typedText, setTypedText] = useState('');
  const fullText = '> Initializing secure connection...';

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { icon: <Shield size={32} />, title: 'Encrypted', desc: 'Military-grade encryption' },
    { icon: <Lock size={32} />, title: 'Anonymous', desc: 'Zero-knowledge architecture' },
    { icon: <Eye size={32} />, title: 'Private', desc: 'No tracking, no logs' },
    { icon: <TrendingUp size={32} />, title: 'Fast', desc: 'Instant transactions' },
    { icon: <Zap size={32} />, title: 'Secure', desc: 'Multi-layer protection' },
    { icon: <Terminal size={32} />, title: 'Advanced', desc: 'Professional tools' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes glitch {
          0% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
          100% { transform: translate(0); }
        }
        .terminal-border {
          border: 2px solid #0f0;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1);
        }
        .terminal-glow {
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }
        .scanline {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(0, 255, 0, 0.02) 50%
          );
          background-size: 100% 4px;
          animation: flicker 0.15s infinite;
        }
        .glitch:hover {
          animation: glitch 0.3s infinite;
        }
        .cursor::after {
          content: '▋';
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <div className="scanline min-h-screen">
        {/* Header */}
        <header className="border-b-2 border-green-500 bg-black p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-bold text-xl terminal-glow">
                [SYSTEM_PORTAL]
              </span>
            </div>
            <nav className="flex gap-4">
              <a href="#features" className="text-gray-400 hover:text-green-500 transition-colors">
                FEATURES
              </a>
              <a href="#about" className="text-gray-400 hover:text-green-500 transition-colors">
                ABOUT
              </a>
              <a href="/login" className="border-2 border-green-500 px-4 py-1 text-green-500 hover:bg-green-500 hover:bg-opacity-20 transition-all">
                LOGIN
              </a>
            </nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-6 text-green-500 terminal-glow glitch">
              {glitchText}
            </h1>
            <p className="text-xl text-gray-400 mb-8 cursor">
              {typedText}
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="/login"
                className="terminal-border bg-black px-8 py-4 text-green-500 font-bold text-lg hover:bg-green-500 hover:bg-opacity-10 transition-all"
              >
                &gt; ACCESS_SYSTEM
              </a>
              <button className="border-2 border-gray-700 bg-black px-8 py-4 text-gray-400 font-bold text-lg hover:border-green-500 hover:text-green-500 transition-all">
                &gt; LEARN_MORE
              </button>
            </div>
          </div>

          {/* Terminal Window */}
          <div className="terminal-border bg-black p-6 max-w-3xl mx-auto mt-16">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs text-gray-600 ml-2">terminal@system:~$</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="text-green-500">&gt; status --check</div>
              <div className="text-gray-400 ml-4">✓ Encryption active</div>
              <div className="text-gray-400 ml-4">✓ Connection secure</div>
              <div className="text-gray-400 ml-4">✓ System operational</div>
              <div className="text-green-500 mt-4">&gt; access --request</div>
              <div className="text-gray-400 ml-4">Awaiting credentials...</div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold text-center mb-12 text-green-500 terminal-glow">
            [SYSTEM_FEATURES]
          </h2>
          <div className="grid grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="terminal-border bg-black p-6 hover:bg-gray-900 transition-all group"
              >
                <div className="text-green-500 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="terminal-border bg-black p-12">
            <div className="grid grid-cols-4 gap-8">
              {[
                { label: 'Active Users', value: '12,847' },
                { label: 'Transactions', value: '2.4M' },
                { label: 'Uptime', value: '99.9%' },
                { label: 'Countries', value: '180+' },
              ].map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-4xl font-bold text-green-500 terminal-glow mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-400 uppercase">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="terminal-border bg-black p-12 text-center">
            <h2 className="text-3xl font-bold mb-4 text-green-500 terminal-glow">
              READY TO ACCESS?
            </h2>
            <p className="text-gray-400 mb-8">
              Join thousands of users operating on the most secure platform.
            </p>
            <a 
              href="/login"
              className="terminal-border bg-black px-12 py-4 text-green-500 font-bold text-lg hover:bg-green-500 hover:bg-opacity-10 transition-all inline-block"
            >
              &gt; INITIALIZE_SESSION
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t-2 border-green-500 bg-black p-8 mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center gap-2 items-center mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 text-sm">SYSTEM ONLINE</span>
            </div>
            <p className="text-gray-600 text-xs">
              © 2025 SECURE_PORTAL.SYS // ALL TRANSMISSIONS ENCRYPTED
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;