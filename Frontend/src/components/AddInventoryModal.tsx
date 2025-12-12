import { useState, useEffect } from 'react';
import { X, Save, Search } from 'lucide-react';
import { dataService } from '../services/dataService';

interface AddInventoryModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInventoryModal({ onClose, onSuccess }: AddInventoryModalProps) {
  const [substances, setSubstances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubstance, setSelectedSubstance] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadSubstances();
  }, []);

  const loadSubstances = async () => {
    try {
      const data = await dataService.getAllSubstances();
      setSubstances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubstance) return;
    
    setSubmitting(true);
    try {
      await dataService.addInventoryItem(selectedSubstance, quantity);
      onSuccess();
      onClose();
    } catch (err: any) {
      alert("Failed: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSubstances = substances.filter(s => 
    s.substanceName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="border-2 border-green-500 bg-black w-full max-w-lg p-6 relative shadow-[0_0_20px_rgba(0,255,0,0.2)]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold text-green-500 mb-6 border-b border-gray-800 pb-2">
          &gt; ACQUIRE_NEW_STOCK
        </h2>

        <div className="mb-4">
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Search catalog..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 p-2 pl-10 text-white focus:border-green-500 focus:outline-none"
                />
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-800 p-2">
                {loading ? (
                    <div className="text-green-500 animate-pulse">SCANNING_DATABASE...</div>
                ) : filteredSubstances.map((sub) => (
                    <div 
                        key={sub.substance_id}
                        onClick={() => setSelectedSubstance(sub.substance_id)}
                        className={`p-3 cursor-pointer border transition-all ${
                            selectedSubstance === sub.substance_id 
                            ? 'border-green-500 bg-green-900/30' 
                            : 'border-gray-800 hover:border-gray-600'
                        }`}
                    >
                        <div className="flex justify-between">
                            <span className="font-bold text-gray-200">{sub.substanceName}</span>
                            <span className="text-xs text-gray-500">{sub.category}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{sub.description}</p>
                    </div>
                ))}
            </div>

            <div>
                <label className="block text-green-500 text-sm mb-2">INITIAL_QUANTITY</label>
                <input 
                    type="number" 
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    className="w-full bg-black border border-gray-700 p-2 text-white focus:border-green-500 outline-none"
                />
            </div>

            <button 
                type="submit" 
                disabled={!selectedSubstance || submitting}
                className="w-full bg-green-600 text-black font-bold py-3 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
            >
                {submitting ? 'PROCESSING...' : <><Save size={18} /> CONFIRM_ACQUISITION</>}
            </button>
        </form>
      </div>
    </div>
  );
}