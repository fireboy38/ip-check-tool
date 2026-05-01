import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity, Clock, AlertCircle } from 'lucide-react';

interface NodeResult {
  id: string;
  city: string;
  country: string;
  region: string;
  minLatency: number;
  maxLatency: number;
  avgLatency: number;
  packetLoss: number;
  status: 'success' | 'timeout' | 'error';
}

const NODES: NodeResult[] = [
  { id: '1', city: '北京', country: 'CN', region: '亚洲', minLatency: 5, maxLatency: 12, avgLatency: 8, packetLoss: 0, status: 'success' },
  { id: '2', city: '上海', country: 'CN', region: '亚洲', minLatency: 8, maxLatency: 15, avgLatency: 11, packetLoss: 0, status: 'success' },
  { id: '3', city: '广州', country: 'CN', region: '亚洲', minLatency: 12, maxLatency: 20, avgLatency: 15, packetLoss: 0, status: 'success' },
  { id: '4', city: '东京', country: 'JP', region: '亚洲', minLatency: 45, maxLatency: 65, avgLatency: 52, packetLoss: 0, status: 'success' },
  { id: '5', city: '新加坡', country: 'SG', region: '亚洲', minLatency: 35, maxLatency: 55, avgLatency: 42, packetLoss: 0, status: 'success' },
  { id: '6', city: '香港', country: 'HK', region: '亚洲', minLatency: 15, maxLatency: 25, avgLatency: 18, packetLoss: 0, status: 'success' },
  { id: '7', city: '首尔', country: 'KR', region: '亚洲', minLatency: 40, maxLatency: 60, avgLatency: 48, packetLoss: 0, status: 'success' },
  { id: '8', city: '洛杉矶', country: 'US', region: '北美', minLatency: 150, maxLatency: 180, avgLatency: 165, packetLoss: 0, status: 'success' },
  { id: '9', city: '纽约', country: 'US', region: '北美', minLatency: 200, maxLatency: 240, avgLatency: 218, packetLoss: 0, status: 'success' },
  { id: '10', city: '伦敦', country: 'UK', region: '欧洲', minLatency: 220, maxLatency: 260, avgLatency: 238, packetLoss: 0, status: 'success' },
  { id: '11', city: '法兰克福', country: 'DE', region: '欧洲', minLatency: 210, maxLatency: 250, avgLatency: 228, packetLoss: 0, status: 'success' },
  { id: '12', city: '悉尼', country: 'AU', region: '大洋洲', minLatency: 120, maxLatency: 150, avgLatency: 132, packetLoss: 0, status: 'success' },
];

export function LatencyMap() {
  const [results, setResults] = useState<NodeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'asia' | 'na' | 'eu' | 'oc'>('all');

  useEffect(() => {
    setTimeout(() => {
      setResults(NODES);
      setLoading(false);
    }, 1500);
  }, []);

  const filteredResults = filter === 'all' 
    ? results 
    : results.filter(r => {
        if (filter === 'asia') return r.region === '亚洲';
        if (filter === 'na') return r.region === '北美';
        if (filter === 'eu') return r.region === '欧洲';
        if (filter === 'oc') return r.region === '大洋洲';
        return true;
      });

  const getLatencyColor = (latency: number) => {
    if (latency < 50) return 'text-green-500';
    if (latency < 100) return 'text-yellow-500';
    if (latency < 200) return 'text-orange-500';
    return 'text-red-500';
  };

  const getLatencyBg = (latency: number) => {
    if (latency < 50) return 'bg-green-500/20';
    if (latency < 100) return 'bg-yellow-500/20';
    if (latency < 200) return 'bg-orange-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-8 h-8 text-cyan-400" />
            <h1 className="text-3xl font-bold">全球延迟测试</h1>
          </div>
          <p className="text-slate-400">测试全球各节点的网络延迟和丢包率</p>
        </motion.div>

        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: '全部' },
            { key: 'asia', label: '亚洲' },
            { key: 'na', label: '北美' },
            { key: 'eu', label: '欧洲' },
            { key: 'oc', label: '大洋洲' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-slate-400">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span>正在测试全球节点...</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
              <div className="grid grid-cols-12 gap-4 text-sm text-slate-400 font-medium">
                <div className="col-span-2">节点</div>
                <div className="col-span-2">地区</div>
                <div className="col-span-2 text-center">最小延迟</div>
                <div className="col-span-2 text-center">最大延迟</div>
                <div className="col-span-2 text-center">平均延迟</div>
                <div className="col-span-2 text-center">丢包率</div>
              </div>
            </div>

            {filteredResults.map((node, index) => (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/30 hover:bg-slate-800/50 transition-colors"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span className="font-medium">{node.city}</span>
                  </div>
                  <div className="col-span-2 text-slate-400 text-sm">
                    {node.region}
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-mono font-medium ${getLatencyColor(node.minLatency)}`}>
                      {node.minLatency}ms
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`font-mono font-medium ${getLatencyColor(node.maxLatency)}`}>
                      {node.maxLatency}ms
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-mono font-medium ${getLatencyBg(node.avgLatency)} ${getLatencyColor(node.avgLatency)}`}>
                      <Clock className="w-3 h-3" />
                      {node.avgLatency}ms
                    </span>
                  </div>
                  <div className="col-span-2 text-center">
                    {node.packetLoss === 0 ? (
                      <span className="text-green-500 text-sm">0%</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1 text-red-500 text-sm">
                        <AlertCircle className="w-3 h-3" />
                        {node.packetLoss}%
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-4 gap-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-green-400 mb-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm font-medium">优秀</span>
            </div>
            <p className="text-slate-400 text-xs">&lt; 50ms</p>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-yellow-400 mb-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm font-medium">良好</span>
            </div>
            <p className="text-slate-400 text-xs">50-100ms</p>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm font-medium">一般</span>
            </div>
            <p className="text-slate-400 text-xs">100-200ms</p>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium">较差</span>
            </div>
            <p className="text-slate-400 text-xs">&gt; 200ms</p>
          </div>
        </div>
      </div>
    </div>
  );
}
