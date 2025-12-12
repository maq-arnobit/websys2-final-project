import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

const LandingPage = () => {
  const navigate = useNavigate();
  const [typedText, setTypedText] = useState('');
  const fullText = '> Reach higher than the skies with our products.';

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

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes glitch {
          0% { transform: translate(0) rotate(0deg) scale(1); }
          10% { transform: translate(-10px, 5px) rotate(-2deg) scale(1.02); }
          20% { transform: translate(8px, -8px) rotate(2deg) scale(0.98); }
          30% { transform: translate(-8px, -5px) rotate(-1deg) scale(1.01); }
          40% { transform: translate(10px, 8px) rotate(3deg) scale(0.99); }
          50% { transform: translate(-5px, 10px) rotate(-2deg) scale(1.02); }
          60% { transform: translate(8px, -10px) rotate(1deg) scale(0.98); }
          70% { transform: translate(-10px, 5px) rotate(-3deg) scale(1.01); }
          80% { transform: translate(5px, -8px) rotate(2deg) scale(0.99); }
          90% { transform: translate(-8px, 8px) rotate(-1deg) scale(1.01); }
          100% { transform: translate(0) rotate(0deg) scale(1); }
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
          animation: glitch 0.2s infinite;
          text-shadow: 
            -2px 0 #ff00ff,
            2px 0 #00ffff,
            0 0 5px rgba(0, 255, 0, 0.5);
        }
        .cursor::after {
          content: '|';
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 49% { opacity: 1; }
          50%, 100% { opacity: 0; }
        }
      `}</style>

      <div className="scanline min-h-screen">
        <header className="border-b-2 border-green-500 bg-black p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-bold text-xl terminal-glow">
                [TotallyLegalSubstances]
              </span>
            </div>
            <nav className="flex gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="border-2 border-green-500 px-4 py-1 text-green-500 hover:bg-green-500 hover:bg-opacity-20 transition-all"
              >
                LOGIN
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="border-2 border-green-500 px-4 py-1 text-green-500 hover:bg-green-500 hover:bg-opacity-20 transition-all"
              >
                REGISTER
              </button>
            </nav>
          </div>
        </header>

        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold mb-6 text-green-500 terminal-glow glitch">
              Totally Legal Substances
            </h1>
            <p className="text-xl text-gray-400 mb-8 cursor">
              {typedText}
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => navigate('/login')}
                className="terminal-border bg-black px-8 py-4 text-green-500 font-bold text-lg hover:bg-green-500 hover:bg-opacity-10 transition-all"
              >
                &gt; ACCESS_SYSTEM
              </button>
            </div>
          </div>
        </section>

        <footer className="border-t-2 border-green-500 bg-black p-8 mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center gap-2 items-center mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 text-sm">SYSTEM ONLINE</span>
            </div>
            <p className="text-gray-600 text-xs">
              © 2025 totally legal substances // ALL SYSTEMS OPERATIONAL
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;