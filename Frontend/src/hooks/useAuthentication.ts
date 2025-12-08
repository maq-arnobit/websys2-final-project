import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4200';

export function UseAuthentication() {
  async function login(username: string, password: string) {
    try {
      const user = await axios.post(`${API_URL}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      return user.data;
    } catch (err) {
      throw new Error('invalid credentials');
    }
  }
  
  async function logout() {
    try {
      await axios.post(`${API_URL}/api/auth/logout`, {}, { withCredentials: true });
    } catch (err) {
      console.log('logout failed');
    }
  }
  
  return {
    login,
    logout,
  };
}