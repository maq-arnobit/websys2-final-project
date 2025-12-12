import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Box, Truck, ArrowLeft, Package, DollarSign, MapPin } from 'lucide-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService'; // Import authService

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [user, setUser] = useState<any>(null); // State for current user
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        // 1. Fetch User Profile (to check if Dealer)
        const userRes = await authService.getProfile();
        setUser(userRes.user);

        // 2. Fetch Order Details
        const orderData = await dataService.getOrderById(id);
        setOrder(orderData);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleShipOrder = async () => {
    if (!window.confirm("CONFIRM: Mark this order as shipped?")) return;
    
    try {
        // Call backend to ship
        await dataService.shipOrder(order.order_id, "FedEx-Express"); 
        alert("Order status updated: SHIPPED");
        
        // Refresh data to show new status
        const updatedOrder = await dataService.getOrderById(id!);
        setOrder(updatedOrder);
    } catch (err: any) {
        alert("Error: " + err.message);
    }
  };

  if (loading) return <div className="p-10 bg-black text-green-500 font-mono">LOADING...</div>;
  
  if (error) return (
    <div className="min-h-screen bg-black text-red-500 font-mono p-10">
      <h2 className="text-xl font-bold mb-4">SYSTEM_ERROR</h2>
      <p>{error}</p>
      <button onClick={() => navigate('/home')} className="mt-4 text-green-500 underline">
        Return to Dashboard
      </button>
    </div>
  );

  if (!order) return <div className="p-10 bg-black text-red-500 font-mono">ORDER NOT FOUND</div>;

  // Logic to determine if Dealer Controls should be shown
  const isDealerForThisOrder = user?.dealer_id && user.dealer_id === order.dealer_id;
  const isPending = order.status === 'pending' || order.orderStatus === 'pending' || order.orderStatus === 'processing';

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      <button onClick={() => navigate('/home')} className="flex items-center text-green-500 mb-6 hover:text-green-400">
        <ArrowLeft size={16} className="mr-2" /> BACK_TO_DASHBOARD
      </button>

      <div className="border-2 border-green-500 p-6 max-w-4xl mx-auto shadow-[0_0_10px_rgba(0,255,0,0.3)]">
        <div className="flex justify-between items-start border-b border-gray-800 pb-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-green-500">ORDER #{order.order_id}</h1>
            <p className="text-gray-400 text-sm">Placed on: {new Date(order.orderDate || order.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="text-right">
            <div className={`px-3 py-1 border inline-block mb-2 ${order.status === 'shipped' || order.orderStatus === 'shipped' || order.status === 'delivered' || order.orderStatus === 'delivered' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
              {(order.status || order.orderStatus).toUpperCase()}
            </div>
            
            {/* DEALER ACTION BUTTON */}
            {isDealerForThisOrder && isPending && (
                 <div className="mt-2">
                     <button 
                        onClick={handleShipOrder}
                        className="bg-green-600 text-black font-bold px-4 py-2 hover:bg-green-500 transition-colors flex items-center gap-2"
                     >
                        <Box size={16} /> SHIP_ORDER
                     </button>
                 </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-green-500 font-bold flex items-center gap-2 mb-2"><MapPin size={16}/> SHIPPING INFO</h3>
            <p className="text-gray-300">{order.deliveryAddress}</p>
            <p className="text-gray-400 text-sm mt-1">Method: Standard Delivery</p>

            {/* Display Shipment Tracking Info if available */}
            {order.shipment && (
                <div className="mt-4 border border-green-900 bg-green-900/10 p-3 text-sm">
                    <p className="text-green-400 font-bold mb-1">TRACKING ACTIVE</p>
                    <p className="text-gray-400">Carrier: <span className="text-white">{order.shipment.carrier}</span></p>
                    <p className="text-gray-400">Status: <span className="text-white">{order.shipment.status.toUpperCase()}</span></p>
                </div>
            )}
          </div>
          <div className="text-right">
             <h3 className="text-green-500 font-bold flex items-center justify-end gap-2 mb-2"><DollarSign size={16}/> PAYMENT</h3>
             <p className="text-gray-300">Method: {order.paymentMethod}</p>
             <p className="text-gray-300">Status: {order.paymentStatus}</p>
          </div>
        </div>

        <h3 className="text-green-500 font-bold flex items-center gap-2 mb-4"><Package size={16}/> ITEMS</h3>
        <table className="w-full text-left text-sm mb-6">
          <thead className="border-b border-gray-800 text-gray-500">
            <tr>
              <th className="py-2">ITEM</th>
              <th className="py-2">UNIT PRICE</th>
              <th className="py-2">QTY</th>
              <th className="py-2 text-right">SUBTOTAL</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item: any) => (
              <tr key={item.orderItem_id} className="border-b border-gray-900">
                <td className="py-3">{item.substance?.substanceName || 'Unknown Item'}</td>
                <td className="py-3">${item.unitPrice}</td>
                <td className="py-3">x{item.quantity}</td>
                <td className="py-3 text-right text-green-500">${item.subTotal}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end border-t border-gray-800 pt-4">
            <div className="text-right">
                <p className="text-gray-400">Shipping: ${order.shippingCost || 0}</p>
                <p className="text-xl text-green-500 font-bold mt-1">TOTAL: ${order.totalAmount}</p>
            </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;