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
  // --- Profile Management ---
  updateCustomerProfile: async (id: number, data: any) => {
    try {
      const response = await axios.put(`${API_URL}/api/customers/${id}`, data, axiosConfig);
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

  
};