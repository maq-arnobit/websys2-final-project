import React, { useState } from 'react';
import { Home, Package, Users, ShoppingCart, TrendingUp, Settings, Bell, LogOut, Eye, EyeOff, Shield } from 'lucide-react';

type AccessType = 'customer' | 'dealer' | 'provider';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  count?: number;
}

const Homepage = () => {
  const [accessType, setAccessType] = useState<AccessType>('customer');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isIncognito, setIsIncognito] = useState(false);

  const menuConfig: Record<AccessType, MenuItem[]> = {
    customer: [
      { icon: <Home size={20} />, label: 'Dashboard' },
      { icon: <ShoppingCart size={20} />, label: 'My Orders', count: 3 },
      { icon: <Package size={20} />, label: 'Browse Products' },
      { icon: <Bell size={20} />, label: 'Notifications', count: 5 },
      { icon: <Settings size={20} />, label: 'Settings' },
    ],
    dealer: [
      { icon: <Home size={20} />, label: 'Dashboard' },
      { icon: <Package size={20} />, label: 'Inventory', count: 127 },
      { icon: <ShoppingCart size={20} />, label: 'Sales', count: 12 },
      { icon: <Users size={20} />, label: 'Customers', count: 45 },
      { icon: <TrendingUp size={20} />, label: 'Analytics' },
      { icon: <Settings size={20} />, label: 'Settings' },
    ],
    provider: [
      { icon: <Home size={20} />, label: 'Dashboard' },
      { icon: <Package size={20} />, label: 'Products', count: 234 },
      { icon: <Users size={20} />, label: 'Dealers', count: 18 },
      { icon: <ShoppingCart size={20} />, label: 'Orders', count: 67 },
      { icon: <TrendingUp size={20} />, label: 'Reports' },
      { icon: <Settings size={20} />, label: 'Settings' },
    ],
  };

  const stats = {
    customer: [
      { label: 'Active Orders', value: '3', sublabel: 'In Transit' },
      { label: 'Total Spent', value: '$2,459', sublabel: 'This Month' },
      { label: 'Saved Items', value: '12', sublabel: 'Watchlist' },
      { label: 'Loyalty Points', value: '850', sublabel: 'Redeemable' },
    ],
    dealer: [
      { label: 'Total Sales', value: '$45,231', sublabel: 'Last 30 Days' },
      { label: 'Active Orders', value: '12', sublabel: 'Processing' },
      { label: 'Products', value: '127', sublabel: 'In Stock' },
      { label: 'Customers', value: '45', sublabel: 'Active' },
    ],
    provider: [
      { label: 'Total Revenue', value: '$892,451', sublabel: 'This Quarter' },
      { label: 'Active Dealers', value: '18', sublabel: 'Verified' },
      { label: 'Products', value: '234', sublabel: 'Listed' },
      { label: 'Pending Orders', value: '67', sublabel: 'Awaiting' },
    ],
  };

  return (
    <div className="min-h-screen bg-black p-4 font-mono text-white">
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
        .redacted {
          background: repeating-linear-gradient(
            45deg,
            #000,
            #000 10px,
            #111 10px,
            #111 20px
          );
        }
      `}</style>

      {/* Access Type Switcher - For demo purposes */}
      <div className="mb-6 flex gap-2 justify-center">
        {(['customer', 'dealer', 'provider'] as AccessType[]).map((type) => (
          <button
            key={type}
            onClick={() => setAccessType(type)}
            className={`px-4 py-2 border-2 transition-all font-bold ${
              accessType === type
                ? 'border-green-500 bg-green-500 bg-opacity-20 text-green-500 terminal-glow'
                : 'border-gray-700 text-gray-500 hover:border-green-500 hover:text-green-500'
            }`}
          >
            [{type.toUpperCase()}]
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto scanline">
        {/* Header */}
        <div className="terminal-border bg-black p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-2 right-2 flex gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-green-500 terminal-glow">
                &gt; {accessType.toUpperCase()}_PORTAL.EXE
              </h1>
              <p className="text-sm text-gray-400">
                <span className="text-green-500">[SECURE]</span> Session ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsIncognito(!isIncognito)}
                className="border-2 border-gray-700 bg-black px-4 py-2 hover:border-yellow-500 hover:text-yellow-500 transition-all flex items-center gap-2"
              >
                {isIncognito ? <EyeOff size={18} /> : <Eye size={18} />}
                {isIncognito ? 'HIDDEN' : 'VISIBLE'}
              </button>
              <button className="danger-border bg-black px-4 py-2 hover:bg-red-500 hover:bg-opacity-10 transition-all flex items-center gap-2 text-red-500">
                <LogOut size={18} />
                EXIT
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <div className="terminal-border bg-black p-4">
              <div className="mb-4 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2 text-green-500 text-sm">
                  <Shield size={16} />
                  <span>ENCRYPTED</span>
                </div>
              </div>
              <nav className="space-y-2">
                {menuConfig[accessType].map((item, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center justify-between p-3 border border-gray-800 bg-black hover:bg-gray-900 hover:border-green-500 transition-all text-left group"
                  >
                    <div className="flex items-center gap-3 text-gray-400 group-hover:text-green-500">
                      {item.icon}
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    {item.count && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 font-bold">
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              {stats[accessType].map((stat, idx) => (
                <div
                  key={idx}
                  className="terminal-border bg-black p-4 hover:bg-gray-900 transition-all relative group"
                >
                  <div className="absolute top-1 right-1 text-xs text-gray-700 font-bold">
                    [{String(idx + 1).padStart(2, '0')}]
                  </div>
                  <p className="text-xs mb-2 text-gray-500 uppercase">{stat.label}</p>
                  <p className="text-3xl font-bold text-green-500 terminal-glow mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.sublabel}</p>
                </div>
              ))}
            </div>

            {/* Activity Section */}
            <div className="terminal-border bg-black p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-500 terminal-glow">
                  &gt; RECENT_ACTIVITY.LOG
                </h2>
                <span className="text-xs text-gray-600">LAST 24H</span>
              </div>
              <div className="space-y-2">
                {[
                  { time: '23:42:15', action: 'Transaction processed', status: 'SUCCESS' },
                  { time: '22:15:33', action: 'Data sync completed', status: 'SUCCESS' },
                  { time: '21:08:47', action: 'Security check passed', status: 'VERIFIED' },
                  { time: '19:55:12', action: 'Connection established', status: 'ACTIVE' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border border-gray-800 bg-black hover:border-green-500 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <div>
                        <p className="font-bold text-sm text-gray-300 group-hover:text-green-500">{item.action}</p>
                        <p className="text-xs text-gray-600 font-mono">{item.time} UTC</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-green-500 border border-green-500 px-2 py-1">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="terminal-border bg-black p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-green-500 terminal-glow">
                  &gt; ANALYTICS.GRAPH
                </h2>
                <div className="flex gap-2 text-xs">
                  <span className="text-gray-600">REFRESH: </span>
                  <span className="text-green-500">30s</span>
                </div>
              </div>
              <div className="h-48 border border-gray-800 bg-black flex items-end justify-around p-4 gap-2">
                {[65, 85, 45, 90, 70, 95, 60].map((height, idx) => (
                  <div
                    key={idx}
                    className="bg-green-500 flex-1 hover:bg-green-400 transition-all cursor-pointer relative group"
                    style={{ 
                      height: `${height}%`,
                      boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
                    }}
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-green-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {height}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;