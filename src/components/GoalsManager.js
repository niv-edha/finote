import React, { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp } from 'lucide-react';

const GoalsManager = ({ goals, setGoals, currency, currencySymbol, darkMode, cardBg, borderColor }) => {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: 0, deadline: '' });

  const addGoal = () => {
    if (!newGoal.name || !newGoal.target) {
      alert('Please enter goal name and target amount');
      return;
    }

    setGoals([...goals, {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: 0,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString()
    }]);

    setNewGoal({ name: '', target: '', current: 0, deadline: '' });
    setShowAddGoal(false);
  };

  const updateGoalProgress = (id, amount) => {
    setGoals(goals.map(goal => 
      goal.id === id ? { ...goal, current: parseFloat(amount) || 0 } : goal
    ));
  };

  const deleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      setGoals(goals.filter(goal => goal.id !== id));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Savings Goals</h2>
        <button
          onClick={() => setShowAddGoal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </button>
      </div>

      {/* Add Goal Form */}
      {showAddGoal && (
        <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
          <h3 className="font-semibold mb-4">Create New Goal</h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Goal name (e.g., Emergency Fund)"
              value={newGoal.name}
              onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            />
            <input
              type="number"
              step="0.01"
              placeholder="Target amount"
              value={newGoal.target}
              onChange={(e) => setNewGoal({...newGoal, target: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            />
            <input
              type="date"
              placeholder="Deadline (optional)"
              value={newGoal.deadline}
              onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})}
              className={`w-full px-4 py-2 rounded border ${borderColor} ${cardBg}`}
            />
            <div className="flex gap-2">
              <button
                onClick={addGoal}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Create Goal
              </button>
              <button
                onClick={() => setShowAddGoal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className={`${cardBg} p-12 rounded-xl shadow-lg border ${borderColor} text-center`}>
          <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="opacity-50 mb-4">No savings goals yet. Create your first goal to start saving!</p>
          <button
            onClick={() => setShowAddGoal(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        goals.map(goal => {
          const percentage = (goal.current / goal.target) * 100;
          const remaining = goal.target - goal.current;
          const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null;
          
          return (
            <div key={goal.id} className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    <h3 className="font-semibold text-lg">{goal.name}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm opacity-70">
                    <span>Target: {currencySymbol}{goal.target.toFixed(2)}</span>
                    {goal.deadline && (
                      <>
                        <span>•</span>
                        <span className={daysLeft < 30 ? 'text-orange-500' : ''}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className={`p-2 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-red-100'}`}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-blue-500">
                    {currencySymbol}{goal.current.toFixed(2)}
                  </span>
                  <span className="text-sm opacity-70">
                    {currencySymbol}{remaining.toFixed(2)} to go
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className={`h-6 rounded-full transition-all flex items-center justify-end pr-2 ${
                      percentage >= 100 ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  >
                    {percentage >= 10 && (
                      <span className="text-xs font-bold text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={goal.current}
                  onChange={(e) => updateGoalProgress(goal.id, e.target.value)}
                  className={`flex-1 px-3 py-2 rounded border ${borderColor} ${cardBg}`}
                  placeholder="Update progress"
                />
                <button
                  onClick={() => updateGoalProgress(goal.id, goal.current + 100)}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  +100
                </button>
              </div>

              {percentage >= 100 && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900 rounded-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-green-800 dark:text-green-200 font-semibold">
                    🎉 Goal Achieved! Congratulations!
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* Savings Tips */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">💰 Savings Tips</h3>
        <ul className="space-y-2 text-sm">
          <li>• Set specific, measurable, and time-bound goals</li>
          <li>• Automate your savings by setting up recurring transfers</li>
          <li>• Start with small, achievable goals to build momentum</li>
          <li>• Track your progress weekly to stay motivated</li>
          <li>• Celebrate milestones along the way!</li>
        </ul>
      </div>
    </div>
  );
};

export default GoalsManager;