import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Globe, Server, MapPin, Clock, Zap, Lock, Unlock, Copy, Check, Terminal, ArrowRight } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

// DNS 查询结果
interface DNSQueryResult {
  domain: string;
  type: string;
  records: { data: string; ttl: number }[];
  resolver: string;
  resolverIP: string;
  responseTime: number;
  status: 'success' | 'error' | 'checking';
}

// DNS 解析器
interface DNSResolverInfo {
  name: string;
  ip: string;
  dohUrl: string;
  location: string;
  type: string;
  features: string[];
  color: string;
}

const DNS_RESOLVERS: DNSResolverInfo[] = [
  { name: 'Cloudflare', ip: '1.1.1.1', dohUrl: 'https://cloudflare-dns.com/dns-query', location: '美国', type: 'Public', features: ['DoH', 'DoT', 'DNSSEC'], color: 'from-orange-500 to-yellow-400' },
  { name: 'Google', ip: '8.8.8.8', dohUrl: 'https://dns.google/resolve', location: '美国', type: 'Public', features: ['DoH', 'DoT', 'ECS'], color: 'from-blue-500 to-green-400' },
  { name: '阿里 DNS', ip: '223.5.5.5', dohUrl: 'https://dns.alidns.com/resolve', location: '中国', type: 'Public', features: ['DoH', 'DoT', 'ECS'], color: 'from-orange-500 to-red-400' },
  { name: '腾讯 DNSPod', ip: '119.29.29.29', dohUrl: 'https://sm2.doh.pub/dns-query', location: '中国', type: 'Public', features: ['DoH', 'ECS'], color: 'from-blue-500 to-cyan-400' },
  { name: 'dns.sb', ip: '185.222.222.222', dohUrl: 'https://doh.dns.sb/dns-query', location: '瑞士', type: 'Public', features: ['DoH', 'DoT', 'DNSSEC'], color: 'from-teal-500 to-emerald-400' },
  { name: 'Cloudflare IPv6', ip: '1.0.0.1', dohUrl: 'https://1.1.1.1/dns-query', location: '美国', type: 'Public', features: ['DoH', 'DoT', 'ECS'], color: 'from-purple-500 to-pink-400' },
];

// 测试域名（覆盖国内外常见服务）
const TEST_DOMAINS = [
  { domain: 'www.google.com', label: 'Google', region: '国外' },
  { domain: 'www.youtube.com', label: 'YouTube', region: '国外' },
  { domain: 'www.github.com', label: 'GitHub', region: '国外' },
  { domain: 'www.baidu.com', label: '百度', region: '国内' },
  { domain: 'www.qq.com', label: '腾讯', region: '国内' },
  { domain: 'www.taobao.com', label: '淘宝', region: '国内' },
];

