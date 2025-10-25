import React, { useState } from 'react';
import { X, Mic, Camera, Wand2 } from 'lucide-react';
import { autoCategorizeMerchant } from '../utils/aiHelpers';

const AddExpenseModal = ({ onClose, onAdd, categories, darkMode }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: categories[0].name,
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: '',
    recurring: false,
    recurringInterval: 'monthly',
    mood: 'neutral'
  });

  const handleVoiceInput = () => {
    alert('🎤 Voice Input: In production, this would use the Web Speech API to convert your speech to text. For now, here\'s a demo entry!');
    setFormData({
      ...formData,
      description: 'Coffee at Starbucks',
      amount: '5.50',
      category: autoCategorizeMerchant('Coffee at Starbucks')
    });
  };

  const handleReceiptScan = () => {
    alert('📸 Receipt Scanner: In production, this would use OCR (Tesseract.js or cloud API) to extract data from receipt images. Here\'s a demo entry!');
    setFormData({
      ...formData,
      description: 'Grocery Store - Whole Foods',
      amount: '87.32',
      category: autoCategorizeMerchant('Grocery Store')
    });
  };

  const handleAutoCategory = () => {
    if (formData.description) {
      const suggestedCategory = autoCategorizeMerchant(formData.description);
      setFormData({ ...formData, category: suggestedCategory });
      alert(`✨ AI suggests: ${suggestedCategory}`);
    } else {
      alert('Please enter a description first!');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const rawValue = formData.amount?.trim();
    const amount = parseFloat(rawValue);

    if (!rawValue || isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    // Round to two decimal places for consistency
    const roundedAmount = Math.round(amount * 100) / 100;

    if (!formData.description.trim()) {
      alert('Please enter a description');
      return;
    }

    const tags = formData.tags
      ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      : [];

    onAdd({
      ...formData,
      tags,
      amount: roundedAmount
    });

    onClose();
  };

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${cardBg} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${cardBg} z-10`}>
          <h2 className="text-2xl font-bold">Add New Expense</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm opacity-70 mb-3">Quick Add Methods:</p>
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleVoiceInput}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
            >
              <Mic className="w-4 h-4" />
              Voice Input
            </button>
            <button
              type="button"
              onClick={handleReceiptScan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Camera className="w-4 h-4" />
              Scan Receipt
            </button>
            <button
              type="button"
              onClick={handleAutoCategory}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Wand2 className="w-4 h-4" />
              Auto-Categorize
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${cardBg} text-lg font-semibold`}
              placeholder="0.00"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${cardBg}`}
              placeholder="What did you spend on?"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${cardBg}`}
            >
              {categories.map(cat => (
                <option key={cat.name} value={cat.name}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold mb-2">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${cardBg}`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${cardBg}`}
              placeholder="e.g., work, lunch, urgent"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-sm font-semibold mb-2">Mood (Optional)</label>
            <div className="flex gap-2">
              {[
                { value: 'happy', emoji: '😊', label: 'Happy' },
                { value: 'neutral', emoji: '😐', label: 'Neutral' },
                { value: 'sad', emoji: '😢', label: 'Regret' }
              ].map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mood: mood.value })}
                  className={`flex-1 px-4 py-3 rounded-lg border ${borderColor} ${
                    formData.mood === mood.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : cardBg
                  }`}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-sm">{mood.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recurring */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recurring}
                onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">Recurring Expense</span>
            </label>
            {formData.recurring && (
              <select
                value={formData.recurringInterval}
                onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${cardBg} mt-2`}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-semibold"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
