import React, { useState } from 'react';
import { Eye, EyeOff, User, Lock, Shield, AlertTriangle } from 'lucide-react';

type AccessType = 'customer' | 'dealer' | 'provider';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [accessType, setAccessType] = useState<AccessType>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = () => {
    setError('');
    setIsLoading(true);

    // Simulate login process
    setTimeout(() => {
      if (username && password) {
        // Navigate to dashboard (you'll implement this with React Router)
        console.log('Login successful', { username, accessType });
        // window.location.href = '/dashboard';
      } else {
        setError('AUTHENTICATION_FAILED: Invalid credentials');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center p-4">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .terminal-border {
          border: 2px solid #0f0;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3), inset 0 0 10px rgba(0, 255, 0, 0.1);
        }
        .terminal-glow {
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }
        .danger-border {
          border: 2px solid #ff0000;
          box-shadow: 0 0 10px rgba(255, 0, 0, 0.3);
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
        .scanning-line {
          position: absolute;
          width: 100%;
          height: 2px;
          background: linear-gradient(to right, transparent, #0f0, transparent);
          box-shadow: 0 0 10px #0f0;
          animation: scan 3s linear infinite;
        }
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-text-fill-color: #0f0;
          -webkit-box-shadow: 0 0 0px 1000px #000 inset;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="scanline w-full max-w-md">
        {/* Back Link */}
        <a 
          href="/"
          className="text-gray-400 hover:text-green-500 transition-colors mb-6 inline-block"
        >
          &lt; BACK_TO_MAIN
        </a>

        {/* Login Container */}
        <div className="terminal-border bg-black p-8 relative overflow-hidden">
          {/* Scanning Line Effect */}
          {isLoading && <div className="scanning-line"></div>}

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-bold terminal-glow">
                AUTH_SYSTEM
              </span>
            </div>
            <Shield size={24} className="text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 text-green-500 terminal-glow">
            &gt; ACCESS_REQUIRED
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Enter credentials to establish secure connection
          </p>

          {/* Error Message */}
          {error && (
            <div className="danger-border bg-red-500 bg-opacity-10 p-3 mb-6 flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span className="text-red-500 text-sm">{error}</span>
            </div>
          )}

          {/* Access Type Selection */}
          <div className="mb-6">
            <label className="text-xs text-gray-400 mb-2 block uppercase">
              [ACCESS_LEVEL]
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'dealer', 'provider'] as AccessType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccessType(type)}
                  className={`p-2 border-2 transition-all text-sm font-bold ${
                    accessType === type
                      ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-500'
                      : 'border-gray-700 text-gray-500 hover:border-green-500 hover:text-green-500'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Login Form */}
          <div className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block uppercase">
                [USER_ID]
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-600" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter username"
                  className="w-full bg-black border-2 border-gray-700 p-2 pl-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block uppercase">
                [PASSWORD]
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-3 text-gray-600" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter password"
                  className="w-full bg-black border-2 border-gray-700 p-2 pl-10 pr-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-600 hover:text-green-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-green-500 transition-colors">
                <input type="checkbox" className="w-3 h-3" />
                REMEMBER_SESSION
              </label>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                RECOVER_ACCESS?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full terminal-border bg-black p-3 text-green-500 font-bold hover:bg-green-500 hover:bg-opacity-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '&gt; AUTHENTICATING...' : '&gt; ESTABLISH_CONNECTION'}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              NEW_USER?{' '}
              <a href="/register" className="text-green-500 hover:underline">
                CREATE_ACCOUNT
              </a>
            </p>
          </div>

          {/* Status Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>SECURE_CONNECTION</span>
              </div>
              <span>SSL_ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Warning Notice */}
        <div className="mt-6 border-2 border-gray-800 bg-black p-4 text-center">
          <p className="text-xs text-gray-600">
            ⚠ UNAUTHORIZED ACCESS WILL BE LOGGED AND REPORTED
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;