import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, RefreshCw, Globe } from 'lucide-react';

interface DNSResult {
  id: string;
  name: string;
  ip: string;
  region: string;
  status: 'safe' | 'leak' | 'checking';
}

const DNS_SERVERS = [
  { id: '1', name: '检测①' },
  { id: '2', name: '检测②' },
  { id: '3', name: '检测③' },
  { id: '4', name: '检测④' },
];

export default function DNSPage() {
  const [results, setResults] = useState<DNSResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLeak, setHasLeak] = useState(false);

  useEffect(() => {
    testDNS();
  }, []);

  const testDNS = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));

    const mockResults: DNSResult[] = [
      { id: '1', name: '检测①', ip: '117.68.17.140', region: 'China', status: 'leak' },
      { id: '2', name: '检测②', ip: '61.190.114.200', region: 'China', status: 'leak' },
      { id: '3', name: '检测③', ip: '101.226.232.24', region: 'China', status: 'leak' },
      { id: '4', name: '检测④', ip: '101.91.44.208', region: 'China', status: 'leak' },
    ];

    setResults(mockResults);
    setHasLeak(true);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">DNS泄漏测试</h1>
          <p className="text-slate-400 text-sm">检测DNS是否存在泄露风险</p>
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-slate-400">
            DNS泄露是指使用VPN/代理后，域名解析仍通过当地运营商进行，存在隐私风险。
          </p>
          <button
            onClick={testDNS}
            disabled={loading}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-slate-300 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <>
            <div className={`p-4 rounded-xl mb-6 ${hasLeak ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}`}>
              <div className="flex items-center gap-2">
                {hasLeak ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                )}
                <span className={`font-semibold ${hasLeak ? 'text-red-400' : 'text-green-400'}`}>
                  {hasLeak ? '检测到DNS泄露风险' : '未检测到DNS泄露'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {results.map((dns) => (
                <motion.div
                  key={dns.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-300">{dns.name}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dns.status === 'safe'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {dns.status === 'safe' ? '安全' : '风险'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">DNS出口:</span>
                      <code className="text-blue-400 font-mono">{dns.ip}</code>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">出口地区:</span>
                      <span className="text-slate-300">{dns.region}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