// 带超时 fetch
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 5000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export default function DNSSection() {
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [queryResults, setQueryResults] = useState<DNSQueryResult[]>([]);
  const [activeResolver, setActiveResolver] = useState<string>(DNS_RESOLVERS[0].dohUrl);
  const [activeTab, setActiveTab] = useState<'test' | 'compare' | 'servers' | 'protection'>('test');
  const [copied, setCopied] = useState<string | null>(null);
  const [compareResults, setCompareResults] = useState<Map<string, DNSQueryResult[]>>(new Map());
  const [compareLoading, setCompareLoading] = useState(false);
  const [currentResolver, setCurrentResolver] = useState('检测中...');

  const copyToClipboardHandler = (text: string, id: string) => {
    copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 检测当前使用的 DNS
  const detectCurrentDNS = useCallback(async () => {
    try {
      // 尝试用 Cloudflare trace 检测
      const res = await fetchWithTimeout('https://1.1.1.1/cdn-cgi/trace', undefined, 5000);
      const text = await res.text();
      const ipLine = text.split('\n').find(l => l.startsWith('ip='));
      if (ipLine) {
        setCurrentResolver(`出口 IP: ${ipLine.split('=')[1]}`);
      }
    } catch {
      // 降级：尝试 ip-api
      try {
        const res = await fetchWithTimeout('http://ip-api.com/json/?lang=zh-CN', undefined, 5000);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setCurrentResolver(`${data.query} (${data.isp})`);
          }
        }
      } catch {
        setCurrentResolver('检测失败');
      }
    }
  }, []);

  // 使用 DoH 查询 DNS
  const queryDNS = async (domain: string, type: string, dohUrl: string): Promise<DNSQueryResult> => {
    const startTime = performance.now();
    const resolver = DNS_RESOLVERS.find(r => r.dohUrl === dohUrl);

    try {
      const res = await fetchWithTimeout(`${dohUrl}?name=${domain}&type=${type}`, {
        headers: { 'Accept': 'application/dns-json' },
      }, 6000);

      const responseTime = Math.round(performance.now() - startTime);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const answers = (data.Answer || []) as { data: string; TTL: number }[];

      return {
        domain,
        type,
        records: answers.map(a => ({ data: a.data, ttl: a.TTL })),
        resolver: resolver?.name || dohUrl,
        resolverIP: resolver?.ip || '-',
        responseTime,
        status: 'success',
      };
    } catch (e) {
      return {
        domain,
        type,
        records: [],
        resolver: resolver?.name || dohUrl,
        resolverIP: resolver?.ip || '-',
        responseTime: Math.round(performance.now() - startTime),
        status: 'error',
      };
    }
  };

  // 执行 DNS 测试
  const runTest = useCallback(async () => {
    setLoading(true);
    setHasRun(true);
    setQueryResults([]);

    const results: DNSQueryResult[] = [];

    for (const td of TEST_DOMAINS) {
      // 先标记为 checking
      setQueryResults(prev => [...prev, {
        domain: td.domain,
        type: 'A',
        records: [],
        resolver: DNS_RESOLVERS.find(r => r.dohUrl === activeResolver)?.name || '',
        resolverIP: DNS_RESOLVERS.find(r => r.dohUrl === activeResolver)?.ip || '',
        responseTime: 0,
        status: 'checking',
      }]);

      const result = await queryDNS(td.domain, 'A', activeResolver);
      results.push(result);

      // 逐个更新
      setQueryResults([...results]);
    }

    setLoading(false);
  }, [activeResolver]);

  // 跨解析器对比测试
  const runCompare = async () => {
    setCompareLoading(true);
    setCompareResults(new Map());
    const testDomain = 'www.google.com';
    const map = new Map<string, DNSQueryResult[]>();

    for (const resolver of DNS_RESOLVERS) {
      const result = await queryDNS(testDomain, 'A', resolver.dohUrl);
      map.set(resolver.name, [result]);
      setCompareResults(new Map(map));
    }

    setCompareLoading(false);
  };

  useEffect(() => {
    detectCurrentDNS();
    runTest();
  }, [detectCurrentDNS, runTest]);

  // 统计
  const successCount = queryResults.filter(r => r.status === 'success').length;
  const failedCount = queryResults.filter(r => r.status === 'error').length;
  const hasLeak = false; // DNS 泄漏需要服务端配合，纯前端无法判断
  const avgResponseTime = queryResults.length > 0
    ? Math.round(queryResults.filter(r => r.responseTime > 0).reduce((sum, r) => sum + r.responseTime, 0) / Math.max(1, queryResults.filter(r => r.responseTime > 0).length))
    : 0;

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center shadow-glow-purple">
            <Server className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">DNS 泄漏测试</h2>
            <p className="text-secondary text-sm">通过 DNS-over-HTTPS 查询检测 DNS 解析情况</p>
          </div>
        </div>
        <button
          onClick={runTest}
          disabled={loading}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '检测中...' : '重新检测'}
        </button>
      </div>

      {/* Tab 导航 */}
      <div className="flex gap-1 p-1 glass-card !rounded-2xl overflow-x-auto">
        {[
          { key: 'test',       label: 'DNS 查询',    icon: Globe },
          { key: 'compare',    label: '解析器对比',  icon: ArrowRight },
          { key: 'servers',    label: 'DNS 服务器',  icon: Server },
          { key: 'protection', label: '防护建议',    icon: Lock },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-gradient-brand text-white shadow-glow-blue'
                : 'text-secondary hover:text-primary hover:bg-[var(--bg-input)]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── DNS 查询测试 ── */}
        {activeTab === 'test' && (
          <motion.div key="test" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

            {/* 选择解析器 */}
            <div className="glass-card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-4 h-4 text-[var(--accent-purple)]" />
                <span className="text-primary font-medium text-sm">选择 DNS 解析器</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DNS_RESOLVERS.map(r => (
                  <button
                    key={r.dohUrl}
                    onClick={() => { setActiveResolver(r.dohUrl); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                      activeResolver === r.dohUrl
                        ? `bg-gradient-to-r ${r.color} text-white shadow-lg`
                        : 'inner-card text-secondary hover:text-primary'
                    }`}
                  >
                    <span className="font-mono text-xs">{r.ip}</span>
                    <span className="hidden sm:inline">{r.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 统计概览 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: '当前出口', value: currentResolver, icon: Globe,       color: 'text-[var(--accent-cyan)]' },
                { label: '查询成功', value: `${successCount}/${queryResults.length}`, icon: CheckCircle, color: 'text-[var(--accent-green)]' },
                { label: '查询失败', value: `${failedCount}`, icon: XCircle,    color: failedCount > 0 ? 'text-[var(--accent-red)]' : 'text-tertiary' },
                { label: '平均响应', value: `${avgResponseTime}ms`, icon: Clock, color: avgResponseTime < 100 ? 'text-[var(--accent-green)]' : avgResponseTime < 500 ? 'text-[var(--accent-yellow)]' : 'text-[var(--accent-red)]' },
              ].map((stat, i) => (
                <div key={i} className="inner-card p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    <span className="text-tertiary text-xs">{stat.label}</span>
                  </div>
                  <p className={`${stat.color} font-semibold text-sm truncate`} title={stat.value}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 查询结果列表 */}
            <div className="glass-card overflow-hidden">
              <div className="px-4 py-3 border-b border-soft flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[var(--accent-purple)]" />
                  <span className="text-primary font-medium text-sm">DNS 查询结果</span>
                </div>
                <span className="text-xs text-tertiary">
                  解析器: {DNS_RESOLVERS.find(r => r.dohUrl === activeResolver)?.name}
                </span>
              </div>
              <div className="divide-y divide-[var(--border-soft)]">
                {queryResults.map((result, i) => (
                  <div key={result.domain} className="px-4 py-3 hover:bg-[var(--bg-input)] transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {result.status === 'checking' ? (
                          <RefreshCw className="w-4 h-4 text-[var(--accent-blue)] animate-spin" />
                        ) : result.status === 'success' ? (
                          <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" />
                        ) : (
                          <XCircle className="w-4 h-4 text-[var(--accent-red)]" />
                        )}
                        <span className="text-primary font-medium text-sm">
                          {TEST_DOMAINS[i]?.label || result.domain}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${TEST_DOMAINS[i]?.region === '国内' ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]' : 'bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]'}`}>
                          {TEST_DOMAINS[i]?.region || '未知'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {result.responseTime > 0 && (
                          <span className={`text-xs font-mono ${result.responseTime < 100 ? 'text-[var(--accent-green)]' : result.responseTime < 500 ? 'text-[var(--accent-yellow)]' : 'text-[var(--accent-red)]'}`}>
                            {result.responseTime}ms
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-6">
                      <code className="text-tertiary text-xs">{result.domain}</code>
                      {result.status === 'success' && result.records.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {result.records.map((rec, j) => (
                            <div key={j} className="flex items-center gap-1.5 px-2.5 py-1 inner-card">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-blue)]/15 text-[var(--accent-blue)] font-medium">A</span>
                              <code className="text-[var(--accent-cyan)] font-mono text-xs">{rec.data}</code>
                              <span className="text-tertiary text-xs">TTL {rec.ttl}</span>
                              <button onClick={() => copyToClipboardHandler(rec.data, `dns-${i}-${j}`)} className="p-0.5 hover:bg-[var(--bg-input)] rounded">
                                {copied === `dns-${i}-${j}` ? <Check className="w-3 h-3 text-[var(--accent-green)]" /> : <Copy className="w-3 h-3 text-tertiary" />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      {result.status === 'error' && (
                        <p className="text-[var(--accent-red)] text-xs mt-1">查询失败（解析器不可达或响应超时）</p>
                      )}
                      {result.status === 'checking' && (
                        <p className="text-tertiary text-xs mt-1">查询中...</p>
                      )}
                    </div>
                  </div>
                ))}
                {queryResults.length === 0 && !loading && (
                  <div className="px-4 py-8 text-center text-tertiary text-sm">点击"重新检测"开始 DNS 查询测试</div>
                )}
              </div>
            </div>

            {/* 说明 */}
            <div className="glass-card p-4">
              <h3 className="text-primary font-medium mb-2 flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-[var(--accent-purple)]" />
                什么是 DNS 泄漏？
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                当使用 VPN/代理时，如果 DNS 查询仍通过本地 ISP 的 DNS 服务器解析，而非 VPN 隧道内的 DNS，
                则发生 DNS 泄漏。这会导致 ISP 可以监控你的浏览记录。本测试通过 DNS-over-HTTPS (DoH) 向多个
                公共 DNS 解析器发送查询，帮助你了解 DNS 解析状态。
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 解析器对比 ── */}
        {activeTab === 'compare' && (
          <motion.div key="compare" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div>
                  <p className="text-secondary text-sm">
                    对比不同 DNS 解析器解析 <code className="text-[var(--accent-cyan)]">www.google.com</code> 的结果和速度
                  </p>
                </div>
                <button
                  onClick={runCompare}
                  disabled={compareLoading}
                  className="btn-primary flex items-center gap-2 text-sm !py-2 !px-3.5 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${compareLoading ? 'animate-spin' : ''}`} />
                  {compareLoading ? '对比中...' : '开始对比'}
                </button>
              </div>
            </div>

            {compareResults.size > 0 && (
              <div className="space-y-3">
                {DNS_RESOLVERS.filter(r => compareResults.has(r.name)).map(resolver => {
                  const results = compareResults.get(resolver.name) || [];
                  const result = results[0];
                  return (
                    <div key={resolver.ip} className="glass-card p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${resolver.color} rounded-lg flex items-center justify-center shadow`}>
                            <Server className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-primary font-medium">{resolver.name}</span>
                            <code className="text-tertiary text-xs ml-2 font-mono">{resolver.ip}</code>
                          </div>
                        </div>
                        {result && result.responseTime > 0 && (
                          <span className={`text-sm font-mono ${result.responseTime < 100 ? 'text-[var(--accent-green)]' : result.responseTime < 500 ? 'text-[var(--accent-yellow)]' : 'text-[var(--accent-red)]'}`}>
                            {result.responseTime}ms
                          </span>
                        )}
                      </div>
                      {result && result.status === 'success' && result.records.length > 0 ? (
                        <div className="flex flex-wrap gap-2 ml-11">
                          {result.records.map((rec, j) => (
                            <div key={j} className="flex items-center gap-1.5 px-2.5 py-1 inner-card">
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] font-medium">A</span>
                              <code className="text-[var(--accent-cyan)] font-mono text-xs">{rec.data}</code>
                            </div>
                          ))}
                        </div>
                      ) : result?.status === 'error' ? (
                        <p className="text-[var(--accent-red)] text-xs ml-11">查询失败</p>
                      ) : (
                        <p className="text-tertiary text-xs ml-11">检测中...</p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2 ml-11">
                        {resolver.features.map(f => (
                          <span key={f} className="text-xs px-1.5 py-0.5 rounded inner-card text-tertiary">{f}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {compareResults.size === 0 && !compareLoading && (
              <div className="text-center py-8 text-tertiary text-sm glass-card">点击"开始对比"查看不同 DNS 解析器的对比结果</div>
            )}
          </motion.div>
        )}

        {/* ── DNS 服务器信息 ── */}
        {activeTab === 'servers' && (
          <motion.div key="servers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
            {DNS_RESOLVERS.map((resolver, index) => (
              <motion.div
                key={resolver.ip}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 bg-gradient-to-br ${resolver.color} rounded-lg flex items-center justify-center shadow`}>
                      <Server className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-primary font-medium">{resolver.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full inner-card text-secondary ml-2">{resolver.type}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-[var(--accent-cyan)] font-mono text-sm">{resolver.ip}</code>
                    <button onClick={() => copyToClipboardHandler(resolver.ip, `srv-${resolver.ip}`)} className="p-1 rounded hover:bg-[var(--bg-input)]">
                      {copied === `srv-${resolver.ip}` ? <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" /> : <Copy className="w-3.5 h-3.5 text-tertiary" />}
                    </button>
                  </div>
                </div>
                <div className="ml-12 flex items-center gap-4 text-xs text-tertiary flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{resolver.location}</span>
                  <div className="flex flex-wrap gap-1">
                    {resolver.features.map(f => (
                      <span key={f} className="px-1.5 py-0.5 rounded inner-card text-secondary">{f}</span>
                    ))}
                  </div>
                </div>
                <div className="ml-12 mt-2">
                  <p className="text-xs text-tertiary font-mono truncate">DoH: {resolver.dohUrl}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* ── 防护建议 ── */}
        {activeTab === 'protection' && (
          <motion.div key="protection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[var(--accent-yellow)]" />
                如何防止 DNS 泄漏
              </h3>
              <div className="space-y-3">
                {[
                  { title: '使用 DNS over HTTPS (DoH)', desc: '加密 DNS 查询，防止中间人攻击和窥探。浏览器设置 → 隐私和安全 → 安全 → 使用安全 DNS', level: 'high' },
                  { title: '使用 DNS over TLS (DoT)', desc: '通过 TLS 加密 DNS 流量，在操作系统或路由器级别配置', level: 'high' },
                  { title: '启用 VPN DNS 泄漏保护', desc: '在 VPN 客户端设置中启用 DNS 泄漏保护功能，确保 DNS 查询走 VPN 隧道', level: 'high' },
                  { title: '手动设置可信 DNS', desc: '将 DNS 服务器手动设置为 Cloudflare 1.1.1.1 或 Google 8.8.8.8，避免使用 ISP 默认 DNS', level: 'medium' },
                  { title: '配置防火墙规则', desc: '阻止 53 端口（DNS）的出站流量，强制所有 DNS 查询走 VPN 隧道', level: 'medium' },
                  { title: '使用 DNSCrypt', desc: '通过 DNSCrypt 协议加密和认证 DNS 查询，比 DoH 更安全', level: 'low' },
                ].map((item, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-xl border ${
                    item.level === 'high' ? 'bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20' :
                    item.level === 'medium' ? 'bg-[var(--accent-yellow)]/5 border-[var(--accent-yellow)]/20' :
                    'bg-[var(--accent-blue)]/5 border-[var(--accent-blue)]/20'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      item.level === 'high' ? 'bg-[var(--accent-red)]' :
                      item.level === 'medium' ? 'bg-[var(--accent-yellow)]' : 'bg-[var(--accent-blue)]'
                    }`} />
                    <div>
                      <h4 className="text-primary font-medium text-sm">{item.title}</h4>
                      <p className="text-secondary text-xs mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 !border-l-4 !border-l-[var(--accent-purple)]">
              <h4 className="text-[var(--accent-purple)] font-medium mb-3">推荐 DNS 配置</h4>
              <div className="space-y-2 text-sm">
                {[
                  { label: '主 DNS (Cloudflare)', value: '1.1.1.1 / 1.0.0.1' },
                  { label: '备 DNS (Google)',     value: '8.8.8.8 / 8.8.4.4' },
                  { label: '国内 DNS (阿里)',     value: '223.5.5.5 / 223.6.6.6' },
                  { label: 'DoH 端点',            value: 'https://cloudflare-dns.com/dns-query' },
                ].map(row => (
                  <div key={row.label} className="flex items-center justify-between p-2.5 inner-card flex-wrap gap-2">
                    <span className="text-secondary">{row.label}</span>
                    <code className="text-[var(--accent-cyan)] font-mono text-xs">{row.value}</code>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
