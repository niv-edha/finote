import React from 'react';
import { Moon, Sun, DollarSign, Bell, Download, Upload, Trash2, Shield } from 'lucide-react';

const Settings = ({ 
  darkMode, 
  setDarkMode, 
  currency, 
  setCurrency, 
  notifications, 
  setNotifications,
  expenses,
  setExpenses,
  budgets,
  setBudgets,
  goals,
  setGoals,
  cardBg, 
  borderColor 
}) => {
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  const exportAllData = () => {
    const data = {
      expenses,
      budgets,
      goals,
      settings: { darkMode, currency, notifications },
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finote-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (window.confirm('This will replace all your current data. Continue?')) {
          if (data.expenses) setExpenses(data.expenses);
          if (data.budgets) setBudgets(data.budgets);
          if (data.goals) setGoals(data.goals);
          if (data.settings) {
            setDarkMode(data.settings.darkMode);
            setCurrency(data.settings.currency);
            setNotifications(data.settings.notifications);
          }
          alert('Data imported successfully!');
        }
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const clearAllData = () => {
    if (window.confirm('⚠️ This will DELETE ALL your data permanently. This cannot be undone. Are you absolutely sure?')) {
      if (window.confirm('Last chance! This will erase all expenses, budgets, and goals. Continue?')) {
        setExpenses([]);
        setBudgets({});
        setGoals([]);
        alert('All data has been cleared.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">⚙️ Settings</h2>

      {/* Appearance */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Dark Mode</p>
              <p className="text-sm opacity-70">Toggle dark/light theme</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                darkMode ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Currency */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Currency
        </h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold mb-2">Select Currency</p>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${borderColor} ${cardBg}`}
            >
              {currencies.map(curr => (
                <option key={curr} value={curr}>{curr}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Notifications
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">Budget Alerts</p>
              <p className="text-sm opacity-70">Get notified when exceeding budgets</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                notifications ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Data Management
        </h3>
        <div className="space-y-3">
          <button
            onClick={exportAllData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Download className="w-5 h-5" />
            Export All Data (Backup)
          </button>
          
          <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer">
            <Upload className="w-5 h-5" />
            Import Data (Restore)
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>

          <button
            onClick={clearAllData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Trash2 className="w-5 h-5" />
            Clear All Data
          </button>
        </div>
        <p className="text-xs opacity-70 mt-4">
          💡 Tip: Export your data regularly to create backups. All data is stored locally on your device.
        </p>
      </div>

      {/* Privacy & Security */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">🔒 Privacy & Security</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <p>All data is stored locally on your device using browser storage</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <p>Your financial data never leaves your device</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <p>No account creation or login required</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <p>Works completely offline after first load</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-green-500">✓</span>
            <p>No tracking or analytics</p>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">ℹ️ App Information</h3>
        <div className="space-y-2 text-sm">
          <p><strong>App Name:</strong> Finote</p>
          <p><strong>Version:</strong> 1.0.0</p>
          <p><strong>Tagline:</strong> Keep Track. Stay Productive.</p>
          <p><strong>Total Expenses:</strong> {expenses.length}</p>
          <p><strong>Total Goals:</strong> {goals.length}</p>
          <p className="pt-4 opacity-70">
            Built with React, Recharts, and Tailwind CSS. Designed for privacy and simplicity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;