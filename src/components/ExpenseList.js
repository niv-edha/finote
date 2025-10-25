import React, { useState } from 'react';
import { Edit2, Trash2, Save, X, Download } from 'lucide-react';

const ExpensesList = ({
  expenses,
  categories,
  updateExpense,
  deleteExpense,
  currency,
  currencySymbol,
  darkMode,
  cardBg,
  borderColor
}) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount', 'Tags', 'Mood'];
    const rows = expenses.map(exp => [
      exp.date,
      exp.category,
      `"${exp.description}"`,
      exp.amount,
      exp.tags?.join(';') || '',
      exp.mood || ''
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finote-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter and search
  const filteredExpenses = expenses.filter(exp => {
    const matchesFilter = filter === 'all' || exp.category === filter;
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSave = () => {
    updateExpense(editingExpense.id, editingExpense);
    setEditingExpense(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold">All Expenses ({expenses.length})</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${cardBg}`}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${borderColor} ${cardBg}`}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Expenses List */}
      {filteredExpenses.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl shadow-lg border ${borderColor} text-center`}>
          <p className="opacity-50">
            No expenses found.{' '}
            {searchTerm || filter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Add your first expense!'}
          </p>
        </div>
      ) : (
        filteredExpenses.map(expense => (
          <div
            key={expense.id}
            className={`${cardBg} p-4 rounded-lg shadow border ${borderColor} transition-all hover:shadow-lg`}
          >
            {editingExpense?.id === expense.id ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpense.amount}
                    onChange={(e) =>
                      setEditingExpense({
                        ...editingExpense,
                        amount: parseFloat(e.target.value)
                      })
                    }
                    className={`px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                    placeholder="Amount"
                  />
                  <select
                    value={editingExpense.category}
                    onChange={(e) =>
                      setEditingExpense({ ...editingExpense, category: e.target.value })
                    }
                    className={`px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                  >
                    {categories.map(cat => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, description: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                  placeholder="Description"
                />
                <input
                  type="date"
                  value={editingExpense.date}
                  onChange={(e) =>
                    setEditingExpense({ ...editingExpense, date: e.target.value })
                  }
                  className={`w-full px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => setEditingExpense(null)}
                    className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-3xl">
                    {categories.find(c => c.name === expense.category)?.icon || '📦'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">{expense.description}</h4>
                    <div className="flex items-center gap-2 text-sm opacity-70 flex-wrap">
                      <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                        {expense.category}
                      </span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                      {expense.tags?.length > 0 && (
                        <>
                          <span>•</span>
                          <span>🏷️ {expense.tags.join(', ')}</span>
                        </>
                      )}
                      {expense.mood && (
                        <>
                          <span>•</span>
                          <span>
                            {expense.mood === 'happy'
                              ? '😊'
                              : expense.mood === 'sad'
                              ? '😢'
                              : '😐'}
                          </span>
                        </>
                      )}
                      {expense.recurring && (
                        <>
                          <span>•</span>
                          <span className="bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded">
                            🔁 Recurring
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold">
                    {currencySymbol}
                    {expense.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setEditingExpense(expense)}
                    className={`p-2 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
                    }`}
                  >
                    <Edit2 className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => deleteExpense(expense.id)}
                    className={`p-2 rounded ${
                      darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default ExpensesList;
