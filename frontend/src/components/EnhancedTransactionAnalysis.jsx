import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  BarChart3,
  PieChart as PieChartIcon,
  Target
} from 'lucide-react';
import CostTracker from './CostTracker';
import ErrorBoundary from './ErrorBoundary';

const TransactionAnalysis = ({ data }) => {
  const [showExpenseDetails, setShowExpenseDetails] = useState(false);
  const [showIncomeDetails, setShowIncomeDetails] = useState(false);
  const [chartType, setChartType] = useState('bar'); // bar, area, line
  const [analysisView, setAnalysisView] = useState('overview'); // overview, detailed, insights

  // Enhanced calculations with defensive checks (always run hooks first)
  const calculations = useMemo(() => {
    // Add defensive checks for data structure
    if (!data || !data.transactions) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netAmount: 0,
        savingsRate: 0,
        avgIncome: 0,
        avgExpense: 0,
        transactionCount: 0,
        daysAnalyzed: 0,
        dailyAverage: 0
      };
    }

    const income = data.transactions?.income || [];
    const expenses = data.transactions?.expenses || [];
    
    const totalIncome = income.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount || 0), 0);
    const netAmount = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netAmount / totalIncome) * 100) : 0;
    
    // Average transaction amounts
    const avgIncome = income.length > 0 ? totalIncome / income.length : 0;
    const avgExpense = expenses.length > 0 ? totalExpenses / expenses.length : 0;
    
    // Largest transactions
    const largestIncome = income.length > 0 ? Math.max(...income.map(t => t.amount || 0)) : 0;
    const largestExpense = expenses.length > 0 ? Math.max(...expenses.map(t => t.amount || 0)) : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      savingsRate,
      avgIncome,
      avgExpense,
      largestIncome,
      largestExpense,
      totalTransactions: income.length + expenses.length
    };
  }, [data]);

  // Early return for no data (after hooks)
  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <div className="text-center py-8">
          <div className="text-gray-500 mb-2">No analysis data available</div>
          <p className="text-sm text-gray-400">Please upload a bank statement to see the analysis.</p>
        </div>
      </div>
    );
  }

  // Early return for invalid data after hooks
  if (!data || !data.transactions) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>Error: Invalid data structure received</p>
          <p className="text-sm text-gray-500">Please try uploading the file again</p>
        </div>
      </div>
    );
  }

  // Process monthly data with enhanced metrics
  const processMonthlyData = () => {
    const monthlyData = {};
    
    // Process income
    (data.transactions?.income || []).forEach(transaction => {
      // Ensure transaction has valid data
      if (!transaction || !transaction.date || typeof transaction.amount !== 'number') {
        return;
      }
      
      const month = transaction.date.slice(2, 5);
      if (!monthlyData[month]) {
        monthlyData[month] = { 
          month, 
          income: 0, 
          expenses: 0, 
          incomeCount: 0, 
          expenseCount: 0,
          net: 0
        };
      }
      monthlyData[month].income += transaction.amount;
      monthlyData[month].incomeCount += 1;
    });

    // Process expenses
    (data.transactions?.expenses || []).forEach(transaction => {
      // Ensure transaction has valid data
      if (!transaction || !transaction.date || typeof transaction.amount !== 'number') {
        return;
      }
      
      const month = transaction.date.slice(2, 5);
      if (!monthlyData[month]) {
        monthlyData[month] = { 
          month, 
          income: 0, 
          expenses: 0, 
          incomeCount: 0, 
          expenseCount: 0,
          net: 0
        };
      }
      monthlyData[month].expenses += transaction.amount;
      monthlyData[month].expenseCount += 1;
    });

    // Calculate net for each month and ensure all values are valid numbers
    Object.values(monthlyData).forEach(month => {
      month.income = Number(month.income) || 0;
      month.expenses = Number(month.expenses) || 0;
      month.net = month.income - month.expenses;
      month.incomeCount = Number(month.incomeCount) || 0;
      month.expenseCount = Number(month.expenseCount) || 0;
    });

    const result = Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
    
    // Validate final data structure
    return result.filter(item => 
      item && 
      typeof item.month === 'string' && 
      typeof item.income === 'number' && 
      typeof item.expenses === 'number' &&
      !isNaN(item.income) && 
      !isNaN(item.expenses)
    );
  };

  // Enhanced category processing
  const processCategoryData = () => {
    const categories = {};
    
    (data.transactions?.expenses || []).forEach(transaction => {
      const description = transaction.description.toLowerCase();
      let category = 'Others';
      
      // Enhanced categorization
      if (description.includes('food') || description.includes('restaurant') || 
          description.includes('pizza') || description.includes('coffee') ||
          description.includes('dining') || description.includes('meal')) {
        category = 'Food & Dining';
      } else if (description.includes('fuel') || description.includes('gas') || 
                description.includes('taxi') || description.includes('uber') ||
                description.includes('transport') || description.includes('parking')) {
        category = 'Transportation';
      } else if (description.includes('utility') || description.includes('bill') ||
                description.includes('electric') || description.includes('water') ||
                description.includes('internet') || description.includes('phone')) {
        category = 'Utilities & Bills';
      } else if (description.includes('atm') || description.includes('withdrawal') ||
                description.includes('bank') || description.includes('fee')) {
        category = 'Banking & Finance';
      } else if (description.includes('shop') || description.includes('store') ||
                description.includes('market') || description.includes('purchase')) {
        category = 'Shopping';
      } else if (description.includes('medical') || description.includes('doctor') ||
                description.includes('hospital') || description.includes('pharmacy')) {
        category = 'Healthcare';
      } else if (description.includes('entertainment') || description.includes('movie') ||
                description.includes('game') || description.includes('ticket')) {
        category = 'Entertainment';
      }

      if (!categories[category]) {
        categories[category] = { amount: 0, count: 0, transactions: [] };
      }
      categories[category].amount += transaction.amount;
      categories[category].count += 1;
      categories[category].transactions.push(transaction);
    });

    return Object.entries(categories).map(([name, data]) => ({
      name,
      value: data.amount,
      count: data.count,
      percentage: calculations.totalExpenses > 0 ? (data.amount / calculations.totalExpenses * 100).toFixed(1) : '0.0',
      transactions: data.transactions
    })).sort((a, b) => b.value - a.value);
  };

  // Financial insights generation
  const generateInsights = () => {
    const insights = [];
    
    // Savings rate analysis
    if (calculations.savingsRate > 20) {
      insights.push({
        type: 'positive',
        title: 'Excellent Savings Rate',
        message: `You're saving ${calculations.savingsRate.toFixed(1)}% of your income. Great job!`,
        icon: CheckCircle
      });
    } else if (calculations.savingsRate > 10) {
      insights.push({
        type: 'neutral',
        title: 'Moderate Savings Rate',
        message: `You're saving ${calculations.savingsRate.toFixed(1)}% of your income. Consider increasing this to 20%+.`,
        icon: Info
      });
    } else if (calculations.savingsRate < 0) {
      insights.push({
        type: 'negative',
        title: 'Spending More Than Income',
        message: `You're spending ${Math.abs(calculations.savingsRate).toFixed(1)}% more than your income. This needs immediate attention.`,
        icon: AlertTriangle
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `You're only saving ${calculations.savingsRate.toFixed(1)}% of your income. Try to reach at least 10%.`,
        icon: AlertTriangle
      });
    }

    // Expense analysis
    const categoryData = processCategoryData();
    if (categoryData.length > 0) {
      const topCategory = categoryData[0];
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'warning',
          title: 'High Spending in One Category',
          message: `${topCategory.name} accounts for ${topCategory.percentage}% of your expenses. Consider diversifying your spending.`,
          icon: AlertTriangle
        });
      }
    }

    // Transaction frequency
    if (calculations.totalTransactions > 100) {
      insights.push({
        type: 'neutral',
        title: 'High Transaction Volume',
        message: `You have ${calculations.totalTransactions} transactions. Consider consolidating payments where possible.`,
        icon: Info
      });
    }

    return insights;
  };

  const monthlyData = processMonthlyData() || [];
  const categoryData = processCategoryData() || [];
  const insights = generateInsights();

  // Debug logging for development
  if (import.meta.env.DEV) {
    console.log('TransactionAnalysis Debug:', {
      hasData: !!data,
      hasTransactions: !!(data?.transactions),
      monthlyDataLength: monthlyData.length,
      categoryDataLength: categoryData.length,
      monthlyDataSample: monthlyData[0],
      categoryDataSample: categoryData[0]
    });
  }

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{`Month: ${label || 'Unknown'}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.dataKey || 'Unknown'}: ${(entry.value || 0).toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Safe chart component that validates data before rendering
  const SafeChart = ({ children, data, type = "chart" }) => {
    // Additional validation for chart data
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg mb-2">No {type} data available</div>
            <p className="text-sm">Insufficient transaction data to generate {type}.</p>
          </div>
        </div>
      );
    }

    // Validate each data item
    const validData = data.every(item => 
      item && 
      typeof item === 'object' && 
      Object.values(item).every(value => 
        value !== null && 
        value !== undefined && 
        (typeof value === 'string' || typeof value === 'number')
      )
    );

    if (!validData) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="text-center">
            <div className="text-lg mb-2">Invalid {type} data</div>
            <p className="text-sm">The data contains invalid values that cannot be charted.</p>
          </div>
        </div>
      );
    }

    return children;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Financial Analysis</h2>
        
        {/* View Controls */}
        <div className="flex space-x-2">
          <select
            value={analysisView}
            onChange={(e) => setAnalysisView(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="overview">Overview</option>
            <option value="detailed">Detailed</option>
            <option value="insights">Insights</option>
          </select>
          
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="bar">Bar Chart</option>
            <option value="area">Area Chart</option>
            <option value="line">Line Chart</option>
          </select>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Income</p>
              <p className="text-2xl font-bold text-blue-900">{calculations.totalIncome.toLocaleString()}</p>
              <p className="text-xs text-blue-600">{(data.transactions?.income || []).length} transactions</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">{calculations.totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-red-600">{(data.transactions?.expenses || []).length} transactions</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className={`${calculations.netAmount >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${calculations.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>Net Amount</p>
              <p className={`text-2xl font-bold ${calculations.netAmount >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {calculations.netAmount.toLocaleString()}
              </p>
              <p className={`text-xs ${calculations.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {calculations.netAmount >= 0 ? 'Surplus' : 'Deficit'}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${calculations.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Savings Rate</p>
              <p className="text-2xl font-bold text-purple-900">{calculations.savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-purple-600">
                {calculations.savingsRate >= 20 ? 'Excellent' : 
                 calculations.savingsRate >= 10 ? 'Good' : 
                 calculations.savingsRate >= 0 ? 'Low' : 'Negative'}
              </p>
            </div>
            <Target className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {analysisView === 'insights' && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Financial Insights</h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border ${
                  insight.type === 'positive' ? 'bg-green-50 border-green-200' :
                  insight.type === 'negative' ? 'bg-red-50 border-red-200' :
                  insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <insight.icon className={`h-5 w-5 mt-0.5 ${
                  insight.type === 'positive' ? 'text-green-600' :
                  insight.type === 'negative' ? 'text-red-600' :
                  insight.type === 'warning' ? 'text-yellow-600' :
                  'text-blue-600'
                }`} />
                <div>
                  <h4 className={`font-medium ${
                    insight.type === 'positive' ? 'text-green-900' :
                    insight.type === 'negative' ? 'text-red-900' :
                    insight.type === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>{insight.title}</h4>
                  <p className={`text-sm ${
                    insight.type === 'positive' ? 'text-green-700' :
                    insight.type === 'negative' ? 'text-red-700' :
                    insight.type === 'warning' ? 'text-yellow-700' :
                    'text-blue-700'
                  }`}>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Charts Section - Custom Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trends - Different Formats Based on Chart Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends ({chartType} view)</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {monthlyData && monthlyData.length > 0 ? (
              <>
                {chartType === 'bar' && (
                  <div className="space-y-3">
                    {monthlyData.map((month) => (
                      <div key={month.month} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold text-gray-900">{month.month}</h4>
                          <span className={`text-sm font-medium ${
                            month.net >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            Net: {month.net.toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-blue-600">
                            <div className="font-medium">Income</div>
                            <div className="text-lg">{month.income.toLocaleString()}</div>
                            <div className="text-xs">{month.incomeCount} transactions</div>
                          </div>
                          <div className="text-red-600">
                            <div className="font-medium">Expenses</div>
                            <div className="text-lg">{month.expenses.toLocaleString()}</div>
                            <div className="text-xs">{month.expenseCount} transactions</div>
                          </div>
                        </div>
                        {/* Bar chart style progress bars */}
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center text-xs">
                            <span className="w-16 text-blue-600">Income</span>
                            <div className="flex-1 bg-gray-200 rounded h-4 mx-2">
                              <div 
                                className="bg-blue-500 h-4 rounded transition-all duration-300"
                                style={{ width: `${Math.min(100, (month.income / Math.max(month.income, month.expenses)) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="w-20 text-right">{month.income.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <span className="w-16 text-red-600">Expenses</span>
                            <div className="flex-1 bg-gray-200 rounded h-4 mx-2">
                              <div 
                                className="bg-red-500 h-4 rounded transition-all duration-300"
                                style={{ width: `${Math.min(100, (month.expenses / Math.max(month.income, month.expenses)) * 100)}%` }}
                              ></div>
                            </div>
                            <span className="w-20 text-right">{month.expenses.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chartType === 'area' && (
                  <div className="space-y-4">
                    {monthlyData.map((month) => (
                      <div key={month.month} className="bg-white rounded-lg p-4 border border-gray-200 relative overflow-hidden">
                        {/* Area chart style background */}
                        <div className="absolute inset-0 opacity-10">
                          <div 
                            className="bg-gradient-to-r from-blue-400 to-blue-600 h-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (month.income / Math.max(...monthlyData.map(m => Math.max(m.income, m.expenses)))) * 100)}%` }}
                          ></div>
                        </div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-gray-900">{month.month}</h4>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                Net: {month.net.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {month.incomeCount + month.expenseCount} transactions
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-600 font-medium">
                              ↗ {month.income.toLocaleString()}
                            </span>
                            <span className="text-red-600 font-medium">
                              ↘ {month.expenses.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chartType === 'line' && (
                  <div className="bg-white rounded-lg p-4">
                    {/* Line chart style - trend visualization */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-sm font-medium text-gray-600">Month</span>
                        <span className="text-sm font-medium text-gray-600">Income</span>
                        <span className="text-sm font-medium text-gray-600">Expenses</span>
                        <span className="text-sm font-medium text-gray-600">Trend</span>
                      </div>
                      {monthlyData.map((month) => (
                        <div key={month.month} className="flex justify-between items-center py-2 border-b border-gray-100">
                          <span className="font-medium text-gray-900">{month.month}</span>
                          <span className="text-blue-600">{month.income.toLocaleString()}</span>
                          <span className="text-red-600">{month.expenses.toLocaleString()}</span>
                          <div className="flex items-center">
                            {month.net >= 0 ? (
                              <span className="text-green-600 text-lg">📈</span>
                            ) : (
                              <span className="text-red-600 text-lg">📉</span>
                            )}
                            <span className={`ml-1 text-xs ${month.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {month.net >= 0 ? '+' : ''}{month.net.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Trend summary */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <strong>Trend Analysis:</strong> 
                        {monthlyData.filter(m => m.net >= 0).length > monthlyData.length / 2 
                          ? " Positive trend - More surplus months" 
                          : " Mixed trend - Consider expense optimization"}
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-lg mb-2">No monthly data available</div>
                <p className="text-sm">Insufficient transaction data to generate monthly trends.</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown - Different Formats Based on Chart Type */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Expense Categories ({chartType} view)</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {categoryData && categoryData.length > 0 ? (
              <>
                {chartType === 'bar' && (
                  <div className="space-y-2">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="bg-white rounded-lg p-3 border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            ></div>
                            <span className="font-medium text-gray-900">{category.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-600">{category.percentage}%</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                          <span>{category.value.toLocaleString()}</span>
                          <span>{category.count} transactions</span>
                        </div>
                        {/* Bar style progress bar */}
                        <div className="w-full bg-gray-200 rounded h-3">
                          <div 
                            className="h-3 rounded transition-all duration-300"
                            style={{ 
                              backgroundColor: COLORS[index % COLORS.length],
                              width: `${category.percentage}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chartType === 'area' && (
                  <div className="space-y-3">
                    {categoryData.map((category, index) => (
                      <div key={category.name} className="bg-white rounded-lg p-4 border border-gray-200 relative overflow-hidden">
                        {/* Area style background gradient */}
                        <div 
                          className="absolute inset-0 opacity-5"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded mr-2" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              ></div>
                              <span className="font-medium text-gray-900">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">{category.percentage}%</div>
                              <div className="text-xs text-gray-500">{category.count} transactions</div>
                            </div>
                          </div>
                          <div className="text-lg font-semibold" style={{ color: COLORS[index % COLORS.length] }}>
                            {category.value.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {chartType === 'line' && (
                  <div className="bg-white rounded-lg p-4">
                    {/* Line/pie style - circular indicators */}
                    <div className="space-y-3">
                      {categoryData.map((category, index) => (
                        <div key={category.name} className="flex items-center justify-between p-2 border-b border-gray-100">
                          <div className="flex items-center flex-1">
                            <div className="relative mr-3">
                              <div className="w-8 h-8 rounded-full border-4 border-gray-200">
                                <div 
                                  className="w-8 h-8 rounded-full border-4 absolute top-0 left-0 transform -rotate-90"
                                  style={{ 
                                    borderColor: COLORS[index % COLORS.length],
                                    borderTopColor: 'transparent',
                                    borderRightColor: parseFloat(category.percentage) > 75 ? COLORS[index % COLORS.length] : 'transparent',
                                    borderBottomColor: parseFloat(category.percentage) > 50 ? COLORS[index % COLORS.length] : 'transparent',
                                    borderLeftColor: parseFloat(category.percentage) > 25 ? COLORS[index % COLORS.length] : 'transparent'
                                  }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{category.name}</div>
                              <div className="text-sm text-gray-500">{category.count} transactions</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">{category.value.toLocaleString()}</div>
                            <div className="text-sm" style={{ color: COLORS[index % COLORS.length] }}>
                              {category.percentage}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <div className="text-lg mb-2">No category data available</div>
                <p className="text-sm">Insufficient expense data to generate category breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Analysis Tables */}
      {analysisView === 'detailed' && (
        <div className="mt-8 space-y-6">
          {/* Category Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg per Transaction</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryData.map((category, index) => (
                    <tr key={category.name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.value.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.percentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(category.value / category.count).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monthly Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Summary</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Savings Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {monthlyData.map((month) => (
                    <tr key={month.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {month.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {month.income.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {month.expenses.toLocaleString()}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        month.net >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {month.net.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {month.income > 0 ? ((month.net / month.income) * 100).toFixed(1) : '0.0'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Lists */}
      <div className="mt-8 space-y-6">
        {/* Income Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Income Transactions ({(data.transactions?.income || []).length})
            </h3>
            <button
              onClick={() => setShowIncomeDetails(!showIncomeDetails)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
            >
              {showIncomeDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showIncomeDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
          
          {showIncomeDetails && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {(data.transactions?.income || []).slice(0, 20).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                    <div className="text-green-600 font-semibold">
                      +{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                {(data.transactions?.income || []).length > 20 && (
                  <div className="text-center text-gray-500 text-sm mt-4">
                    ... and {(data.transactions?.income || []).length - 20} more transactions
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Expense Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Expense Transactions ({(data.transactions?.expenses || []).length})
            </h3>
            <button
              onClick={() => setShowExpenseDetails(!showExpenseDetails)}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-red-50 text-red-700 rounded-md hover:bg-red-100"
            >
              {showExpenseDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showExpenseDetails ? 'Hide' : 'Show'} Details</span>
            </button>
          </div>
          
          {showExpenseDetails && (
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {(data.transactions?.expenses || []).slice(0, 20).map((transaction, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded border border-gray-200">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.description}</div>
                      <div className="text-sm text-gray-500">{transaction.date}</div>
                    </div>
                    <div className="text-red-600 font-semibold">
                      -{transaction.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
                {(data.transactions?.expenses || []).length > 20 && (
                  <div className="text-center text-gray-500 text-sm mt-4">
                    ... and {(data.transactions?.expenses || []).length - 20} more transactions
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* API Cost Tracking */}
      {data.api_cost && (
        <div className="mt-8">
          <CostTracker costData={data.api_cost} />
        </div>
      )}
    </div>
  );
};

export default TransactionAnalysis;
