import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Activity } from 'lucide-react';

interface NodeResult {
  id: string;
  city: string;
  country: string;
  region: string;
  latency: number;
  packetLoss: number;
}

const REGIONS = [
  { key: 'all',  label: '全部' },
  { key: 'asia', label: '亚洲' },
  { key: 'na',   label: '北美' },
  { key: 'eu',   label: '欧洲' },
  { key: 'oc',   label: '大洋洲' },
];

const NODES: NodeResult[] = [
  { id: '1',  city: '北京',     country: 'CN', region: 'asia', latency: 8,   packetLoss: 0 },
  { id: '2',  city: '上海',     country: 'CN', region: 'asia', latency: 12,  packetLoss: 0 },
  { id: '3',  city: '东京',     country: 'JP', region: 'asia', latency: 52,  packetLoss: 0 },
  { id: '4',  city: '新加坡',   country: 'SG', region: 'asia', latency: 42,  packetLoss: 0 },
  { id: '5',  city: '香港',     country: 'HK', region: 'asia', latency: 35,  packetLoss: 0 },
  { id: '6',  city: '洛杉矶',   country: 'US', region: 'na',   latency: 165, packetLoss: 0 },
  { id: '7',  city: '纽约',     country: 'US', region: 'na',   latency: 218, packetLoss: 0 },
  { id: '8',  city: '伦敦',     country: 'UK', region: 'eu',   latency: 238, packetLoss: 0 },
  { id: '9',  city: '法兰克福', country: 'DE', region: 'eu',   latency: 245, packetLoss: 0 },
  { id: '10', city: '悉尼',     country: 'AU', region: 'oc',   latency: 132, packetLoss: 0 },
];

export default function GlobalLatency() {
  const [results, setResults] = useState<NodeResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setTimeout(() => {
      setResults(NODES);
      setLoading(false);
    }, 800);
  }, []);

  const filtered = filter === 'all' ? results : results.filter(r => r.region === filter);

  const getLatencyColor = (v: number) => {
    if (v < 50)  return 'text-[var(--accent-green)]';
    if (v < 100) return 'text-[var(--accent-yellow)]';
    if (v < 200) return 'text-[var(--accent-yellow)]';
    return 'text-[var(--accent-red)]';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-400 flex items-center justify-center shadow-glow-cyan">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">全球延迟测试</h2>
          <p className="text-tertiary text-xs">从主流节点测试延迟（模拟数据）</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {REGIONS.map(r => (
          <button
            key={r.key}
            onClick={() => setFilter(r.key)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              filter === r.key
                ? 'bg-gradient-brand text-white shadow-glow-blue'
                : 'inner-card text-secondary hover:text-primary'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center justify-between p-3 inner-card hover:border-strong transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Activity className="w-4 h-4 text-[var(--accent-cyan)] shrink-0" />
                <span className="font-medium text-primary">{node.city}</span>
                <span className="text-tertiary text-sm">{node.country}</span>
              </div>
              <div className="flex items-center gap-4 text-sm shrink-0">
                <span className={`font-mono font-medium ${getLatencyColor(node.latency)}`}>
                  {node.latency}ms
                </span>
                <span className="text-tertiary">丢包 {node.packetLoss}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
