import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, Target, Award, MessageSquare, Settings as SettingsIcon, Plus, Moon, Sun, Zap, AlertCircle } from 'lucide-react';
import Dashboard from './components/Dashboard';
import ExpensesList from './components/ExpensesList';
import BudgetManager from './components/BudgetManager';
import GoalsManager from './components/GoalsManager';
import AIAssistant from './components/AIAssistant';
import Settings from './components/Settings';
import AddExpenseModal from './components/AddExpenseModal';
import { loadData, saveData } from './utils/storage';
import { autoCategorizeMerchant } from './utils/aiHelpers';
import './styles/App.css';

const CATEGORIES = [
  { name: 'Food & Dining', color: '#FF6384', icon: '🍔' },
  { name: 'Transportation', color: '#36A2EB', icon: '🚗' },
  { name: 'Shopping', color: '#FFCE56', icon: '🛍️' },
  { name: 'Entertainment', color: '#4BC0C0', icon: '🎬' },
  { name: 'Bills & Utilities', color: '#9966FF', icon: '💡' },
  { name: 'Healthcare', color: '#FF9F40', icon: '🏥' },
  { name: 'Education', color: '#FF6384', icon: '📚' },
  { name: 'Others', color: '#C9CBCF', icon: '📦' }
];

const CURRENCY_SYMBOLS = {
  USD: '$', EUR: '€', GBP: '£', INR: '₹', JPY: '¥', AUD: 'A$', CAD: 'C$'
};

