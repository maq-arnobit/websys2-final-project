import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { dataService } from '../services/dataService';
import { ShoppingCart, Package, Truck, Plus } from 'lucide-react';

interface Substance {
  substance_id: number;
  substanceName: string;
  category: string;
  description: string;
  pricePerUnit?: number;
  image_url?: string;
}

interface Dealer {
  dealer_id: number;
  username: string;
  rating: string;
}

interface InventoryItem {
  inventory_id: number;
  dealer_id: number;
  substance_id: number;
  quantityAvailable: number;
  substance: Substance;
  dealer: Dealer;
}

export default function BrowseProducts() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchInventory();
    updateCartCount();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await dataService.getAllInventory();
      // Filter out items with 0 quantity
      setInventory(data.filter((item: any) => item.quantityAvailable > 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem('myAppCart') || '[]');
    const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleAddToCart = (item: InventoryItem) => {
    // 1. Get existing cart
    const cart = JSON.parse(localStorage.getItem('myAppCart') || '[]');

    // 2. Check if item exists (by substance_id AND dealer_id to be safe)
    const existingIndex = cart.findIndex((cartItem: any) => 
      cartItem.substance_id === item.substance_id && cartItem.dealer_id === item.dealer_id
    );

    if (existingIndex > -1) {
      // Increment quantity
      if (cart[existingIndex].quantity < item.quantityAvailable) {
        cart[existingIndex].quantity += 1;
      } else {
        alert("Max stock reached for this item.");
        return;
      }
    } else {
      // Add new item
      cart.push({
        inventory_id: item.inventory_id,
        dealer_id: item.dealer_id,
        substance_id: item.substance_id,
        name: item.substance.substanceName,
        price: item.substance.pricePerUnit || 50,
        dealerName: item.dealer.username,
        quantity: 1,
        maxStock: item.quantityAvailable
      });
    }

    // 3. Save back to storage
    localStorage.setItem('myAppCart', JSON.stringify(cart));
    
    // 4. Update UI
    updateCartCount();
    
    // Optional: Visual feedback
    // You could replace this with a toast notification
    console.log("Item added to cart"); 
  };

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4 sticky top-0 bg-black z-10 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <h1 className="text-2xl font-bold text-green-500 terminal-glow hidden md:block">MARKETPLACE</h1>
        </div>

        <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate('/home')}
                className="text-gray-500 hover:text-green-500 text-sm"
            >
                &lt; DASHBOARD
            </button>

            {/* CART BUTTON */}
            <button 
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 bg-green-900/30 border border-green-500 px-4 py-2 text-green-500 hover:bg-green-500 hover:text-black transition-all"
            >
                <ShoppingCart size={18} />
                <span className="font-bold">CART [{cartCount}]</span>
            </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto pb-20">
        {loading ? (
          <div className="text-center text-green-500 animate-pulse mt-20">&gt; SCANNING_NETWORK_FOR_PRODUCTS...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventory.map((item) => (
              <div key={item.inventory_id} className="terminal-border bg-black p-4 flex flex-col justify-between hover:bg-green-500 hover:bg-opacity-5 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs text-gray-500 uppercase px-2 py-0.5 border border-gray-800 rounded">{item.substance.category || 'MISC'}</span>
                    <span className="text-xs text-green-700">STOCK: {item.quantityAvailable}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-green-500 mb-1 group-hover:terminal-glow truncate">
                    {item.substance.substanceName}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2 h-10">
                    {item.substance.description || 'No description available.'}
                  </p>

                  <div className="text-sm mb-4 space-y-1">
                    <div className="flex justify-between border-b border-gray-900 pb-1">
                      <span className="text-gray-500">DEALER</span>
                      <span className="text-green-300">{item.dealer.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">RATING</span>
                      <span className="text-yellow-500">⭐ {Number(item.dealer.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 border-t border-gray-800 pt-4">
                  <span className="text-lg font-bold text-white">
                    ${item.substance.pricePerUnit || '50.00'}
                  </span>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-2 bg-green-600 text-black px-4 py-2 font-bold hover:bg-green-500 active:scale-95 transition-all text-sm"
                  >
                    <Plus size={16} />
                    ADD_TO_CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style>{`
        .terminal-border {
          border: 1px solid #333;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
        }
        .terminal-glow {
          text-shadow: 0 0 5px rgba(0, 255, 0, 0.5);
        }
      `}</style>
    </div>
  );
}