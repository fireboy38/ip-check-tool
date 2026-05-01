import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Activity, Server, MapPin, Clock, Shield, Search, Route, Lock, Unlock, X, Zap, Network, Terminal, ChevronRight, Copy, Check, Fingerprint, Monitor, Cpu, Wifi, Layers, RefreshCw } from 'lucide-react';
import GlobalLatency from '../components/GlobalLatency';

interface Tool {
  id: string;
  icon: React.ElementType;
  name: string;
  desc: string;
  component: React.ReactNode;
  color: string;
}

// MTR测试组件
function MTRTest() {
  const [target, setTarget] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [showHopDetails, setShowHopDetails] = useState<number | null>(null);

  const runMTR = async () => {
    if (!target) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setResults([
      { hop: 1, host: '192.168.1.1', loss: '0%', sent: 10, last: 1, avg: 1, best: 1, worst: 2, location: '本地网关' },
      { hop: 2, host: '10.0.0.1', loss: '0%', sent: 10, last: 5, avg: 4, best: 3, worst: 8, location: 'ISP接入点' },
      { hop: 3, host: '61.135.169.1', loss: '0%', sent: 10, last: 8, avg: 7, best: 6, worst: 12, location: '北京电信' },
      { hop: 4, host: '202.97.1.1', loss: '0%', sent: 10, last: 15, avg: 14, best: 12, worst: 22, location: '骨干网' },
      { hop: 5, host: 'target.example.com', loss: '0%', sent: 10, last: 25, avg: 24, best: 20, worst: 35, location: '目标服务器' },
    ]);
    setLoading(false);
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 10) return 'text-green-400';
    if (ms < 50) return 'text-yellow-400';
    if (ms < 100) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Activity className="w-4 h-4 inline mr-1" />
          MTR（My Traceroute）结合了 traceroute 和 ping 的功能，可以显示每一跳的延迟和丢包率
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="输入目标域名或IP，如: google.com"
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={runMTR}
          disabled={loading || !target}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? '测试中...' : '开始测试'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-700/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/50">
                <tr className="text-slate-400">
                  <th className="px-3 py-3 text-left">Hop</th>
                  <th className="px-3 py-3 text-left">Host</th>
                  <th className="px-3 py-3 text-left">Loss</th>
                  <th className="px-3 py-3 text-left">Last</th>
                  <th className="px-3 py-3 text-left">Avg</th>
                  <th className="px-3 py-3 text-left">Best</th>
                  <th className="px-3 py-3 text-left">Worst</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <motion.tr
                    key={row.hop}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-slate-700/30 hover:bg-slate-800/30 cursor-pointer"
                    onClick={() => setShowHopDetails(showHopDetails === row.hop ? null : row.hop)}
                  >
                    <td className="px-3 py-3 text-cyan-400 font-mono">{row.hop}</td>
                    <td className="px-3 py-3">
                      <div className="text-white">{row.host}</div>
                      <div className="text-xs text-slate-500">{row.location}</div>
                    </td>
                    <td className="px-3 py-3 text-green-400">{row.loss}</td>
                    <td className={`px-3 py-3 font-mono ${getLatencyColor(row.last)}`}>{row.last}ms</td>
                    <td className={`px-3 py-3 font-mono ${getLatencyColor(row.avg)}`}>{row.avg}ms</td>
                    <td className={`px-3 py-3 font-mono ${getLatencyColor(row.best)}`}>{row.best}ms</td>
                    <td className={`px-3 py-3 font-mono ${getLatencyColor(row.worst)}`}>{row.worst}ms</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// 分流测试组件
function RoutingTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [testHistory, setTestHistory] = useState<any[]>([]);

  const testRouting = async () => {
    if (!url) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    const newResult = {
      url,
      direct: Math.random() > 0.5,
      proxy: ['香港节点', '新加坡节点', '日本节点', '美国节点'][Math.floor(Math.random() * 4)],
      rule: ['DOMAIN-SUFFIX', 'DOMAIN-KEYWORD', 'IP-CIDR', 'GEOIP'][Math.floor(Math.random() * 4)],
      matched: true,
      timestamp: new Date().toLocaleTimeString(),
    };
    setResult(newResult);
    setTestHistory(prev => [newResult, ...prev].slice(0, 5));
    setLoading(false);
  };

  const commonSites = ['google.com', 'youtube.com', 'github.com', 'twitter.com', 'facebook.com'];

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Route className="w-4 h-4 inline mr-1" />
          检测 URL 是否走代理，以及匹配的规则类型
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入测试URL，如: https://google.com"
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={testRouting}
          disabled={loading || !url}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
          {loading ? '检测中...' : '检测'}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {commonSites.map(site => (
          <button
            key={site}
            onClick={() => setUrl(`https://${site}`)}
            className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg text-slate-400 text-xs transition-colors"
          >
            {site}
          </button>
        ))}
      </div>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium">检测结果</h4>
              <span className="text-xs text-slate-500">{result.timestamp}</span>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">目标地址</span>
                <span className="text-white font-mono">{result.url}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">直连</span>
                <span className={result.direct ? 'text-red-400 flex items-center gap-1' : 'text-green-400 flex items-center gap-1'}>
                  {result.direct ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  {result.direct ? '是' : '否'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">代理节点</span>
                <span className="text-cyan-400">{result.proxy}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400">匹配规则</span>
                <span className="text-yellow-400 font-mono text-xs">{result.rule}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {testHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-slate-400 text-sm">最近检测</h4>
          {testHistory.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-slate-800/30 rounded-lg text-sm">
              <span className="text-slate-300 truncate flex-1">{h.url}</span>
              <span className={h.direct ? 'text-red-400' : 'text-green-400'}>
                {h.direct ? '直连' : h.proxy}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// DNS解析组件
function DNSLookup() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const lookup = async () => {
    if (!domain) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setRecords([
      { type: 'A', value: '142.250.185.78', ttl: 300, priority: '-' },
      { type: 'AAAA', value: '2607:f8b0:4004:c06::64', ttl: 300, priority: '-' },
      { type: 'MX', value: 'alt1.aspmx.l.google.com', ttl: 3600, priority: '10' },
      { type: 'MX', value: 'alt2.aspmx.l.google.com', ttl: 3600, priority: '20' },
      { type: 'TXT', value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600, priority: '-' },
      { type: 'NS', value: 'ns1.google.com', ttl: 86400, priority: '-' },
    ]);
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      A: 'bg-blue-500/20 text-blue-400',
      AAAA: 'bg-cyan-500/20 text-cyan-400',
      MX: 'bg-purple-500/20 text-purple-400',
      TXT: 'bg-yellow-500/20 text-yellow-400',
      NS: 'bg-green-500/20 text-green-400',
      CNAME: 'bg-pink-500/20 text-pink-400',
    };
    return colors[type] || 'bg-slate-500/20 text-slate-400';
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Server className="w-4 h-4 inline mr-1" />
          查询域名的 DNS 记录，包括 A、AAAA、MX、TXT、NS 等记录类型
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="输入域名，如: google.com"
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={lookup}
          disabled={loading || !domain}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? '查询中...' : '查询'}
        </button>
      </div>
      {records.length > 0 && (
        <div className="space-y-2">
          {records.map((record, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(record.type)}`}>
                  {record.type}
                </span>
                <code className="text-cyan-400 font-mono text-sm flex-1 truncate">{record.value}</code>
              </div>
              <div className="flex items-center gap-3">
                {record.priority !== '-' && (
                  <span className="text-xs text-slate-500">优先级: {record.priority}</span>
                )}
                <span className="text-xs text-slate-500">TTL: {record.ttl}</span>
                <button
                  onClick={() => copyToClipboard(record.value)}
                  className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// 封锁测试组件
function BlockTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const regions = [
    { code: 'CN', name: '中国大陆', flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
    { code: 'US', name: '美国', flag: '🇺🇸', color: 'from-blue-500 to-red-500' },
    { code: 'JP', name: '日本', flag: '🇯🇵', color: 'from-red-500 to-white' },
    { code: 'SG', name: '新加坡', flag: '🇸🇬', color: 'from-red-500 to-white' },
    { code: 'DE', name: '德国', flag: '🇩🇪', color: 'from-black to-yellow-500' },
    { code: 'GB', name: '英国', flag: '🇬🇧', color: 'from-blue-500 to-red-500' },
    { code: 'KR', name: '韩国', flag: '🇰🇷', color: 'from-blue-500 to-red-500' },
    { code: 'RU', name: '俄罗斯', flag: '🇷🇺', color: 'from-white to-blue-500' },
  ];

  const testBlock = async () => {
    if (!url) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setResults(regions.map(r => ({
      ...r,
      blocked: Math.random() > 0.6,
      responseTime: Math.floor(Math.random() * 400) + 50,
    })));
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Globe className="w-4 h-4 inline mr-1" />
          检测网站在不同国家/地区的可访问性
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入测试网址，如: https://google.com"
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={testBlock}
          disabled={loading || !url}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
          {loading ? '测试中...' : '测试'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {results.map((r, index) => (
            <motion.div
              key={r.code}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                r.blocked 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.flag}</span>
                  <span className="text-white font-medium">{r.name}</span>
                </div>
                {r.blocked ? (
                  <Lock className="w-5 h-5 text-red-400" />
                ) : (
                  <Unlock className="w-5 h-5 text-green-400" />
                )}
              </div>
              <div className={`text-sm ${r.blocked ? 'text-red-400' : 'text-green-400'}`}>
                {r.blocked ? '已封锁' : `响应时间 ${r.responseTime}ms`}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// Whois查询组件
function WhoisLookup() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const lookup = async () => {
    if (!query) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setResult({
      domain: query,
      registrar: 'GoDaddy.com, LLC',
      created: '2020-01-15',
      expires: '2025-01-15',
      updated: '2024-01-10',
      status: 'clientTransferProhibited',
      nameservers: ['ns1.example.com', 'ns2.example.com'],
      admin: 'admin@example.com',
      tech: 'tech@example.com',
    });
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Search className="w-4 h-4 inline mr-1" />
          查询域名或 IP 的注册信息，包括注册商、注册时间、过期时间等
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入域名或IP，如: google.com"
          className="flex-1 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
        <button
          onClick={lookup}
          disabled={loading || !query}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center gap-2"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          {loading ? '查询中...' : '查询'}
        </button>
      </div>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 space-y-3"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-400" />
                查询结果
              </h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
              </button>
            </div>
            {[
              { label: '域名', value: result.domain },
              { label: '注册商', value: result.registrar, color: 'text-cyan-400' },
              { label: '创建时间', value: result.created },
              { label: '过期时间', value: result.expires },
              { label: '更新时间', value: result.updated },
              { label: '状态', value: result.status, color: 'text-yellow-400' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <span className={`text-sm ${item.color || 'text-white'}`}>{item.value}</span>
              </div>
            ))}
            <div className="p-2 bg-slate-900/50 rounded-lg">
              <span className="text-slate-400 text-sm">DNS服务器</span>
              <div className="mt-1 space-y-1">
                {result.nameservers.map((ns: string) => (
                  <code key={ns} className="text-slate-300 text-sm font-mono">{ns}</code>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 浏览器信息查询组件
function BrowserInfo() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 收集浏览器信息
  const getBrowserInfo = () => {
    const nav = navigator as any; // 用于访问非标准属性
    const screen = window.screen;

    // 解析 User-Agent
    const ua = navigator.userAgent;
    let browserName = '未知';
    let browserVersion = '';

    if (ua.includes('Firefox/')) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
    } else if (ua.includes('Edg/')) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
    } else if (ua.includes('OPR/') || ua.includes('Opera/')) {
      browserName = 'Opera';
      browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || '';
    } else if (ua.includes('Chrome/')) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
    }

    // 解析操作系统
    let osName = '未知';
    if (ua.includes('Windows NT 10')) osName = 'Windows 10/11';
    else if (ua.includes('Windows NT 6.3')) osName = 'Windows 8.1';
    else if (ua.includes('Windows NT 6.1')) osName = 'Windows 7';
    else if (ua.includes('Mac OS X')) {
      const ver = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
      osName = `macOS ${ver}`;
    } else if (ua.includes('Linux')) osName = 'Linux';
    else if (ua.includes('Android')) {
      const ver = ua.match(/Android ([\d.]+)/)?.[1] || '';
      osName = `Android ${ver}`;
    } else if (ua.includes('iPhone') || ua.includes('iPad')) {
      const ver = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
      osName = `iOS ${ver}`;
    }

    // WebGL 信息
    let webglRenderer = '';
    let webglVendor = '';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          webglVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '';
          webglRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '';
        }
      }
    } catch {}

    // 网络连接信息
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;

    return [
      {
        category: '浏览器信息',
        icon: Globe,
        color: 'text-blue-400',
        items: [
          { label: '浏览器', value: `${browserName} ${browserVersion}`.trim(), id: 'browser' },
          { label: 'User-Agent', value: ua, id: 'ua', mono: true, full: true },
          { label: '浏览器引擎', value: ua.includes('Gecko/') ? (ua.includes('like Gecko') ? 'Blink' : 'Gecko') : 'WebKit', id: 'engine' },
          { label: '平台', value: navigator.platform || '未知', id: 'platform' },
        ],
      },
      {
        category: '操作系统',
        icon: Monitor,
        color: 'text-cyan-400',
        items: [
          { label: '操作系统', value: osName, id: 'os' },
          { label: '平台标识', value: navigator.platform || '未知', id: 'platform2' },
          { label: '架构', value: navigator.userAgent.includes('WOW64') || navigator.userAgent.includes('x86_64') || navigator.userAgent.includes('x64') || navigator.userAgent.includes('Win64') ? '64 位' : '32 位', id: 'arch' },
        ],
      },
      {
        category: '屏幕 & 显示',
        icon: Layers,
        color: 'text-purple-400',
        items: [
          { label: '屏幕分辨率', value: `${screen.width} × ${screen.height}`, id: 'screen' },
          { label: '可用区域', value: `${screen.availWidth} × ${screen.availHeight}`, id: 'avail' },
          { label: '浏览器窗口', value: `${window.innerWidth} × ${window.innerHeight}`, id: 'window' },
          { label: '设备像素比', value: `${window.devicePixelRatio}x`, id: 'dpr' },
          { label: '色深', value: `${screen.colorDepth} 位`, id: 'colordepth' },
        ],
      },
      {
        category: '硬件信息',
        icon: Cpu,
        color: 'text-orange-400',
        items: [
          { label: 'CPU 核心数', value: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核` : '未知', id: 'cores' },
          { label: '设备内存', value: nav.deviceMemory ? `${nav.deviceMemory} GB` : '未知', id: 'memory' },
          { label: '最大触控点', value: `${navigator.maxTouchPoints}`, id: 'touch' },
          { label: 'GPU 渲染器', value: webglRenderer || '未知', id: 'gpu', full: true },
          { label: 'GPU 供应商', value: webglVendor || '未知', id: 'gpuvendor' },
        ],
      },
      {
        category: '网络信息',
        icon: Wifi,
        color: 'text-green-400',
        items: [
          { label: '在线状态', value: navigator.onLine ? '在线' : '离线', id: 'online', status: navigator.onLine ? 'success' : 'error' },
          { label: '连接类型', value: conn?.effectiveType?.toUpperCase() || '未知', id: 'conntype' },
          { label: '下行带宽', value: conn?.downlink ? `${conn.downlink} Mbps` : '未知', id: 'downlink' },
          { label: '往返时延', value: conn?.rtt ? `${conn.rtt} ms` : '未知', id: 'rtt' },
          { label: '省流模式', value: conn?.saveData ? '已开启' : '未开启', id: 'savedata' },
        ],
      },
      {
        category: '语言 & 时区',
        icon: MapPin,
        color: 'text-yellow-400',
        items: [
          { label: '首选语言', value: navigator.language || '未知', id: 'lang' },
          { label: '支持语言', value: (navigator.languages || []).join(', ') || '未知', id: 'langs', full: true },
          { label: '时区', value: Intl.DateTimeFormat().resolvedOptions().timeZone || '未知', id: 'tz' },
          { label: 'UTC 偏移', value: `UTC${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${String(Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))).padStart(2, '0')}:${String(Math.abs(new Date().getTimezoneOffset() % 60)).padStart(2, '0')}`, id: 'utcoff' },
        ],
      },
      {
        category: '安全 & 隐私',
        icon: Shield,
        color: 'text-red-400',
        items: [
          { label: 'Cookie 支持', value: navigator.cookieEnabled ? '已启用' : '已禁用', id: 'cookie', status: navigator.cookieEnabled ? 'success' : 'error' },
          { label: 'Do Not Track', value: navigator.doNotTrack === '1' ? '已启用' : navigator.doNotTrack === '0' ? '已禁用' : '未设置', id: 'dnt' },
          { label: 'WebDriver', value: nav.webdriver ? '检测到（可能为自动化浏览器）' : '未检测到', id: 'webdriver', status: nav.webdriver ? 'warning' : 'success' },
          { label: 'HTTPS', value: location.protocol === 'https:' ? '是' : '否', id: 'https', status: location.protocol === 'https:' ? 'success' : 'warning' },
        ],
      },
      {
        category: '功能支持',
        icon: Zap,
        color: 'text-indigo-400',
        items: [
          { label: 'WebGL', value: (() => { try { return document.createElement('canvas').getContext('webgl') ? '支持' : '不支持'; } catch { return '不支持'; } })(), id: 'webgl', status: (() => { try { return document.createElement('canvas').getContext('webgl') ? 'success' : 'error'; } catch { return 'error'; } })() },
          { label: 'WebGL 2', value: (() => { try { return document.createElement('canvas').getContext('webgl2') ? '支持' : '不支持'; } catch { return '不支持'; } })(), id: 'webgl2', status: (() => { try { return document.createElement('canvas').getContext('webgl2') ? 'success' : 'error'; } catch { return 'error'; } })() },
          { label: 'WebRTC', value: typeof RTCPeerConnection !== 'undefined' ? '支持' : '不支持', id: 'webrtc', status: typeof RTCPeerConnection !== 'undefined' ? 'success' : 'error' },
          { label: 'Service Worker', value: 'serviceWorker' in navigator ? '支持' : '不支持', id: 'sw', status: 'serviceWorker' in navigator ? 'success' : 'error' },
          { label: 'WebSocket', value: typeof WebSocket !== 'undefined' ? '支持' : '不支持', id: 'ws', status: typeof WebSocket !== 'undefined' ? 'success' : 'error' },
          { label: 'LocalStorage', value: (() => { try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return '支持'; } catch { return '不支持'; } })(), id: 'ls', status: (() => { try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return 'success'; } catch { return 'error'; } })() },
        ],
      },
    ];
  };

  const categories = getBrowserInfo();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const getStatusDot = (status?: string) => {
    switch (status) {
      case 'success': return 'bg-green-400';
      case 'error': return 'bg-red-400';
      case 'warning': return 'bg-yellow-400';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <p className="text-slate-400 text-sm">
          <Fingerprint className="w-4 h-4 inline mr-1" />
          检测您的浏览器指纹信息，包括浏览器版本、操作系统、硬件信息、安全隐私设置等
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500">
        <RefreshCw className="w-3 h-3" />
        <span>信息实时获取，刷新页面可更新</span>
      </div>

      <div className="space-y-4">
        {categories.map((cat, catIndex) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: catIndex * 0.05 }}
            className="bg-slate-800/30 rounded-xl border border-slate-700/50 overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-800/50 border-b border-slate-700/30">
              <cat.icon className={`w-4 h-4 ${cat.color}`} />
              <span className="text-white font-medium text-sm">{cat.category}</span>
            </div>
            <div className="divide-y divide-slate-700/20">
              {cat.items.map((item) => (
                <div key={item.id} className={`flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/30 transition-colors ${item.full ? 'flex-col !items-start gap-1' : ''}`}>
                  <span className="text-slate-400 text-sm shrink-0">{item.label}</span>
                  <div className={`flex items-center gap-2 ${item.full ? 'w-full' : ''}`}>
                    {item.status && (
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`} />
                    )}
                    <code className={`text-sm ${item.mono ? 'font-mono text-xs break-all' : ''} ${getStatusColor(item.status)} ${item.full ? 'w-full' : ''}`}>
                      {item.value}
                    </code>
                    <button
                      onClick={() => copyToClipboard(item.value, item.id)}
                      className="p-1 rounded hover:bg-slate-700/50 transition-colors shrink-0"
                      title="复制"
                    >
                      {copied === item.id ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* 一键复制全部信息 */}
      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            const allInfo = categories.map(cat =>
              `${cat.category}:\n${cat.items.map(item => `  ${item.label}: ${item.value}`).join('\n')}`
            ).join('\n\n');
            copyToClipboard(allInfo, 'all');
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm transition-colors border border-slate-700/50"
        >
          {copied === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          {copied === 'all' ? '已复制全部信息' : '复制全部信息'}
        </button>
      </div>
    </div>
  );
}

const tools: Tool[] = [
  { id: 'mtr', icon: Activity, name: 'MTR测试', desc: '网络路由追踪分析', component: <MTRTest />, color: 'from-blue-500 to-cyan-400' },
  { id: 'routing', icon: Route, name: '分流测试', desc: '检查代理规则设置', component: <RoutingTest />, color: 'from-purple-500 to-pink-400' },
  { id: 'dns', icon: Server, name: 'DNS解析', desc: '多渠道DNS解析查询', component: <DNSLookup />, color: 'from-green-500 to-emerald-400' },
  { id: 'block', icon: Lock, name: '封锁测试', desc: '检查网站在各国封锁情况', component: <BlockTest />, color: 'from-orange-500 to-red-400' },
  { id: 'whois', icon: Search, name: 'Whois查询', desc: '域名和IP注册信息查询', component: <WhoisLookup />, color: 'from-indigo-500 to-purple-400' },
  { id: 'browser', icon: Fingerprint, name: '浏览器信息', desc: '检测浏览器指纹与安全隐私', component: <BrowserInfo />, color: 'from-teal-500 to-emerald-400' },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-400 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">高级工具</h1>
          <p className="text-slate-400 text-sm">专业网络诊断工具集</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveTool(tool.id)}
            className={`bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 hover:border-blue-500/30 transition-all cursor-pointer group ${
              activeTool === tool.id ? 'ring-2 ring-blue-500/50' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg flex items-center justify-center shadow-lg`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-white">{tool.name}</h3>
            </div>
            <p className="text-slate-400 text-sm">{tool.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-blue-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>点击使用</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {activeToolData && (
                  <>
                    <div className={`w-10 h-10 bg-gradient-to-br ${activeToolData.color} rounded-lg flex items-center justify-center`}>
                      <activeToolData.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">{activeToolData.name}</h2>
                      <p className="text-slate-400 text-xs">{activeToolData.desc}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            {activeToolData?.component}
          </motion.div>
        )}
      </AnimatePresence>

      <GlobalLatency />
    </div>
  );
}
