import { useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { Eye, EyeOff, User, Lock, Mail, Shield, AlertTriangle, Building } from 'lucide-react';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'customer' | 'dealer' | 'provider'>('customer');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    businessName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const registrationData: any = {
        username: formData.username,
        password: formData.password,
        email: formData.email,
      };

      if (userType === 'provider') {
        if (!formData.businessName) {
          setError('REGISTRATION_FAILED: Business name required for providers');
          setLoading(false);
          return;
        }
        registrationData.businessName = formData.businessName;
      }

      const response = await authService.register(userType, registrationData);
      console.log('Registration successful:', response);
      navigate('/login');
    } catch (err: any) {
      setError(`REGISTRATION_FAILED: ${err.message}`);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleSubmit();
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
        <button 
          onClick={() => navigate('/')}
          className="text-gray-400 hover:text-green-500 transition-colors mb-6 inline-block"
        >
          &lt; BACK_TO_MAIN
        </button>

        {/* Register Container */}
        <div className="terminal-border bg-black p-8 relative overflow-hidden">
          {/* Scanning Line Effect */}
          {loading && <div className="scanning-line"></div>}

          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-bold terminal-glow">
                REGISTRATION_SYSTEM
              </span>
            </div>
            <Shield size={24} className="text-green-500" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 text-green-500 terminal-glow">
            &gt; CREATE_NEW_ACCOUNT
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            Initialize new user credentials in the system
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
              [ACCOUNT_TYPE]
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'dealer', 'provider'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setUserType(type);
                    if (type !== 'provider') {
                      setFormData({ ...formData, businessName: '' });
                    }
                  }}
                  className={`p-2 border-2 transition-all text-sm font-bold ${
                    userType === type
                      ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-500'
                      : 'border-gray-700 text-gray-500 hover:border-green-500 hover:text-green-500'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block uppercase">
                [USER_ID]
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-3 text-gray-600" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter username"
                  className="w-full bg-black border-2 border-gray-700 p-2 pl-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 mb-2 block uppercase">
                [EMAIL]
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-3 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter email address"
                  className="w-full bg-black border-2 border-gray-700 p-2 pl-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                  disabled={loading}
                  required
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter password"
                  className="w-full bg-black border-2 border-gray-700 p-2 pl-10 pr-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                  disabled={loading}
                  required
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

            {/* Business Name (Provider only) */}
            {userType === 'provider' && (
              <div>
                <label className="text-xs text-gray-400 mb-2 block uppercase">
                  [BUSINESS_NAME]
                </label>
                <div className="relative">
                  <Building size={18} className="absolute left-3 top-3 text-gray-600" />
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter business name"
                    className="w-full bg-black border-2 border-gray-700 p-2 pl-10 text-green-500 placeholder-gray-700 focus:border-green-500 focus:outline-none transition-colors font-mono"
                    disabled={loading}
                    required
                  />
                </div>
              </div>
            )}

            {/* <div className="flex items-start gap-2 text-xs">
              <input type="checkbox" className="w-3 h-3 mt-1" required />
              <label className="text-gray-400">
                I agree to the{' '}
                <a href="#" className="text-green-500 hover:underline">
                  TERMS_OF_SERVICE
                </a>
                {' '}and{' '}
                <a href="#" className="text-green-500 hover:underline">
                  PRIVACY_POLICY
                </a>
              </label>
            </div> */}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full terminal-border bg-black p-3 text-green-500 font-bold hover:bg-green-500 hover:bg-opacity-10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '> CREATING_ACCOUNT...' : '> INITIALIZE_ACCOUNT'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-sm text-gray-400">
              EXISTING_USER?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-green-500 hover:underline"
              >
                ACCESS_SYSTEM
              </button>
            </p>
          </div>

          
        </div>

        
      </div>
    </div>
  );
}