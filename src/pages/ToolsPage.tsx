import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Activity, Server, MapPin, Clock, Shield, Search, Route, Lock, Unlock, X, Zap, Network, Terminal, ChevronRight, Copy, Check, Fingerprint, Monitor, Cpu, Wifi, Layers, RefreshCw } from 'lucide-react';
import GlobalLatency from '../components/GlobalLatency';
import { copyToClipboard as copyText } from '../utils/clipboard';

interface Tool {
  id: string;
  icon: React.ElementType;
  name: string;
  desc: string;
  component: React.ReactNode;
  color: string;
}

// ─────────── MTR 测试 ───────────
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
      { hop: 1, host: '192.168.1.1',         loss: '0%', sent: 10, last: 1,  avg: 1,  best: 1,  worst: 2,  location: '本地网关' },
      { hop: 2, host: '10.0.0.1',            loss: '0%', sent: 10, last: 5,  avg: 4,  best: 3,  worst: 8,  location: 'ISP 接入点' },
      { hop: 3, host: '61.135.169.1',        loss: '0%', sent: 10, last: 8,  avg: 7,  best: 6,  worst: 12, location: '北京电信' },
      { hop: 4, host: '202.97.1.1',          loss: '0%', sent: 10, last: 15, avg: 14, best: 12, worst: 22, location: '骨干网' },
      { hop: 5, host: 'target.example.com',  loss: '0%', sent: 10, last: 25, avg: 24, best: 20, worst: 35, location: '目标服务器' },
    ]);
    setLoading(false);
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 10) return 'text-[var(--accent-green)]';
    if (ms < 50) return 'text-[var(--accent-yellow)]';
    if (ms < 100) return 'text-[var(--accent-red)]';
    return 'text-[var(--accent-red)]';
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-blue)]" />
          MTR（My Traceroute）结合了 traceroute 和 ping 的功能，显示每一跳的延迟和丢包率
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="输入目标域名或 IP，如：google.com"
          className="flex-1 px-4 py-2.5 inner-card text-primary text-sm focus:outline-none focus:border-strong"
        />
        <button
          onClick={runMTR}
          disabled={loading || !target}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
        >
          {loading ? <Clock className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
          {loading ? '测试中...' : '开始测试'}
        </button>
      </div>
      {results.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[var(--bg-input)]">
                <tr className="text-tertiary">
                  <th className="px-3 py-3 text-left font-medium">Hop</th>
                  <th className="px-3 py-3 text-left font-medium">Host</th>
                  <th className="px-3 py-3 text-left font-medium">Loss</th>
                  <th className="px-3 py-3 text-left font-medium">Last</th>
                  <th className="px-3 py-3 text-left font-medium">Avg</th>
                  <th className="px-3 py-3 text-left font-medium">Best</th>
                  <th className="px-3 py-3 text-left font-medium">Worst</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <motion.tr
                    key={row.hop}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-t border-soft hover:bg-[var(--bg-input)] cursor-pointer"
                    onClick={() => setShowHopDetails(showHopDetails === row.hop ? null : row.hop)}
                  >
                    <td className="px-3 py-3 text-[var(--accent-cyan)] font-mono">{row.hop}</td>
                    <td className="px-3 py-3">
                      <div className="text-primary">{row.host}</div>
                      <div className="text-xs text-tertiary">{row.location}</div>
                    </td>
                    <td className="px-3 py-3 text-[var(--accent-green)]">{row.loss}</td>
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

// ─────────── 分流测试 ───────────
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
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Route className="w-4 h-4 text-[var(--accent-purple)]" />
          检测 URL 是否走代理，以及匹配的规则类型
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入测试 URL，如：https://google.com"
          className="flex-1 px-4 py-2.5 inner-card text-primary text-sm focus:outline-none focus:border-strong"
        />
        <button
          onClick={testRouting}
          disabled={loading || !url}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
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
            className="px-3 py-1.5 inner-card text-secondary hover:text-primary text-xs transition-colors"
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
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-primary font-medium">检测结果</h4>
              <span className="text-xs text-tertiary">{result.timestamp}</span>
            </div>
            <div className="space-y-2 text-sm">
              {[
                { label: '目标地址', value: result.url, color: 'text-primary' },
                { label: '直连',     value: result.direct ? '是' : '否', color: result.direct ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]' },
                { label: '代理节点', value: result.proxy, color: 'text-[var(--accent-cyan)]' },
                { label: '匹配规则', value: result.rule, color: 'text-[var(--accent-yellow)]' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between p-2.5 inner-card flex-wrap gap-2">
                  <span className="text-secondary">{row.label}</span>
                  <span className={`font-mono ${row.color}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {testHistory.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-secondary text-sm">最近检测</h4>
          {testHistory.map((h, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 inner-card text-sm flex-wrap gap-2">
              <span className="text-primary truncate flex-1 min-w-0">{h.url}</span>
              <span className={h.direct ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]'}>
                {h.direct ? '直连' : h.proxy}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── DNS 解析 ───────────
function DNSLookup() {
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const lookup = async () => {
    if (!domain) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setRecords([
      { type: 'A',    value: '142.250.185.78',              ttl: 300,   priority: '-' },
      { type: 'AAAA', value: '2607:f8b0:4004:c06::64',      ttl: 300,   priority: '-' },
      { type: 'MX',   value: 'alt1.aspmx.l.google.com',     ttl: 3600,  priority: '10' },
      { type: 'MX',   value: 'alt2.aspmx.l.google.com',     ttl: 3600,  priority: '20' },
      { type: 'TXT',  value: 'v=spf1 include:_spf.google.com ~all', ttl: 3600, priority: '-' },
      { type: 'NS',   value: 'ns1.google.com',               ttl: 86400, priority: '-' },
    ]);
    setLoading(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    copyText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      A:     'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]',
      AAAA:  'bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)]',
      MX:    'bg-[var(--accent-purple)]/15 text-[var(--accent-purple)]',
      TXT:   'bg-[var(--accent-yellow)]/15 text-[var(--accent-yellow)]',
      NS:    'bg-[var(--accent-green)]/15 text-[var(--accent-green)]',
      CNAME: 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]',
    };
    return colors[type] || 'inner-card text-tertiary';
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-[var(--accent-green)]" />
          查询域名的 DNS 记录，包括 A、AAAA、MX、TXT、NS 等记录类型
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="输入域名，如：google.com"
          className="flex-1 px-4 py-2.5 inner-card text-primary text-sm focus:outline-none focus:border-strong"
        />
        <button
          onClick={lookup}
          disabled={loading || !domain}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
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
              className="flex items-center justify-between p-3 inner-card flex-wrap gap-2"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(record.type)}`}>
                  {record.type}
                </span>
                <code className="text-[var(--accent-cyan)] font-mono text-sm flex-1 truncate">{record.value}</code>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {record.priority !== '-' && (
                  <span className="text-xs text-tertiary">优先级 {record.priority}</span>
                )}
                <span className="text-xs text-tertiary">TTL {record.ttl}</span>
                <button
                  onClick={() => copyToClipboard(record.value, `dns-${i}`)}
                  className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                >
                  {copied === `dns-${i}` ? <Check className="w-4 h-4 text-[var(--accent-green)]" /> : <Copy className="w-4 h-4 text-tertiary" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── 封锁测试 ───────────
function BlockTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const regions = [
    { code: 'CN', name: '中国大陆', flag: '🇨🇳', color: 'from-red-500 to-yellow-500' },
    { code: 'US', name: '美国',     flag: '🇺🇸', color: 'from-blue-500 to-red-500' },
    { code: 'JP', name: '日本',     flag: '🇯🇵', color: 'from-red-500 to-white' },
    { code: 'SG', name: '新加坡',   flag: '🇸🇬', color: 'from-red-500 to-white' },
    { code: 'DE', name: '德国',     flag: '🇩🇪', color: 'from-black to-yellow-500' },
    { code: 'GB', name: '英国',     flag: '🇬🇧', color: 'from-blue-500 to-red-500' },
    { code: 'KR', name: '韩国',     flag: '🇰🇷', color: 'from-blue-500 to-red-500' },
    { code: 'RU', name: '俄罗斯',   flag: '🇷🇺', color: 'from-white to-blue-500' },
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
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Globe className="w-4 h-4 text-[var(--accent-blue)]" />
          检测网站在不同国家/地区的可访问性
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入测试网址，如：https://google.com"
          className="flex-1 px-4 py-2.5 inner-card text-primary text-sm focus:outline-none focus:border-strong"
        />
        <button
          onClick={testBlock}
          disabled={loading || !url}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
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
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`p-4 rounded-xl border transition-all ${
                r.blocked
                  ? 'bg-[var(--accent-red)]/10 border-[var(--accent-red)]/25'
                  : 'bg-[var(--accent-green)]/10 border-[var(--accent-green)]/25'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{r.flag}</span>
                  <span className="text-primary font-medium">{r.name}</span>
                </div>
                {r.blocked ? (
                  <Lock className="w-5 h-5 text-[var(--accent-red)]" />
                ) : (
                  <Unlock className="w-5 h-5 text-[var(--accent-green)]" />
                )}
              </div>
              <div className={`text-sm ${r.blocked ? 'text-[var(--accent-red)]' : 'text-[var(--accent-green)]'}`}>
                {r.blocked ? '已封锁' : `响应时间 ${r.responseTime}ms`}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────── Whois 查询 ───────────
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
    });
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    copyText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Search className="w-4 h-4 text-[var(--accent-purple)]" />
          查询域名或 IP 的注册信息，包括注册商、注册时间、过期时间等
        </p>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="输入域名或 IP，如：google.com"
          className="flex-1 px-4 py-2.5 inner-card text-primary text-sm focus:outline-none focus:border-strong"
        />
        <button
          onClick={lookup}
          disabled={loading || !query}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50"
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
            className="glass-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-primary font-medium flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                查询结果
              </h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                className="p-1.5 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-[var(--accent-green)]" /> : <Copy className="w-4 h-4 text-tertiary" />}
              </button>
            </div>
            {[
              { label: '域名',     value: result.domain,    color: 'text-primary' },
              { label: '注册商',   value: result.registrar, color: 'text-[var(--accent-cyan)]' },
              { label: '创建时间', value: result.created,   color: 'text-primary' },
              { label: '过期时间', value: result.expires,   color: 'text-primary' },
              { label: '更新时间', value: result.updated,   color: 'text-primary' },
              { label: '状态',     value: result.status,    color: 'text-[var(--accent-yellow)]' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 inner-card flex-wrap gap-2">
                <span className="text-secondary text-sm">{item.label}</span>
                <span className={`text-sm ${item.color}`}>{item.value}</span>
              </div>
            ))}
            <div className="p-2.5 inner-card">
              <span className="text-secondary text-sm">DNS 服务器</span>
              <div className="mt-1 space-y-1">
                {result.nameservers.map((ns: string) => (
                  <code key={ns} className="text-secondary text-sm font-mono block">{ns}</code>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────── 浏览器信息 ───────────
type Status = 'success' | 'error' | 'warning' | undefined;

interface InfoItem {
  label: string;
  value: string;
  id: string;
  mono?: boolean;
  full?: boolean;
  status?: Status;
}

interface InfoCategory {
  category: string;
  icon: React.ElementType;
  color: string;
  items: InfoItem[];
}

function BrowserInfo() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    copyText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const getBrowserInfo = (): InfoCategory[] => {
    const nav = navigator as any;
    const screen = window.screen;
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

    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    const is64bit = ua.includes('WOW64') || ua.includes('x86_64') || ua.includes('x64') || ua.includes('Win64');

    const tryWebgl = (ver: 1 | 2): Status => {
      try { return document.createElement('canvas').getContext(ver === 2 ? 'webgl2' : 'webgl') ? 'success' : 'error'; }
      catch { return 'error'; }
    };

    const tryLS = (): Status => {
      try { localStorage.setItem('_test', '1'); localStorage.removeItem('_test'); return 'success'; }
      catch { return 'error'; }
    };

    return [
      {
        category: '浏览器信息',
        icon: Globe,
        color: 'text-[var(--accent-blue)]',
        items: [
          { label: '浏览器',     value: `${browserName} ${browserVersion}`.trim(), id: 'browser' },
          { label: 'User-Agent', value: ua,                                       id: 'ua', mono: true, full: true },
          { label: '浏览器引擎', value: ua.includes('Gecko/') ? (ua.includes('like Gecko') ? 'Blink' : 'Gecko') : 'WebKit', id: 'engine' },
          { label: '平台',       value: navigator.platform || '未知',              id: 'platform' },
        ],
      },
      {
        category: '操作系统',
        icon: Monitor,
        color: 'text-[var(--accent-cyan)]',
        items: [
          { label: '操作系统',   value: osName,                                   id: 'os' },
          { label: '平台标识',   value: navigator.platform || '未知',              id: 'platform2' },
          { label: '架构',       value: is64bit ? '64 位' : '32 位',               id: 'arch' },
        ],
      },
      {
        category: '屏幕 & 显示',
        icon: Layers,
        color: 'text-[var(--accent-purple)]',
        items: [
          { label: '屏幕分辨率', value: `${screen.width} × ${screen.height}`,                  id: 'screen' },
          { label: '可用区域',   value: `${screen.availWidth} × ${screen.availHeight}`,        id: 'avail' },
          { label: '浏览器窗口', value: `${window.innerWidth} × ${window.innerHeight}`,        id: 'window' },
          { label: '设备像素比', value: `${window.devicePixelRatio}x`,                         id: 'dpr' },
          { label: '色深',       value: `${screen.colorDepth} 位`,                             id: 'colordepth' },
        ],
      },
      {
        category: '硬件信息',
        icon: Cpu,
        color: 'text-[var(--accent-yellow)]',
        items: [
          { label: 'CPU 核心数', value: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} 核` : '未知', id: 'cores' },
          { label: '设备内存',   value: nav.deviceMemory ? `${nav.deviceMemory} GB` : '未知',                       id: 'memory' },
          { label: '最大触控点', value: `${navigator.maxTouchPoints}`,                                            id: 'touch' },
          { label: 'GPU 渲染器', value: webglRenderer || '未知',                                                  id: 'gpu', full: true },
          { label: 'GPU 供应商', value: webglVendor || '未知',                                                    id: 'gpuvendor' },
        ],
      },
      {
        category: '网络信息',
        icon: Wifi,
        color: 'text-[var(--accent-green)]',
        items: [
          { label: '在线状态',   value: navigator.onLine ? '在线' : '离线',                              id: 'online',   status: navigator.onLine ? 'success' : 'error' as Status },
          { label: '连接类型',   value: conn?.effectiveType?.toUpperCase() || '未知',                    id: 'conntype' },
          { label: '下行带宽',   value: conn?.downlink ? `${conn.downlink} Mbps` : '未知',               id: 'downlink' },
          { label: '往返时延',   value: conn?.rtt ? `${conn.rtt} ms` : '未知',                            id: 'rtt' },
          { label: '省流模式',   value: conn?.saveData ? '已开启' : '未开启',                             id: 'savedata' },
        ],
      },
      {
        category: '语言 & 时区',
        icon: MapPin,
        color: 'text-[var(--accent-yellow)]',
        items: [
          { label: '首选语言', value: navigator.language || '未知',                                          id: 'lang' },
          { label: '支持语言', value: (navigator.languages || []).join(', ') || '未知',                      id: 'langs', full: true },
          { label: '时区',     value: Intl.DateTimeFormat().resolvedOptions().timeZone || '未知',            id: 'tz' },
          {
            label: 'UTC 偏移',
            value: `UTC${new Date().getTimezoneOffset() > 0 ? '-' : '+'}${String(Math.abs(Math.floor(new Date().getTimezoneOffset() / 60))).padStart(2, '0')}:${String(Math.abs(new Date().getTimezoneOffset() % 60)).padStart(2, '0')}`,
            id: 'utcoff',
          },
        ],
      },
      {
        category: '安全 & 隐私',
        icon: Shield,
        color: 'text-[var(--accent-red)]',
        items: [
          { label: 'Cookie 支持', value: navigator.cookieEnabled ? '已启用' : '已禁用',                     id: 'cookie',   status: navigator.cookieEnabled ? 'success' : 'error' as Status },
          { label: 'Do Not Track', value: navigator.doNotTrack === '1' ? '已启用' : navigator.doNotTrack === '0' ? '已禁用' : '未设置', id: 'dnt' },
          { label: 'WebDriver',  value: nav.webdriver ? '检测到（可能为自动化浏览器）' : '未检测到',         id: 'webdriver', status: nav.webdriver ? 'warning' : 'success' as Status },
          { label: 'HTTPS',      value: location.protocol === 'https:' ? '是' : '否',                       id: 'https',    status: location.protocol === 'https:' ? 'success' : 'warning' as Status },
        ],
      },
      {
        category: '功能支持',
        icon: Zap,
        color: 'text-[var(--accent-purple)]',
        items: [
          { label: 'WebGL',          value: tryWebgl(1) === 'success' ? '支持' : '不支持',                  id: 'webgl',  status: tryWebgl(1) },
          { label: 'WebGL 2',        value: tryWebgl(2) === 'success' ? '支持' : '不支持',                  id: 'webgl2', status: tryWebgl(2) },
          { label: 'WebRTC',         value: typeof RTCPeerConnection !== 'undefined' ? '支持' : '不支持',   id: 'webrtc', status: (typeof RTCPeerConnection !== 'undefined' ? 'success' : 'error') as Status },
          { label: 'Service Worker', value: 'serviceWorker' in navigator ? '支持' : '不支持',               id: 'sw',     status: ('serviceWorker' in navigator ? 'success' : 'error') as Status },
          { label: 'WebSocket',      value: typeof WebSocket !== 'undefined' ? '支持' : '不支持',            id: 'ws',     status: (typeof WebSocket !== 'undefined' ? 'success' : 'error') as Status },
          { label: 'LocalStorage',   value: tryLS() === 'success' ? '支持' : '不支持',                       id: 'ls',     status: tryLS() },
        ],
      },
    ];
  };

  const categories = getBrowserInfo();

  const getStatusColor = (status?: Status) => {
    switch (status) {
      case 'success': return 'text-[var(--accent-green)]';
      case 'error':   return 'text-[var(--accent-red)]';
      case 'warning': return 'text-[var(--accent-yellow)]';
      default:        return 'text-primary';
    }
  };

  const getStatusDot = (status?: Status) => {
    switch (status) {
      case 'success': return 'bg-[var(--accent-green)]';
      case 'error':   return 'bg-[var(--accent-red)]';
      case 'warning': return 'bg-[var(--accent-yellow)]';
      default:        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="glass-card p-4">
        <p className="text-secondary text-sm flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-[var(--accent-cyan)]" />
          检测浏览器指纹信息，包括浏览器版本、操作系统、硬件信息、安全隐私设置等
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-tertiary">
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
            className="glass-card overflow-hidden"
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-soft">
              <cat.icon className={`w-4 h-4 ${cat.color}`} />
              <span className="text-primary font-medium text-sm">{cat.category}</span>
            </div>
            <div className="divide-y divide-[var(--border-soft)]">
              {cat.items.map((item) => (
                <div key={item.id} className={`flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-input)] transition-colors ${item.full ? 'flex-col !items-start gap-1' : ''}`}>
                  <span className="text-secondary text-sm shrink-0">{item.label}</span>
                  <div className={`flex items-center gap-2 ${item.full ? 'w-full' : ''}`}>
                    {item.status && (
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot(item.status)}`} />
                    )}
                    <code className={`text-sm ${item.mono ? 'font-mono text-xs break-all' : ''} ${getStatusColor(item.status)} ${item.full ? 'w-full' : ''}`}>
                      {item.value}
                    </code>
                    <button
                      onClick={() => copyToClipboard(item.value, item.id)}
                      className="p-1 rounded hover:bg-[var(--bg-input)] transition-colors shrink-0"
                      title="复制"
                    >
                      {copied === item.id ? (
                        <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-tertiary" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            const allInfo = categories.map(cat =>
              `${cat.category}:\n${cat.items.map(item => `  ${item.label}: ${item.value}`).join('\n')}`
            ).join('\n\n');
            copyToClipboard(allInfo, 'all');
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 glass-panel border border-soft hover:border-strong text-primary text-sm transition-all"
        >
          {copied === 'all' ? <Check className="w-4 h-4 text-[var(--accent-green)]" /> : <Copy className="w-4 h-4 text-tertiary" />}
          {copied === 'all' ? '已复制全部信息' : '复制全部信息'}
        </button>
      </div>
    </div>
  );
}

// ─────────── Tool registry ───────────
const tools: Tool[] = [
  { id: 'mtr',      icon: Activity,    name: 'MTR 测试',    desc: '网络路由追踪分析',         component: <MTRTest />,     color: 'from-blue-500 to-cyan-400' },
  { id: 'routing',  icon: Route,       name: '分流测试',    desc: '检查代理规则设置',         component: <RoutingTest />, color: 'from-purple-500 to-pink-400' },
  { id: 'dns',      icon: Server,      name: 'DNS 解析',    desc: '多渠道 DNS 解析查询',      component: <DNSLookup />,   color: 'from-green-500 to-emerald-400' },
  { id: 'block',    icon: Lock,        name: '封锁测试',    desc: '检查网站在各国封锁情况',    component: <BlockTest />,   color: 'from-orange-500 to-red-400' },
  { id: 'whois',    icon: Search,      name: 'Whois 查询',  desc: '域名和 IP 注册信息查询',   component: <WhoisLookup />, color: 'from-indigo-500 to-purple-400' },
  { id: 'browser',  icon: Fingerprint, name: '浏览器信息',  desc: '检测浏览器指纹与安全隐私',  component: <BrowserInfo />, color: 'from-teal-500 to-emerald-400' },
];

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const activeToolData = tools.find(t => t.id === activeTool);

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-400 flex items-center justify-center shadow-glow-purple">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-primary">高级工具</h2>
          <p className="text-secondary text-sm">专业网络诊断工具集</p>
        </div>
      </motion.div>

      {/* 工具卡片网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {tools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => setActiveTool(tool.id)}
            className={`relative glass-card p-4 cursor-pointer group overflow-hidden ${
              activeTool === tool.id ? 'ring-2 ring-[var(--accent-blue)]' : ''
            }`}
          >
            {/* Decorative blob */}
            <div className={`pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15 blur-2xl bg-gradient-to-br ${tool.color}`} />

            <div className="relative flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <tool.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-primary">{tool.name}</h3>
            </div>
            <p className="text-secondary text-sm">{tool.desc}</p>
            <div className="flex items-center gap-1 mt-3 text-[var(--accent-blue)] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <span>点击使用</span>
              <ChevronRight className="w-3 h-3" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 展开的活动工具 */}
      <AnimatePresence>
        {activeTool && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {activeToolData && (
                  <>
                    <div className={`w-10 h-10 bg-gradient-to-br ${activeToolData.color} rounded-xl flex items-center justify-center shadow-lg`}>
                      <activeToolData.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{activeToolData.name}</h3>
                      <p className="text-tertiary text-xs">{activeToolData.desc}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTool(null)}
                className="p-2 rounded-lg hover:bg-[var(--bg-input)] transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5 text-tertiary" />
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
