import { useState } from 'react';
import { X, Save, Beaker } from 'lucide-react';
import { dataService } from '../services/dataService';

interface AddSubstanceModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddSubstanceModal({ onClose, onSuccess }: AddSubstanceModalProps) {
  const [formData, setFormData] = useState({
    substanceName: '',
    category: '',
    description: '',
    pricePerUnit: 0,
    stockQuantity: 0 // Optional initial stock
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await dataService.createSubstance({
        ...formData,
        pricePerUnit: Number(formData.pricePerUnit),
        stockQuantity: Number(formData.stockQuantity)
      });
      alert("Substance cataloged successfully.");
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="border-2 border-green-500 bg-black w-full max-w-lg p-6 relative shadow-[0_0_20px_rgba(0,255,0,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-green-500 mb-6 border-b border-gray-800 pb-2 flex items-center gap-2">
          <Beaker size={20}/> NEW_SUBSTANCE_FORM
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
                <label className="block text-xs text-green-500 mb-1">SUBSTANCE_NAME</label>
                <input 
                    type="text" 
                    name="substanceName"
                    required
                    value={formData.substanceName}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-green-500 outline-none"
                    placeholder="e.g. Chemical X-23"
                />
            </div>

            <div>
                <label className="block text-xs text-green-500 mb-1">CATEGORY</label>
                <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-green-500 outline-none"
                >
                    <option value="">Select Category...</option>
                    <option value="Raw Material">Raw Material</option>
                    <option value="Refined Compound">Refined Compound</option>
                    <option value="Medical Grade">Medical Grade</option>
                    <option value="Industrial">Industrial</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-green-500 mb-1">UNIT_PRICE ($)</label>
                    <input 
                        type="number" 
                        name="pricePerUnit"
                        required
                        min="0.01"
                        step="0.01"
                        value={formData.pricePerUnit}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-green-500 outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs text-green-500 mb-1">INITIAL_STOCK</label>
                    <input 
                        type="number" 
                        name="stockQuantity"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-green-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs text-green-500 mb-1">DESCRIPTION</label>
                <textarea 
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 p-2 text-white focus:border-green-500 outline-none resize-none"
                    placeholder="Technical specifications..."
                />
            </div>

            <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-green-600 text-black font-bold py-3 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-4"
            >
                {submitting ? 'UPLOADING...' : <><Save size={18} /> REGISTER_SUBSTANCE</>}
            </button>
        </form>
      </div>
    </div>
  );
}