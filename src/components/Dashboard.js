import React, { useMemo } from 'react';
import { PieChart, Pie, LineChart, Line, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, Calendar, TrendingUp, Award, Target } from 'lucide-react';

const Dashboard = ({ expenses, categories, currency, currencySymbol, badges, goals = [], darkMode, cardBg, borderColor }) => {
  // Calculate totals
  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const thisMonthExpenses = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const now = new Date();
    return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
  });

  const monthlyTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  // Category breakdown
  const categoryData = useMemo(() => {
    const breakdown = {};
    expenses.forEach(exp => {
      breakdown[exp.category] = (breakdown[exp.category] || 0) + exp.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2)),
      color: categories.find(c => c.name === name)?.color || '#CCC'
    }));
  }, [expenses, categories]);

  // AI Prediction (simple moving average)
  const predictNextMonth = useMemo(() => {
    if (expenses.length < 5) return monthlyTotal * 1.05;
    const last30Days = expenses
      .filter(exp => new Date(exp.date) > new Date(Date.now() - 30 * 86400000))
      .reduce((sum, exp) => sum + exp.amount, 0);
    return last30Days * 1.1;
  }, [expenses, monthlyTotal]);

  // Monthly trend data
  const monthlyTrend = useMemo(() => {
    const monthlyData = {};
    expenses.forEach(exp => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + exp.amount;
    });

    return Object.entries(monthlyData)
      .sort()
      .slice(-6)
      .map(([month, amount]) => ({
        month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
        amount: parseFloat(amount.toFixed(2))
      }));
  }, [expenses]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Total Spent</p>
              <h3 className="text-3xl font-bold text-blue-500">
                {currencySymbol}{totalSpent.toFixed(2)}
              </h3>
              <p className="text-xs opacity-50 mt-1">All time</p>
            </div>
            <Wallet className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">This Month</p>
              <h3 className="text-3xl font-bold text-green-500">
                {currencySymbol}{monthlyTotal.toFixed(2)}
              </h3>
              <p className="text-xs opacity-50 mt-1">{thisMonthExpenses.length} transactions</p>
            </div>
            <Calendar className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70">Predicted Next Month</p>
              <h3 className="text-3xl font-bold text-purple-500">
                {currencySymbol}{predictNextMonth.toFixed(2)}
              </h3>
              <p className="text-xs opacity-50 mt-1">AI Forecast</p>
            </div>
            <TrendingUp className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="text-lg font-bold mb-4">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.name}: ${currencySymbol}${entry.value}`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${currencySymbol}${value}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 opacity-70">No expenses yet. Add your first expense!</p>
          )}
        </div>

        {/* Line Chart */}
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="text-lg font-bold mb-4">Monthly Trend</h3>
          {monthlyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#E5E7EB'} />
                <XAxis dataKey="month" stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <YAxis stroke={darkMode ? '#9CA3AF' : '#6B7280'} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
                    border: `1px solid ${darkMode ? '#374151' : '#E5E7EB'}`,
                    borderRadius: '8px'
                  }}
                  formatter={(value) => [`${currencySymbol}${value}`, 'Amount']}
                />
                <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center py-20 opacity-50">Not enough data for trends</p>
          )}
        </div>
      </div>

      {/* Savings Goals Section */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-500" />
          Savings Goals
        </h3>
        {goals.length > 0 ? (
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div key={index} className="p-4 rounded-lg border border-gray-300 flex justify-between items-center">
                <span>{goal.name}</span>
                <span className="font-semibold text-green-500">{currencySymbol}{goal.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="opacity-70 text-center py-8">No savings goals yet. Create your first goal!</p>
        )}
      </div>

      {/* Achievements */}
      {badges.length > 0 && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-500" />
            Your Achievements
          </h3>
          <div className="flex gap-3 flex-wrap">
            {badges.map(badge => (
              <div key={badge} className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full font-medium shadow-lg">
                🏆 {badge}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
