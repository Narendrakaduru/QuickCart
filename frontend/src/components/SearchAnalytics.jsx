import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSearchAnalytics } from '../slices/analyticsSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Search,
  Activity,
  Zap,
  Slash,
  Clock,
  RefreshCw,
} from 'lucide-react';

const SearchAnalytics = () => {
  const dispatch = useDispatch();
  const { searchAnalytics, isLoading, isError, message } = useSelector((state) => state.analytics);
  const [days, setDays] = useState(7);

  // Render content based on state

  useEffect(() => {
    dispatch(fetchSearchAnalytics(days));
  }, [dispatch, days]);

  if (isLoading && !searchAnalytics) {
    return (
      <div className="flex items-center justify-center p-20">
        <RefreshCw className="animate-spin text-blue-600 mr-2" size={32} />
        <span className="text-xl font-medium text-gray-600">Loading Analytics...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <Activity className="text-red-500 mx-auto mb-4" size={48} />
        <h3 className="text-lg font-bold text-red-800 mb-2">Failed to Load Analytics</h3>
        <p className="text-red-600 mb-6">{message || 'An unexpected error occurred while fetching search insights.'}</p>
        <button 
          onClick={() => dispatch(fetchSearchAnalytics(days))}
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold transition shadow-sm"
        >
          Try Again
        </button>
      </div>
    );
  }



  if (!searchAnalytics && !isLoading) return null;

  const { summary, topKeywords, trend, zeroKeywords } = searchAnalytics;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Search Discovery Insights</h2>
          <p className="text-sm text-gray-500">Real-time search behavior and performance metrics</p>
        </div>
        <div className="flex bg-white rounded-lg shadow-sm border p-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${
                days === d ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Last {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-blue-50 p-3 rounded-lg mr-4">
            <Search className="text-blue-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Searches</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.totalSearches}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-red-50 p-3 rounded-lg mr-4">
            <Slash className="text-red-500" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">No Results Rate</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.zeroResultsRate}%</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-teal-50 p-3 rounded-lg mr-4">
            <Clock className="text-teal-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Avg Latency</p>
            <h3 className="text-2xl font-bold text-gray-800">{summary.avgLatency}ms</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="bg-purple-50 p-3 rounded-lg mr-4">
            <Zap className="text-purple-600" size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Conversion Impact</p>
            <h3 className="text-2xl font-bold text-gray-800">High</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold text-gray-700 mb-6 flex items-center uppercase tracking-wide">
            <Activity size={18} className="mr-2 text-blue-600" /> Search Volume Trend
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12} 
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  fontSize={12} 
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Keywords Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-md font-bold text-gray-700 mb-6 flex items-center uppercase tracking-wide">
            <Zap size={18} className="mr-2 text-yellow-500" /> Top Search Terms
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topKeywords} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="keyword" 
                  type="category" 
                  fontSize={12} 
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                   cursor={{fill: '#f8fafc'}}
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#2563eb" 
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Missing Items (Zero Results) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex items-center">
          <Slash size={18} className="mr-2 text-red-500" />
          <h3 className="text-md font-bold text-gray-700 uppercase tracking-wide">Zero-Result Queries (Missed Opportunities)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-4">Search Keyword</th>
                <th className="p-4 text-center">Frequency</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {zeroKeywords.length > 0 ? zeroKeywords.map((item, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50/50 transition">
                  <td className="p-4 text-sm font-medium text-gray-800">{item.keyword}</td>
                  <td className="p-4 text-sm text-center font-bold text-gray-600">{item.count}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-600 uppercase">
                      Stock Gap
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan="3" className="p-8 text-center text-gray-400">No zero-result searches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;
