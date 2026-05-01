import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, XCircle, Loader2, Search, Video, GitBranch, MessageSquare, CloudRain, Landmark } from 'lucide-react';

interface SiteResult {
  name: string;
  icon: string;
  fallbackIcon: React.ReactNode;
  url: string;
  latency: number | null;
  status: 'loading' | 'success' | 'failed';
}

const sites: SiteResult[] = [
  { name: 'Google', icon: '', fallbackIcon: <Search className="w-5 h-5" />, url: 'https://www.google.com' },
  { name: 'YouTube', icon: '', fallbackIcon: <Video className="w-5 h-5" />, url: 'https://www.youtube.com' },
  { name: 'GitHub', icon: '', fallbackIcon: <GitBranch className="w-5 h-5" />, url: 'https://github.com' },
  { name: 'ChatGPT', icon: '', fallbackIcon: <MessageSquare className="w-5 h-5" />, url: 'https://chatgpt.com' },
  { name: 'Cloudflare', icon: '', fallbackIcon: <CloudRain className="w-5 h-5" />, url: 'https://www.cloudflare.com' },
  { name: '百度', icon: '', fallbackIcon: <Landmark className="w-5 h-5" />, url: 'https://www.baidu.com' },
];

export default function ConnectivityTest() {
  const [results, setResults] = useState<SiteResult[]>(
    sites.map(s => ({ ...s, latency: null, status: 'loading' }))
  );

  useEffect(() => {
    testAll();
  }, []);

  const testAll = async () => {
    sites.forEach(async (site, index) => {
      const start = performance.now();
      try {
        // 使用 no-cors 模式探测连通性，不依赖响应内容
        await fetch(site.url, { mode: 'no-cors', cache: 'no-store' });
        const latency = Math.round(performance.now() - start);
        setResults(prev => {
          const next = [...prev];
          next[index] = { ...site, latency, status: 'success' };
          return next;
        });
      } catch {
        setResults(prev => {
          const next = [...prev];
          next[index] = { ...site, latency: null, status: 'failed' };
          return next;
        });
      }
    });
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-400';
    if (latency < 300) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="w-6 h-6 text-blue-400" />
        <h2 className="text-xl font-semibold text-white">网络连通性</h2>
        <span className="text-sm text-slate-400">通过加载网站图标测试连通性</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/50 rounded-xl p-4 flex flex-col items-center gap-3"
          >
              <div className="relative">
              <div className="w-10 h-10 rounded-lg bg-slate-800 p-2 flex items-center justify-center text-blue-400">
                {r.fallbackIcon}
              </div>
              {r.status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">{r.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1">
                {r.status === 'success' ? (
                  <>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    <span className={`text-xs font-mono ${r.latency ? getLatencyColor(r.latency) : ''}`}>
                      {r.latency}ms
                    </span>
                  </>
                ) : r.status === 'failed' ? (
                  <>
                    <XCircle className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">不可用</span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">测试中...</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={testAll}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          重新测试
        </button>
      </div>
    </div>
  );
}
