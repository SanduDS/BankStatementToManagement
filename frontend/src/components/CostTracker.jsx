import React from 'react';
import { DollarSign, Clock, Zap, TrendingUp, Info } from 'lucide-react';

const CostTracker = ({ costData }) => {
  if (!costData) {
    return null;
  }

  const {
    input_tokens = 0,
    output_tokens = 0,
    input_cost_usd = 0,
    output_cost_usd = 0,
    total_cost_usd = 0,
    chunks_processed = 1,
    timestamp
  } = costData;

  const formatCost = (cost) => {
    if (cost >= 0.01) {
      return `$${cost.toFixed(4)}`;
    } else {
      return `$${(cost * 1000).toFixed(2)}k`; // Show in thousandths
    }
  };

  const formatTokens = (tokens) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleString();
  };

  // Calculate efficiency metrics
  const totalTokens = input_tokens + output_tokens;
  const costPerToken = totalTokens > 0 ? (total_cost_usd / totalTokens) : 0;
  const avgTokensPerChunk = chunks_processed > 0 ? (totalTokens / chunks_processed) : 0;

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center mb-4">
        <div className="bg-green-100 p-2 rounded-lg mr-3">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">API Cost Analysis</h3>
          <p className="text-sm text-gray-600">Operational cost breakdown for this analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Total Cost */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Cost</p>
              <p className="text-2xl font-bold text-green-600">{formatCost(total_cost_usd)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tokens</p>
              <p className="text-2xl font-bold text-blue-600">{formatTokens(totalTokens)}</p>
            </div>
            <Zap className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        {/* Processing Time */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chunks Processed</p>
              <p className="text-2xl font-bold text-purple-600">{chunks_processed}</p>
            </div>
            <Clock className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        {/* Efficiency */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cost/Token</p>
              <p className="text-lg font-bold text-orange-600">${(costPerToken * 1000000).toFixed(2)}/M</p>
            </div>
            <Info className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input Costs */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-2">Input Processing</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Input Tokens:</span>
              <span className="text-sm font-medium">{formatTokens(input_tokens)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Input Cost:</span>
              <span className="text-sm font-medium text-green-600">{formatCost(input_cost_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rate:</span>
              <span className="text-sm font-medium">$3.00/M tokens</span>
            </div>
          </div>
        </div>

        {/* Output Costs */}
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <h4 className="font-semibold text-gray-900 mb-2">Output Generation</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Output Tokens:</span>
              <span className="text-sm font-medium">{formatTokens(output_tokens)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Output Cost:</span>
              <span className="text-sm font-medium text-green-600">{formatCost(output_cost_usd)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Rate:</span>
              <span className="text-sm font-medium">$15.00/M tokens</span>
            </div>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      {chunks_processed > 1 && (
        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Processing Efficiency</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Avg Tokens/Chunk:</span>
              <span className="ml-2 font-medium">{formatTokens(Math.round(avgTokensPerChunk))}</span>
            </div>
            <div>
              <span className="text-blue-700">Total Chunks:</span>
              <span className="ml-2 font-medium">{chunks_processed}</span>
            </div>
            <div>
              <span className="text-blue-700">Processing Method:</span>
              <span className="ml-2 font-medium">
                {chunks_processed > 1 ? 'Chunked' : 'Single Request'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timestamp */}
      {timestamp && (
        <div className="mt-4 text-xs text-gray-500 text-center">
          Analysis completed on {formatDate(timestamp)}
        </div>
      )}

      {/* Cost Optimization Tips */}
      <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
        <h4 className="font-semibold text-yellow-900 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Cost Optimization Tips
        </h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Smaller, cleaner bank statements reduce processing costs</li>
          <li>• PDF text extraction quality affects token usage</li>
          <li>• Large statements are automatically chunked for efficiency</li>
          <li>• Current rate: ~${(total_cost_usd * 100).toFixed(2)} cents per analysis</li>
        </ul>
      </div>
    </div>
  );
};

export default CostTracker;
