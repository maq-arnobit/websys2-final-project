import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Truck, ArrowLeft, Package, DollarSign, MapPin } from 'lucide-react';
import { dataService } from '../services/dataService'; // <--- IMPORT THIS

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!id) return;
      
      try {
        // --- FIXED: Use dataService to hit the correct backend port ---
        const data = await dataService.getOrderById(id);
        setOrder(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

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
          <div className={`px-3 py-1 border ${order.status === 'delivered' ? 'border-green-500 text-green-500' : 'border-yellow-500 text-yellow-500'}`}>
            {order.status?.toUpperCase() || order.orderStatus?.toUpperCase()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-green-500 font-bold flex items-center gap-2 mb-2"><MapPin size={16}/> SHIPPING INFO</h3>
            <p className="text-gray-300">{order.deliveryAddress}</p>
            <p className="text-gray-400 text-sm mt-1">Method: {order.shipment?.shipmentMethod || 'Standard Delivery'}</p>
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