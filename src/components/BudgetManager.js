import React, { useMemo } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

const BudgetManager = ({ expenses, categories, budgets, setBudgets, currency, currencySymbol, darkMode, cardBg, borderColor }) => {
  // Calculate spending per category for current month
  const categorySpending = useMemo(() => {
    const spending = {};
    const now = new Date();
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.date);
      if (expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear()) {
        spending[exp.category] = (spending[exp.category] || 0) + exp.amount;
      }
    });
    
    return spending;
  }, [expenses]);

  const updateBudget = (category, value) => {
    setBudgets({
      ...budgets,
      [category]: parseFloat(value) || 0
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Budget Management</h2>
        <div className="text-sm opacity-70">Current Month</div>
      </div>

      {/* Total Budget Overview */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm opacity-70">Total Budget</p>
            <p className="text-2xl font-bold text-blue-500">
              {currencySymbol}{Object.values(budgets).reduce((sum, val) => sum + val, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70">Total Spent</p>
            <p className="text-2xl font-bold text-purple-500">
              {currencySymbol}{Object.values(categorySpending).reduce((sum, val) => sum + val, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-70">Remaining</p>
            <p className={`text-2xl font-bold ${
              Object.values(budgets).reduce((sum, val) => sum + val, 0) - Object.values(categorySpending).reduce((sum, val) => sum + val, 0) >= 0
                ? 'text-green-500'
                : 'text-red-500'
            }`}>
              {currencySymbol}{(Object.values(budgets).reduce((sum, val) => sum + val, 0) - Object.values(categorySpending).reduce((sum, val) => sum + val, 0)).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Budgets */}
      {categories.map(cat => {
        const spent = categorySpending[cat.name] || 0;
        const budget = budgets[cat.name] || 0;
        const percentage = budget > 0 ? (spent / budget) * 100 : 0;
        const remaining = budget - spent;
        
        return (
          <div key={cat.name} className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon}</span>
                <div>
                  <h3 className="font-semibold text-lg">{cat.name}</h3>
                  <p className="text-sm opacity-70">
                    {percentage > 100 ? (
                      <span className="text-red-500 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" />
                        Over budget!
                      </span>
                    ) : percentage > 80 ? (
                      <span className="text-yellow-500">Warning: {(100 - percentage).toFixed(0)}% remaining</span>
                    ) : (
                      <span className="text-green-500 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        On track
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm opacity-70">Spent / Budget</p>
                  <p className="text-lg font-bold">
                    {currencySymbol}{spent.toFixed(2)} / {currencySymbol}{budget.toFixed(2)}
                  </p>
                  <p className={`text-sm ${remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {remaining >= 0 ? `${currencySymbol}${remaining.toFixed(2)} left` : `Over by ${currencySymbol}${Math.abs(remaining).toFixed(2)}`}
                  </p>
                </div>
                <input
                  type="number"
                  step="10"
                  value={budgets[cat.name] || 0}
                  onChange={(e) => updateBudget(cat.name, e.target.value)}
                  className={`w-28 px-3 py-2 rounded border ${borderColor} ${cardBg} text-center font-semibold`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all ${
                  percentage > 100 ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs opacity-70">
              <span>0%</span>
              <span>{percentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>
        );
      })}

      {/* Budget Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor} mt-6`}>
        <h3 className="text-lg font-bold mb-4">💡 Budget Tips</h3>
        <ul className="space-y-2 text-sm">
          <li>• Set realistic budgets based on your income and expenses</li>
          <li>• Review and adjust your budgets monthly</li>
          <li>• The 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
          <li>• Try to keep a buffer of 10-15% for unexpected expenses</li>
          <li>• Track recurring expenses separately for better planning</li>
        </ul>
      </div>
    </div>
  );
};

export default BudgetManager;