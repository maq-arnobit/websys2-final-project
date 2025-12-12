import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Trash2, CreditCard, MapPin, CheckCircle, ArrowRight, ShoppingBag } from 'lucide-react';
import { dataService } from '../services/dataService';

export default function CartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<any[]>([]);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cart on mount
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('myAppCart') || '[]');
    setCart(storedCart);
  }, []);

  // Update LocalStorage whenever state changes
  const updateCartStorage = (newCart: any[]) => {
    setCart(newCart);
    localStorage.setItem('myAppCart', JSON.stringify(newCart));
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    updateCartStorage(newCart);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    const newQty = item.quantity + delta;

    if (newQty > 0 && newQty <= item.maxStock) {
      item.quantity = newQty;
      updateCartStorage(newCart);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Group items by Dealer
      // (Your backend requires one dealer_id per order, so we split mixed carts)
      const ordersByDealer: Record<number, any[]> = {};
      
      cart.forEach(item => {
        if (!ordersByDealer[item.dealer_id]) {
          ordersByDealer[item.dealer_id] = [];
        }
        ordersByDealer[item.dealer_id].push(item);
      });

      // 2. Send one request per dealer
      const dealerIds = Object.keys(ordersByDealer);
      
      for (const dealerId of dealerIds) {
        const itemsForDealer = ordersByDealer[Number(dealerId)];
        
        // Prepare payload matches your backend structure exactly
        const payload = {
            dealer_id: Number(dealerId),
            items: itemsForDealer.map(i => ({
                substance_id: i.substance_id,
                quantity: i.quantity,
                unitPrice: i.price
            })),
            deliveryAddress: address,
            paymentMethod: paymentMethod,
            shippingCost: 15.00 // Flat rate per shipment
        };

        await dataService.createOrder(payload);
      }

      // 3. Success! Clear cart
      localStorage.removeItem('myAppCart');
      setCart([]);
      alert("Order(s) placed successfully!");
      navigate('/home');

    } catch (err: any) {
      console.error(err);
      alert("Checkout Failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col items-center justify-center p-4">
            <ShoppingBag size={64} className="text-gray-700 mb-4" />
            <h1 className="text-2xl text-green-500 mb-4">CART_EMPTY</h1>
            <p className="text-gray-500 mb-8">No items detected in local storage.</p>
            <button 
                onClick={() => navigate('/browse')}
                className="bg-green-600 text-black px-6 py-2 font-bold hover:bg-green-500"
            >
                BROWSE_PRODUCTS
            </button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center gap-2 mb-8 border-b border-gray-800 pb-4">
            <button onClick={() => navigate('/browse')} className="text-gray-500 hover:text-green-500 mr-4">
                &lt; BACK
            </button>
            <h1 className="text-3xl font-bold text-green-500 terminal-glow">CHECKOUT_TERMINAL</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Cart Items */}
            <div className="lg:col-span-2 space-y-6">
                <div className="terminal-border bg-black p-6">
                    <h2 className="text-xl text-green-500 mb-4 border-b border-gray-900 pb-2">MANIFEST</h2>
                    <div className="space-y-4">
                        {cart.map((item, index) => (
                            <div key={`${item.inventory_id}-${index}`} className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900/30 p-4 border border-gray-800">
                                <div className="mb-2 md:mb-0">
                                    <h3 className="font-bold text-green-400">{item.name}</h3>
                                    <p className="text-xs text-gray-500">PROVIDER: {item.dealerName}</p>
                                    <p className="text-sm text-gray-400">${item.price} / unit</p>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-gray-700 bg-black">
                                        <button 
                                            onClick={() => updateQuantity(index, -1)}
                                            className="px-3 py-1 hover:bg-gray-800 text-gray-400"
                                        >-</button>
                                        <span className="px-3 py-1 text-white font-mono">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(index, 1)}
                                            className="px-3 py-1 hover:bg-gray-800 text-gray-400"
                                        >+</button>
                                    </div>

                                    <div className="text-right min-w-[80px]">
                                        <div className="text-green-500 font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                    </div>

                                    <button 
                                        onClick={() => removeFromCart(index)}
                                        className="text-red-900 hover:text-red-500 transition-colors"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Checkout Form */}
            <div className="lg:col-span-1">
                <form onSubmit={handleCheckout} className="terminal-border bg-black p-6 sticky top-4">
                    <h2 className="text-xl text-green-500 mb-6 border-b border-gray-900 pb-2">TRANSACTION_DETAILS</h2>

                    {/* Delivery Address */}
                    <div className="mb-6">
                        <label className="block text-xs text-green-500 mb-2 flex items-center gap-2">
                            <MapPin size={14}/> DELIVERY_COORDINATES
                        </label>
                        <textarea
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter full shipping address..."
                            rows={3}
                            className="w-full bg-black border border-gray-700 p-3 text-white focus:border-green-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                        <label className="block text-xs text-green-500 mb-2 flex items-center gap-2">
                            <CreditCard size={14}/> PAYMENT_METHOD
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full bg-black border border-gray-700 p-3 text-white focus:border-green-500 focus:outline-none"
                        >
                            <option value="Credit Card">Credit Card</option>
                            <option value="Crypto (BTC)">Bitcoin (BTC)</option>
                            <option value="Crypto (XMR)">Monero (XMR)</option>
                            <option value="Bank Transfer">Wire Transfer</option>
                        </select>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-gray-800 pt-4 mb-6 space-y-2">
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>SUBTOTAL</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                            <span>SHIPPING (Est.)</span>
                            <span>$15.00</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-green-500 pt-2 border-t border-gray-900 mt-2">
                            <span>TOTAL</span>
                            <span>${(calculateTotal() + 15).toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-black font-bold py-4 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all group"
                    >
                        {isSubmitting ? 'PROCESSING...' : (
                            <>
                                CONFIRM_ORDER <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                    
                    <p className="text-xs text-gray-600 text-center mt-4">
                        * Encrypted transmission. Transactions are final.
                    </p>
                </form>
            </div>
        </div>

        <style>{`
            .terminal-border {
                border: 1px solid #333;
                box-shadow: 0 0 15px rgba(0, 255, 0, 0.05);
            }
            .terminal-glow {
                text-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
            }
        `}</style>
      </div>
    </div>
  );
}