function App() {
  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [goals, setGoals] = useState([]);
  const [currentView, setCurrentView] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [streak, setStreak] = useState(0);
  const [badges, setBadges] = useState([]);
  const [notifications, setNotifications] = useState(true);

  // Load data on mount
  useEffect(() => {
    const data = loadData();
    if (data.expenses) setExpenses(data.expenses);
    if (data.budgets) setBudgets(data.budgets);
    else {
      // Initialize default budgets
      const defaultBudgets = {};
      CATEGORIES.forEach(cat => {
        defaultBudgets[cat.name] = 500;
      });
      setBudgets(defaultBudgets);
    }
    if (data.goals) setGoals(data.goals);
    if (data.settings) {
      setDarkMode(data.settings.darkMode || false);
      setCurrency(data.settings.currency || 'USD');
      setNotifications(data.settings.notifications !== false);
    }
    if (data.streak) setStreak(data.streak);
    if (data.badges) setBadges(data.badges);
    
    // Add sample data if empty
    if (!data.expenses || data.expenses.length === 0) {
      const sampleExpenses = [
        { 
          id: Date.now(), 
          amount: 45.50, 
          category: 'Food & Dining', 
          description: 'Lunch at cafe', 
          date: new Date().toISOString().split('T')[0], 
          tags: ['lunch'], 
          mood: 'happy',
          recurring: false
        },
        { 
          id: Date.now() + 1, 
          amount: 120, 
          category: 'Shopping', 
          description: 'New shoes', 
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], 
          tags: ['clothing'], 
          mood: 'neutral',
          recurring: false
        },
        { 
          id: Date.now() + 2, 
          amount: 30, 
          category: 'Transportation', 
          description: 'Uber ride', 
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], 
          tags: ['commute'], 
          mood: 'neutral',
          recurring: false
        }
      ];
      setExpenses(sampleExpenses);
    }
  }, []);

  // Save data when it changes
  useEffect(() => {
    if (expenses.length > 0 || Object.keys(budgets).length > 0) {
      saveData({
        expenses,
        budgets,
        goals,
        settings: { darkMode, currency, notifications },
        streak,
        badges
      });
    }
  }, [expenses, budgets, goals, darkMode, currency, streak, badges, notifications]);

  // Add expense
  const addExpense = (expenseData) => {
    const expense = {
      id: Date.now(),
      ...expenseData,
      amount: parseFloat(expenseData.amount),
      category: expenseData.category || autoCategorizeMerchant(expenseData.description)
    };

    setExpenses([expense, ...expenses]);
    setStreak(prev => prev + 1);
    
    // Award badges
    const newExpensesCount = expenses.length + 1;
    if (newExpensesCount === 10 && !badges.includes('First 10')) {
      setBadges([...badges, 'First 10']);
    }
    if (newExpensesCount === 50 && !badges.includes('Half Century')) {
      setBadges([...badges, 'Half Century']);
    }
    if (newExpensesCount === 100 && !badges.includes('Century')) {
      setBadges([...badges, 'Century']);
    }

    // Check streak badges
    if (streak >= 7 && !badges.includes('Week Warrior')) {
      setBadges([...badges, 'Week Warrior']);
    }
    if (streak >= 30 && !badges.includes('Monthly Master')) {
      setBadges([...badges, 'Monthly Master']);
    }
  };

  // Update expense
  const updateExpense = (id, updatedData) => {
    setExpenses(expenses.map(exp => 
      exp.id === id ? { ...exp, ...updatedData } : exp
    ));
  };

  // Delete expense
  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(expenses.filter(exp => exp.id !== id));
    }
  };

  // Calculate budget alerts
  const getBudgetAlerts = () => {
    const categoryTotals = {};
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const now = new Date();
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    });

    const alerts = [];
    Object.entries(categoryTotals).forEach(([category, spent]) => {
      const budget = budgets[category];
      if (budget && spent > budget) {
        alerts.push({
          category,
          spent,
          budget,
          overBy: spent - budget
        });
      }
    });
    return alerts;
  };

  const budgetAlerts = getBudgetAlerts();
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  return (
    <div className={`min-h-screen ${theme} transition-colors duration-300`}>
      {/* Header */}
      <header className={`${cardBg} shadow-md sticky top-0 z-50 border-b ${borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-8 h-8 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Finote</h1>
              <p className="text-xs opacity-70">Keep Track. Stay Productive.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500 text-white rounded-full">
              <Zap className="w-4 h-4" />
              <span className="font-bold">{streak}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className={`${cardBg} border-b ${borderColor} sticky top-[73px] z-40`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-2">
            {[
              { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
              { id: 'expenses', icon: Wallet, label: 'Expenses' },
              { id: 'budget', icon: Target, label: 'Budget' },
              { id: 'goals', icon: Award, label: 'Goals' },
              { id: 'ai', icon: MessageSquare, label: 'AI Assistant' },
              { id: 'settings', icon: SettingsIcon, label: 'Settings' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                  currentView === item.id
                    ? 'bg-blue-500 text-white'
                    : `${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Budget Alerts */}
        {budgetAlerts.length > 0 && currentView === 'dashboard' && (
          <div className="mb-6">
            {budgetAlerts.map(alert => (
              <div key={alert.category} className={`${darkMode ? 'bg-red-900 border-red-700' : 'bg-red-100 border-red-500'} border-l-4 p-4 mb-2 rounded`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-500'}`} />
                  <p className={darkMode ? 'text-red-200' : 'text-red-700'}>
                    <strong>{alert.category}</strong> budget exceeded by {CURRENCY_SYMBOLS[currency]}{alert.overBy.toFixed(2)}!
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View Components */}
        {currentView === 'dashboard' && (
          <Dashboard 
            expenses={expenses}
            categories={CATEGORIES}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            badges={badges}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'expenses' && (
          <ExpensesList 
            expenses={expenses}
            categories={CATEGORIES}
            updateExpense={updateExpense}
            deleteExpense={deleteExpense}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'budget' && (
          <BudgetManager 
            expenses={expenses}
            categories={CATEGORIES}
            budgets={budgets}
            setBudgets={setBudgets}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'goals' && (
          <GoalsManager 
            goals={goals}
            setGoals={setGoals}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'ai' && (
          <AIAssistant 
            expenses={expenses}
            categories={CATEGORIES}
            currency={currency}
            currencySymbol={CURRENCY_SYMBOLS[currency]}
            darkMode={darkMode}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
        
        {currentView === 'settings' && (
          <Settings 
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            currency={currency}
            setCurrency={setCurrency}
            notifications={notifications}
            setNotifications={setNotifications}
            expenses={expenses}
            setExpenses={setExpenses}
            budgets={budgets}
            setBudgets={setBudgets}
            goals={goals}
            setGoals={setGoals}
            cardBg={cardBg}
            borderColor={borderColor}
          />
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddExpense(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all hover:scale-110 flex items-center justify-center z-50"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal 
          onClose={() => setShowAddExpense(false)}
          onAdd={addExpense}
          categories={CATEGORIES}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

export default App;

