import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

const axiosConfig = {
  withCredentials: true,
};

export const dataService = {
  // --- Inventory (Public/Customer) ---
  getAllInventory: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/inventory`, axiosConfig);
      return response.data.inventory;
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }
  },

  // --- Order Management ---
  createOrder: async (orderData: {
    dealer_id: number;
    items: { substance_id: number; quantity: number; unitPrice: number }[];
    deliveryAddress: string;
    paymentMethod: string;
    shippingCost?: number;
  }) => {
    try {
      const response = await axios.post(`${API_URL}/api/orders`, orderData, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error creating order:', error);
      throw new Error(error.response?.data?.message || 'Failed to create order');
    }
  },

  // --- Customer Endpoints ---
  getCustomerOrders: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/customers/${id}/orders`, axiosConfig);
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  },
  
  getOrderById: async (id: number | string) => {
    try {
      const response = await axios.get(`${API_URL}/api/orders/${id}`, axiosConfig);
      return response.data.order;
    } catch (error: any) {
      console.error('Error fetching order details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch order');
    }
  },

  cancelOrder: async (id: number | string) => {
    try {
      const response = await axios.delete(`${API_URL}/api/orders/${id}`, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel order');
    }
  },
  updateProfile: async (userType: 'customer' | 'dealer' | 'provider', id: number, data: any) => {
    try {
      // Dynamically choose the endpoint based on user type (pluralized)
      const endpoint = `${API_URL}/api/${userType}s/${id}`;
      const response = await axios.put(endpoint, data, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  // --- Dealer Endpoints ---
  getDealerInventory: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/dealers/${id}/inventory`, axiosConfig);
      return response.data.inventory;
    } catch (error) {
      console.error('Error fetching dealer inventory:', error);
      throw error;
    }
  },

  getDealerOrders: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/dealers/${id}/orders`, axiosConfig);
      return response.data.orders;
    } catch (error) {
      console.error('Error fetching dealer orders:', error);
      throw error;
    }
  },
  // --- Fulfillment ---
  shipOrder: async (orderId: number, carrier: string) => {
    try {
      const response = await axios.post(`${API_URL}/api/shipments`, {
        order_id: orderId,
        carrier: carrier
      }, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error shipping order:', error);
      throw new Error(error.response?.data?.message || 'Failed to ship order');
    }
  },
  // --- Substance & Inventory Management ---
  getAllSubstances: async () => {
    try {
      const response = await axios.get(`${API_URL}/api/substances`, axiosConfig);
      return response.data.substances;
    } catch (error) {
      console.error('Error fetching substances:', error);
      throw error;
    }
  },

  addInventoryItem: async (substanceId: number, quantity: number) => {
    try {
      const response = await axios.post(`${API_URL}/api/inventory`, {
        substance_id: substanceId,
        quantity: quantity
      }, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error adding inventory:', error);
      throw new Error(error.response?.data?.message || 'Failed to add inventory');
    }
  },

  // --- Provider Endpoints ---
  getProviderSubstances: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/providers/${id}/substances`, axiosConfig);
      return response.data.substances;
    } catch (error) {
      console.error('Error fetching provider substances:', error);
      throw error;
    }
  },

  getProviderPurchaseOrders: async (id: number) => {
    try {
      const response = await axios.get(`${API_URL}/api/providers/${id}/purchase-orders`, axiosConfig);
      return response.data.purchaseOrders;
    } catch (error) {
      console.error('Error fetching provider purchase orders:', error);
      throw error;
    }
  },
  createSubstance: async (data: any) => {
    try {
      const response = await axios.post(`${API_URL}/api/substances`, data, axiosConfig);
      return response.data;
    } catch (error: any) {
      console.error('Error creating substance:', error);
      throw new Error(error.response?.data?.message || 'Failed to create substance');
    }
  },
  
};