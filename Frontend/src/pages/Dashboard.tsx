import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { Package, Plus, TrendingUp, Users, Settings, Activity, ShoppingCart, Truck, Eye, XCircle } from 'lucide-react';
import AddInventoryModal from '../components/AddInventoryModal';
import AddSubstanceModal from '../components/AddSubstanceModal';

interface UserProfile {
  customer_id?: number;
  dealer_id?: number;
  provider_id?: number;
  username: string;
  email: string;
  status: string;
  businessName?: string;
  rating?: number;
  id?: number; // fallback
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddSubstance, setShowAddSubstance] = useState(false);

  // Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [substances, setSubstances] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);

  useEffect(() => {
    loadProfileAndData();
  }, []);

  const loadProfileAndData = async () => {
    try {
      const response = await authService.getProfile();
      const userData = response.user;
      setUser(userData);
      
      let type = '';
      let userId = 0;

      if (userData.customer_id) {
        type = 'customer';
        userId = userData.customer_id;
      } else if (userData.dealer_id) {
        type = 'dealer';
        userId = userData.dealer_id;
      } else if (userData.provider_id) {
        type = 'provider';
        userId = userData.provider_id;
      }
      
      setUserType(type);

      // Fetch specific data based on user type
      if (type === 'customer') {
        const customerOrders = await dataService.getCustomerOrders(userId);
        setOrders(customerOrders);
      } else if (type === 'dealer') {
        const dealerInv = await dataService.getDealerInventory(userId);
        const dealerOrders = await dataService.getDealerOrders(userId);
        setInventory(dealerInv);
        setOrders(dealerOrders);
      } else if (type === 'provider') {
        const provSubstances = await dataService.getProviderSubstances(userId);
        const provPOs = await dataService.getProviderPurchaseOrders(userId);
        setSubstances(provSubstances);
        setPurchaseOrders(provPOs);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('Failed to load profile or data:', err);
      setError(err.message);
      setLoading(false);
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

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm("CONFIRM DELETION: Are you sure you want to cancel this order?")) return;

    try {
        await dataService.cancelOrder(orderId);
        
        alert("Order terminated successfully.");
        
        loadProfileAndData(); 
    } catch (err: any) {
        console.error("Cancellation error", err);
        alert("Error: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-green-500 font-mono flex items-center justify-center">
        <div className="text-xl terminal-glow">&gt; LOADING_SYSTEM_DATA...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-black text-red-500 font-mono flex items-center justify-center">
        <div className="text-xl">[ERROR] SYSTEM_FAILURE: {error}</div>
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
        .cursor-pointer {
          cursor: pointer;
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
            <button 
              onClick={() => navigate('/profile')}
              className="text-xs border border-green-500 text-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
            >
              [EDIT_CONFIG]
            </button>
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
                  <span className="text-green-500 ml-2">⭐ {Number(user.rating).toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          {/* CUSTOMER CONTENT */}
          {userType === 'customer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow">
                &gt; CUSTOMER_PANEL
              </h2>
              
              {/* Order Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="terminal-border bg-black p-4">
                  <h3 className="text-green-500 font-bold mb-1">TOTAL ORDERS</h3>
                  <p className="text-2xl text-white">{orders.length}</p>
                </div>
                <div className="terminal-border bg-black p-4">
                  <h3 className="text-green-500 font-bold mb-1">ACTIVE</h3>
                  <p className="text-2xl text-white">{orders.filter(o => o.orderStatus !== 'delivered' && o.orderStatus !== 'cancelled').length}</p>
                </div>
              </div>

              {/* Action Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all">
                  <Package className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">YOUR_ORDERS</h3>
                  <p className="text-gray-400 text-sm">&gt; View and manage your orders</p>
                </div>
                
                {/* BROWSE PRODUCTS - Clickable */}
                <div 
                  onClick={() => navigate('/browse')}
                  className="terminal-border bg-black p-6 hover:bg-green-500 hover:bg-opacity-5 transition-all cursor-pointer"
                >
                  <Activity className="text-green-500 mb-3" size={32} />
                  <h3 className="text-green-500 font-bold text-lg mb-2 terminal-glow">BROWSE_PRODUCTS</h3>
                  <p className="text-gray-400 text-sm">&gt; Explore available products</p>
                </div>
              </div>

              {/* Recent Orders List - UPDATED WITH ACTIONS */}
              <div className="terminal-border bg-black p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package className="text-green-500" />
                  <h3 className="text-lg font-bold text-green-500">RECENT_ORDERS</h3>
                </div>
                {orders.length === 0 ? (
                  <p className="text-gray-500 text-sm">No orders found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-green-700 border-b border-green-900">
                        <tr>
                          <th className="py-2">ID</th>
                          <th className="py-2">DATE</th>
                          <th className="py-2">TOTAL</th>
                          <th className="py-2">STATUS</th>
                          <th className="py-2 text-right">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.order_id} className="border-b border-gray-900 hover:bg-green-500 hover:bg-opacity-5 transition-colors">
                            <td className="py-2 text-gray-300">#{order.order_id}</td>
                            <td className="py-2 text-gray-300">{new Date(order.orderDate || order.createdAt).toLocaleDateString()}</td>
                            <td className="py-2 text-green-500">${Number(order.totalAmount || order.totalCost).toFixed(2)}</td>
                            <td className="py-2">
                              <span className={`px-2 py-0.5 text-xs border ${
                                order.orderStatus === 'delivered' ? 'border-green-500 text-green-500' :
                                order.orderStatus === 'cancelled' ? 'border-red-500 text-red-500' :
                                'border-yellow-500 text-yellow-500'
                              }`}>
                                {(order.orderStatus || order.status).toUpperCase()}
                              </span>
                            </td>
                            <td className="py-2 text-right flex justify-end gap-3">
                                {/* View Button */}
                                <button 
                                    onClick={() => navigate(`/orders/${order.order_id}`)}
                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                                    title="View Details"
                                >
                                    <Eye size={14} /> [VIEW]
                                </button>

                                {/* Cancel Button (Only if Pending) */}
                                {(order.orderStatus === 'pending' || order.status === 'pending') && (
                                    <button 
                                        onClick={() => handleCancelOrder(order.order_id)}
                                        className="text-red-500 hover:text-red-400 flex items-center gap-1 text-xs"
                                        title="Cancel Order"
                                    >
                                        <XCircle size={14} /> [CANCEL]
                                    </button>
                                )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* DEALER CONTENT */}
          {userType === 'dealer' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow">
                &gt; DEALER_PANEL
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inventory Overview */}
                <div className="terminal-border bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="text-green-500" />
                    <h3 className="text-lg font-bold text-green-500">INVENTORY_STATUS</h3>
                  </div>
                  <button 
                      onClick={() => setShowAddInventory(true)}
                      className="flex items-center gap-1 text-xs bg-green-900/30 text-green-500 border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
                  >
                      <Plus size={14} /> ADD_ITEM
                  </button>
                  {inventory.length === 0 ? (
                    <p className="text-gray-500 text-sm">Inventory empty.</p>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-y-auto">
                      {inventory.map((item) => (
                        <li key={item.inventory_id} className="flex justify-between items-center border-b border-gray-900 pb-2">
                          <span className="text-gray-300 text-sm">{item.substance?.substanceName || 'Unknown Substance'}</span>
                          <span className={`text-sm font-bold ${item.quantityAvailable < 20 ? 'text-red-500' : 'text-green-500'}`}>
                            QTY: {item.quantityAvailable}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Recent Orders to Fulfill */}
                <div className="terminal-border bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="text-green-500" />
                    <h3 className="text-lg font-bold text-green-500">INCOMING_ORDERS</h3>
                  </div>
                  {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No active orders.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {orders.map((order) => (
                        <div 
                          key={order.order_id} 

                          onClick={() => navigate(`/orders/${order.order_id}`)}
                          className="border border-gray-800 p-2 flex justify-between items-center cursor-pointer hover:bg-green-900/20 hover:border-green-500 transition-all">
                          <div>
                            <p className="text-xs text-green-700">ORDER #{order.order_id}</p>
                            <p className="text-sm text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-green-500">${order.totalAmount}</p>
                            <p className="text-xs text-yellow-500">{order.orderStatus}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PROVIDER CONTENT */}
          {userType === 'provider' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-green-500 terminal-glow">
                &gt; PROVIDER_PANEL
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Substances Catalog */}
                <div className="terminal-border bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Activity className="text-green-500" />
                    <h3 className="text-lg font-bold text-green-500">ACTIVE_SUBSTANCES</h3>
                  </div>
                  <button 
                      onClick={() => setShowAddSubstance(true)}
                      className="flex items-center gap-1 text-xs bg-green-900/30 text-green-500 border border-green-500 px-2 py-1 hover:bg-green-500 hover:text-black transition-colors"
                  >
                      <Plus size={14} /> NEW_COMPOUND
                  </button>
                  {substances.length === 0 ? (
                    <p className="text-gray-500 text-sm">No substances listed.</p>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                      {substances.map((sub) => (
                        <div key={sub.substance_id} className="flex justify-between border-b border-gray-900 pb-1">
                          <span className="text-gray-300">{sub.substanceName}</span>
                          <span className="text-green-600">${sub.pricePerUnit}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Purchase Orders */}
                <div className="terminal-border bg-black p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingCart className="text-green-500" />
                    <h3 className="text-lg font-bold text-green-500">DEALER_PURCHASE_ORDERS</h3>
                  </div>
                  {purchaseOrders.length === 0 ? (
                    <p className="text-gray-500 text-sm">No purchase orders.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {purchaseOrders.map((po) => (
                        <div key={po.purchaseOrder_id} className="border border-gray-800 p-2">
                          <div className="flex justify-between">
                            <span className="text-xs text-green-700">PO #{po.purchaseOrder_id}</span>
                            <span className="text-xs text-gray-500">{new Date(po.orderDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-sm text-gray-300">{po.substance?.substanceName} (x{po.quantityOrdered})</span>
                            <span className="text-sm text-green-500">${po.totalCost}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

      {showAddInventory && (
          <AddInventoryModal 
              onClose={() => setShowAddInventory(false)} 
              onSuccess={() => {
                  alert("Inventory updated successfully.");
                  loadProfileAndData(); // Refresh dashboard
              }} 
          />
      )}

      {showAddSubstance && (
          <AddSubstanceModal 
              onClose={() => setShowAddSubstance(false)} 
              onSuccess={() => {
                  loadProfileAndData(); // Refresh list
              }} 
          />
      )}

    </div>
  );
}

export default Dashboard;