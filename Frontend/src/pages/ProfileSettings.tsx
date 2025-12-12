import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save, User, Mail, MapPin } from 'lucide-react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';

function ProfileSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form State
  const [formData, setFormData] = useState({
    id: 0,
    username: '',
    email: '',
    address: '' 
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authService.getProfile();
      const user = res.user;
      
      // Pre-fill form (Fallback to empty string if null)
      setFormData({
        id: user.customer_id || user.id,
        username: user.username || '',
        email: user.email || '',
        address: user.address || ''
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      // Only send Email and Address
      const payload = {
        email: formData.email,
        address: formData.address
      };

      await dataService.updateCustomerProfile(formData.id, payload);
      setSuccess('Profile updated successfully.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-10 bg-black text-green-500 font-mono">LOADING_PROFILE...</div>;

  return (
    <div className="min-h-screen bg-black text-white font-mono p-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <button onClick={() => navigate('/home')} className="flex items-center text-green-500 mb-6 hover:text-green-400 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> RETURN_TO_DASHBOARD
        </button>

        <div className="border-2 border-green-500 p-8 shadow-[0_0_15px_rgba(0,255,0,0.2)] bg-black">
          <h1 className="text-2xl font-bold text-green-500 mb-6 flex items-center gap-2">
             &gt; EDIT_PROFILE_CONFIG
          </h1>

          {error && <div className="bg-red-900/20 border border-red-500 text-red-500 p-3 mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-900/20 border border-green-500 text-green-500 p-3 mb-4 text-sm">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Username (Read Only) */}
            <div>
              <label className="block text-green-700 text-sm mb-1">USERNAME [LOCKED]</label>
              <div className="flex items-center border border-gray-800 bg-gray-900 p-2 text-gray-500">
                <User size={16} className="mr-2" />
                {formData.username}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-green-500 text-sm mb-1">EMAIL_ADDRESS</label>
              <div className="flex items-center border border-green-800 focus-within:border-green-500 bg-black p-2 transition-colors">
                <Mail size={16} className="mr-2 text-green-700" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent border-none outline-none w-full text-white placeholder-gray-700"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-green-500 text-sm mb-1">DEFAULT_ADDRESS</label>
              <div className="flex items-start border border-green-800 focus-within:border-green-500 bg-black p-2 transition-colors">
                <MapPin size={16} className="mr-2 mt-1 text-green-700" />
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="bg-transparent border-none outline-none w-full text-white placeholder-gray-700 resize-none"
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-green-900/20 border-2 border-green-500 text-green-500 py-3 hover:bg-green-500 hover:text-black font-bold transition-all flex justify-center items-center gap-2 group"
            >
              <Save size={18} className="group-hover:scale-110 transition-transform"/> 
              SAVE_CHANGES
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileSettings;