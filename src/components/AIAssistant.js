import React, { useState, useMemo } from 'react';
import { MessageSquare, Send, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

const AIAssistant = ({ expenses, categories, currency, currencySymbol, darkMode, cardBg, borderColor }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi! I'm your AI financial assistant. I can help you analyze your spending, give recommendations, and answer questions about your expenses. Try asking me something!",
    },
  ]);
  const [input, setInput] = useState('');

  // AI Insights
  const insights = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    });

    const lastMonth = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return expDate.getMonth() === lastMonthDate.getMonth() && expDate.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthTotal = thisMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const lastMonthTotal = lastMonth.reduce((sum, exp) => sum + exp.amount, 0);
    const percentChange = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    const categoryTotals = {};
    thisMonth.forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

    const avgDailySpend = thisMonth.length > 0 ? thisMonthTotal / now.getDate() : 0;
    const projectedMonthEnd = avgDailySpend * 30;

    return {
      thisMonthTotal,
      lastMonthTotal,
      percentChange,
      topCategory,
      avgDailySpend,
      projectedMonthEnd,
      transactionCount: thisMonth.length,
    };
  }, [expenses]);

  const generateAIResponse = (userInput) => {
    const lowerInput = userInput.toLowerCase();

    // Spending Summary
    if (lowerInput.includes('summary') || lowerInput.includes('how much') || lowerInput.includes('spent')) {
      return `This month, you've spent ${currencySymbol}${insights.thisMonthTotal.toFixed(2)} across ${insights.transactionCount} transactions. Your spending is ${insights.percentChange > 0
        ? `up ${insights.percentChange.toFixed(1)}%`
        : `down ${Math.abs(insights.percentChange).toFixed(1)}%`
      } compared to last month.`;
    }

    // Top Category
    if (lowerInput.includes('most') || lowerInput.includes('top') || lowerInput.includes('category')) {
      return insights.topCategory
        ? `Your highest spending category is ${insights.topCategory[0]} with ${currencySymbol}${insights.topCategory[1].toFixed(2)} spent this month.`
        : "You don't have any expenses recorded yet.";
    }

    // Predictions
    if (lowerInput.includes('predict') || lowerInput.includes('forecast') || lowerInput.includes('will i')) {
      return `Based on your current spending pattern (${currencySymbol}${insights.avgDailySpend.toFixed(2)}/day), you're projected to spend ${currencySymbol}${insights.projectedMonthEnd.toFixed(2)} by month end.`;
    }

    // Recommendations
    if (lowerInput.includes('recommend') || lowerInput.includes('advice') || lowerInput.includes('should')) {
      if (insights.percentChange > 20) {
        return `Your spending is up ${insights.percentChange.toFixed(1)}% from last month. Consider reviewing your ${insights.topCategory?.[0] || 'top spending'} category to identify areas where you can cut back.`;
      }
      return "You're doing great! Your spending is under control. Consider setting aside some savings for your financial goals.";
    }

    // Savings Advice
    if (lowerInput.includes('save') || lowerInput.includes('saving')) {
      const potentialSavings = insights.thisMonthTotal * 0.1;
      return `Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. If you could reduce spending by just 10%, you'd save ${currencySymbol}${potentialSavings.toFixed(2)} this month!`;
    }

    // Anomaly Detection
    if (lowerInput.includes('unusual') || lowerInput.includes('anomal') || lowerInput.includes('weird')) {
      const avgExpense = expenses.length > 0 ? expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length : 0;
      const largeExpenses = expenses.filter(exp => exp.amount > avgExpense * 2);
      if (largeExpenses.length > 0) {
        return `I found ${largeExpenses.length} transaction(s) significantly higher than your average. The largest was ${currencySymbol}${Math.max(...largeExpenses.map(e => e.amount)).toFixed(2)}. Review these to ensure they're expected.`;
      }
      return "I haven't detected any unusual spending patterns. Everything looks normal!";
    }

    // Default Help Message
    return "I can help you with:\n• Spending summaries\n• Category analysis\n• Predictions\n• Savings recommendations\n• Anomaly detection\n\nTry asking: 'How much have I spent?' or 'What's my top category?'";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', content: input };
    const aiResponse = { role: 'assistant', content: generateAIResponse(input) };
    setMessages([...messages, userMessage, aiResponse]);
    setInput('');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">🤖 AI Financial Assistant</h2>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className={`${cardBg} p-4 rounded-xl shadow border ${borderColor}`}>
          <div className="flex items-center gap-2 mb-2">
            {insights.percentChange > 0 ? (
              <TrendingUp className="w-5 h-5 text-red-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-green-500" />
            )}
            <h4 className="font-semibold">Monthly Trend</h4>
          </div>
          <p className={`text-2xl font-bold ${insights.percentChange > 0 ? 'text-red-500' : 'text-green-500'}`}>
            {insights.percentChange > 0 ? '+' : ''}{insights.percentChange.toFixed(1)}%
          </p>
          <p className="text-sm opacity-70">vs last month</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl shadow border ${borderColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-blue-500" />
            <h4 className="font-semibold">Daily Average</h4>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {currencySymbol}{insights.avgDailySpend.toFixed(2)}
          </p>
          <p className="text-sm opacity-70">per day this month</p>
        </div>

        <div className={`${cardBg} p-4 rounded-xl shadow border ${borderColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            <h4 className="font-semibold">Projected</h4>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {currencySymbol}{insights.projectedMonthEnd.toFixed(2)}
          </p>
          <p className="text-sm opacity-70">by month end</p>
        </div>
      </div>

      {/* Chat Interface */}
      <div className={`${cardBg} rounded-xl shadow-lg border ${borderColor} overflow-hidden`}>
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : darkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-100'
                }`}
              >
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && <MessageSquare className="w-5 h-5 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm whitespace-pre-line">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`p-4 border-t ${borderColor}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything about your finances..."
              className={`flex-1 px-4 py-3 rounded-lg border ${borderColor} ${cardBg}`}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Features Info */}
      <div className={`${cardBg} p-6 rounded-xl shadow-lg border ${borderColor}`}>
        <h3 className="text-lg font-bold mb-4">🧠 AI-Powered Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-semibold mb-2">✓ Auto-Categorization</h4>
            <p className="opacity-70">Expenses are automatically categorized based on merchant and description.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✓ Predictive Analytics</h4>
            <p className="opacity-70">Forecast your spending patterns and future expenses.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✓ Anomaly Detection</h4>
            <p className="opacity-70">Get alerts for unusual spending patterns.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✓ Smart Recommendations</h4>
            <p className="opacity-70">Personalized advice to optimize your budget.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✓ Trend Analysis</h4>
            <p className="opacity-70">Track spending trends over time.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">✓ Conversational AI</h4>
            <p className="opacity-70">Ask questions in natural language.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
