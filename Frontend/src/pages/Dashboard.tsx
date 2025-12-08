import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { Shield, Package, TrendingUp, Users, Settings, Activity } from 'lucide-react';

interface UserProfile {
  customer_id?: number;
  dealer_id?: number;
  provider_id?: number;
  username: string;
  email: string;
  status: string;
  businessName?: string;
  rating?: number;
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
      
      if (response.user.customer_id) {
        setUserType('customer');
      } else if (response.user.dealer_id) {
        setUserType('dealer');
      } else if (response.user.provider_id) {
        setUserType('provider');
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load profile:', err);
      setError(err.message);
      setLoading(false);
      navigate('/login');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err: any) {
      console.error('Logout failed:', err);
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
        <div className="text-xl terminal-glow">&gt; LOADING_SYSTEM...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-red-500 font-mono flex items-center justify-center">
        <div className="text-xl">[ERROR] FAILED_TO_LOAD_PROFILE</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono">
      <style>{`
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
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
      `}</style>

      <div className="scanline min-h-screen">
        <header className="border-b-2 border-green-500 bg-black p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 font-bold text-xl terminal-glow">
                [{userType.toUpperCase()}_DASHBOARD]
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="border-2 border-red-500 px-4 py-1 text-red-500 hover:bg-red-500 hover:bg-opacity-20 transition-all"
            >
              LOGOUT
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* User Info Card */}
          <div className="terminal-border bg-black p-6 mb-6">
            <h2 className="text-xl font-bold text-green-500 terminal-glow mb-4">
              &gt; PROFILE_INFORMATION
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700">&gt; USERNAME:</span>
                <span className="text-green-500 ml-2">{user.username}</span>
              </div>
              <div>
                <span className="text-green-700">&gt; EMAIL:</span>
                <span className="text-green-500 ml-2">{user.email}</span>
              </div>
              <div>
                <span className="text-green-700">&gt; STATUS:</span>
                <span className="text-green-500 ml-2">{user.status.toUpperCase()}</span>
              </div>
              <div>
                <span className="text-green-700">&gt; USER_TYPE:</span>
                <span className="text-green-500 ml-2">{userType.toUpperCase()}</span>
              </div>
              {userType === 'provider' && user.businessName && (
                <div>
                  <span className="text-green-700">&gt; BUSINESS:</span>
                  <span className="text-green-500 ml-2">{user.businessName}</span>
                </div>
              )}
              {userType === 'dealer' && user.rating !== undefined && (
                <div>
                  <span className="text-green-700">&gt; RATING:</span>
                  <span className="text-green-500 ml-2">⭐ {user.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Conditional Content Based on User Type */}
          {userType === 'customer' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow mb-4">
                &gt; CUSTOMER_PANEL
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Package className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">YOUR_ORDERS</h3>
                  <p className="text-gray-400 text-sm">&gt; View and manage your orders</p>
                </div>
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Activity className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">BROWSE_PRODUCTS</h3>
                  <p className="text-gray-400 text-sm">&gt; Explore available products</p>
                </div>
              </div>
            </div>
          )}

          {userType === 'dealer' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow mb-4">
                &gt; DEALER_PANEL
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Package className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">INVENTORY</h3>
                  <p className="text-gray-400 text-sm">&gt; Manage your stock</p>
                </div>
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <TrendingUp className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">ANALYTICS</h3>
                  <p className="text-gray-400 text-sm">&gt; View sales data</p>
                </div>
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Users className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">ORDERS</h3>
                  <p className="text-gray-400 text-sm">&gt; Process customer orders</p>
                </div>
              </div>
            </div>
          )}

          {userType === 'provider' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow mb-4">
                &gt; PROVIDER_PANEL
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Settings className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">SERVICES</h3>
                  <p className="text-gray-400 text-sm">&gt; Manage your offerings</p>
                </div>
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <TrendingUp className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">BUSINESS</h3>
                  <p className="text-gray-400 text-sm">&gt; Track performance</p>
                </div>
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Users className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">CLIENTS</h3>
                  <p className="text-gray-400 text-sm">&gt; Manage relationships</p>
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t-2 border-green-500 bg-black p-8 mt-20">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex justify-center gap-2 items-center mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-500 text-sm">SESSION_ACTIVE</span>
            </div>
            <p className="text-gray-600 text-xs">
              © 2025 SECURE MARKETPLACE // USER: {user.username.toUpperCase()}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Dashboard;