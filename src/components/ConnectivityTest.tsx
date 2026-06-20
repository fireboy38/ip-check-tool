import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, CheckCircle, XCircle, Loader2, Search, Video, GitBranch, MessageSquare, CloudRain, Landmark, ShoppingBag, MessageCircle, RefreshCw } from 'lucide-react';

interface Site {
  name: string;
  icon: string;
  fallbackIcon: React.ReactNode;
  url: string;
}

interface SiteResult extends Site {
  latency: number | null;
  status: 'loading' | 'success' | 'failed';
}

const sites: Site[] = [
  { name: 'Google',     icon: '', fallbackIcon: <Search className="w-5 h-5" />,        url: 'https://www.google.com' },
  { name: 'YouTube',    icon: '', fallbackIcon: <Video className="w-5 h-5" />,         url: 'https://www.youtube.com' },
  { name: 'GitHub',     icon: '', fallbackIcon: <GitBranch className="w-5 h-5" />,     url: 'https://github.com' },
  { name: 'ChatGPT',    icon: '', fallbackIcon: <MessageSquare className="w-5 h-5" />, url: 'https://chatgpt.com' },
  { name: 'Cloudflare', icon: '', fallbackIcon: <CloudRain className="w-5 h-5" />,     url: 'https://www.cloudflare.com' },
  { name: '百度',       icon: '', fallbackIcon: <Landmark className="w-5 h-5" />,       url: 'https://www.baidu.com' },
  { name: '淘宝',       icon: '', fallbackIcon: <ShoppingBag className="w-5 h-5" />,    url: 'https://www.taobao.com' },
  { name: '腾讯',       icon: '', fallbackIcon: <MessageCircle className="w-5 h-5" />,  url: 'https://www.qq.com' },
];

export default function ConnectivityTest() {
  const [results, setResults] = useState<SiteResult[]>(
    sites.map(s => ({ ...s, latency: null, status: 'loading' }))
  );

  useEffect(() => {
    testAll();
  }, []);

  const testAll = async () => {
    setResults(sites.map(s => ({ ...s, latency: null, status: 'loading' })));
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
    if (latency < 100) return 'text-[var(--accent-green)]';
    if (latency < 300) return 'text-[var(--accent-yellow)]';
    return 'text-[var(--accent-red)]';
  };

  const getLatencyBg = (status: SiteResult['status'], latency: number | null) => {
    if (status === 'loading') return 'from-slate-500/10 to-slate-500/5';
    if (status === 'failed') return 'from-red-500/15 to-red-500/5';
    if (latency && latency < 100) return 'from-emerald-500/15 to-emerald-500/5';
    if (latency && latency < 300) return 'from-amber-500/15 to-amber-500/5';
    return 'from-red-500/15 to-red-500/5';
  };

  const successCount = results.filter(r => r.status === 'success').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-glow-green">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-primary">网络连通性</h2>
            <p className="text-xs text-tertiary">通过加载网站图标测试连通性</p>
          </div>
        </div>

        {/* Mini stats */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg glass-panel border border-soft flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-green)]" />
            <span className="text-xs text-secondary">可用 <span className="font-semibold text-primary">{successCount}</span></span>
          </div>
          <div className="px-3 py-1.5 rounded-lg glass-panel border border-soft flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)]" />
            <span className="text-xs text-secondary">不可用 <span className="font-semibold text-primary">{failedCount}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {results.map((r, i) => (
          <motion.div
            key={r.name}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            className={`relative overflow-hidden rounded-2xl inner-card p-4 flex flex-col items-center gap-3 bg-gradient-to-br ${getLatencyBg(r.status, r.latency)}`}
          >
            <div className="relative">
              <div className="w-11 h-11 rounded-xl glass-panel border border-soft p-2.5 flex items-center justify-center text-[var(--accent-blue)]">
                {r.fallbackIcon}
              </div>
              {r.status === 'loading' && (
                <div className="absolute inset-0 flex items-center justify-center glass-panel rounded-xl">
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-blue)]" />
                </div>
              )}
              {r.status === 'success' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-green)] ring-2 ring-[var(--bg-app)] flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              )}
              {r.status === 'failed' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-red)] ring-2 ring-[var(--bg-app)] flex items-center justify-center">
                  <XCircle className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-primary">{r.name}</p>
              <div className="flex items-center justify-center gap-1 mt-1 h-4">
                {r.status === 'success' ? (
                  <>
                    <span className={`text-xs font-mono font-semibold ${r.latency ? getLatencyColor(r.latency) : ''}`}>
                      {r.latency}ms
                    </span>
                  </>
                ) : r.status === 'failed' ? (
                  <span className="text-xs text-[var(--accent-red)]">不可用</span>
                ) : (
                  <span className="text-xs text-tertiary">测试中...</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          onClick={testAll}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-soft hover:border-strong text-primary text-sm font-medium transition-all"
        >
          <RefreshCw className="w-4 h-4 text-[var(--accent-blue)]" />
          重新测试
        </button>
      </div>
    </div>
  );
}
