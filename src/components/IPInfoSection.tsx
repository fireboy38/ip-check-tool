import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Server, Shield, RefreshCw, Copy, Check, ExternalLink } from 'lucide-react';

interface IPSourceResult {
  id: string;
  name: string;
  desc: string;
  ip: string;
  ipv6?: string;           // IPv6 地址，有则显示
  location: string;
  status: 'loading' | 'success' | 'error';
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

// ── 检测函数 ───────────────────────────────────────────────

// 带超时的 fetch（默认 8 秒），避免请求挂死导致 UI 一直"检测中"
async function fetchWithTimeout(input: RequestInfo, init?: RequestInit, timeout = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(input, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

// ipwhois.io 支持 CORS（无需 API Key，免费额度充足）
async function fetchGeo(ip: string): Promise<{ country: string; city: string; countryCode: string }> {
  // 优先尝试 ip-api.com（国内可达、支持 CORS、免费）
  try {
    const res = await fetchWithTimeout(`http://ip-api.com/json/${ip}?lang=zh-CN`, undefined, 5000);
    if (res.ok) {
      const data = await res.json();
      if (data.status === 'success') {
        return {
          country: data.country || '未知',
          city: data.city || '',
          countryCode: data.countryCode || '',
        };
      }
    }
  } catch {}
  // 降级 ip.sb（国内可达、支持 CORS）
  try {
    const res = await fetchWithTimeout(`https://api.ip.sb/geoip/${ip}`, undefined, 5000);
    if (res.ok) {
      const data = await res.json();
      return {
        country: data.country || '未知',
        city: data.city || '',
        countryCode: data.country_code || '',
      };
    }
  } catch {}
  // 再降级 ipinfo.io
  try {
    const res = await fetchWithTimeout(`https://ipinfo.io/${ip}/json`, undefined, 5000);
    if (res.ok) {
      const data = await res.json();
      return {
        country: data.country || '未知',
        city: data.city || '',
        countryCode: data.country || '',
      };
    }
  } catch {}
  return { country: '未知', city: '', countryCode: '' };
}

// 判断是否为 IPv6 地址
function isIPv6(ip: string): boolean {
  return ip.includes(':');
}

// 尝试获取 IPv6 地址（非阻塞，失败返回 undefined）
async function tryGetIPv6(): Promise<string | undefined> {
  // 尝试多个 IPv6 检测服务
  const v6APIs: Array<() => Promise<string | undefined>> = [
    async () => {
      const res = await fetchWithTimeout('https://api6.ipify.org?format=json', undefined, 4000);
      if (res.ok) {
        const data = await res.json();
        if (data.ip && isIPv6(data.ip)) return data.ip;
      }
      return undefined;
    },
    async () => {
      const res = await fetchWithTimeout('https://api64.ipify.org?format=json', undefined, 4000);
      if (res.ok) {
        const data = await res.json();
        if (data.ip && isIPv6(data.ip)) return data.ip;
      }
      return undefined;
    },
  ];
  for (const fn of v6APIs) {
    try {
      const result = await fn();
      if (result) return result;
    } catch {}
  }
  return undefined;
}

// 国内 IP：优先使用中国 IP 服务（代理分流下走直连），CORS 失败再降级到海外服务
async function getDomesticIP(): Promise<IPSourceResult> {
  const base = {
    id: 'domestic',
    name: '国内 IP',
    desc: '访问国内网站所使用的IP',
    color: 'from-red-500 to-orange-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-400',
    icon: '🇨🇳',
  };

  let ipv4 = '';
  let ipv6: string | undefined;

  // 策略1: 尝试中国 IP 服务（分流代理下这些域名走直连，能拿到真实国内 IP）
  const chineseAPIs: Array<() => Promise<string>> = [
    // ipip.net — 中国知名 IP 查询服务，返回纯文本 IP
    async () => {
      const r = await fetchWithTimeout('https://myip.ipip.net', undefined, 5000);
      const t = await r.text();
      const match = t.trim().match(/(\d+\.\d+\.\d+\.\d+)/);
      if (match) return match[1];
      throw new Error('no ip in response');
    },
    // pconline — 太平洋电脑网 IP 服务，返回 JSON
    async () => {
      const r = await fetchWithTimeout('https://whois.pconline.com.cn/ipJson.jsp', undefined, 5000);
      const d = await r.json();
      if (d.ip) return d.ip as string;
      throw new Error('no ip in response');
    },
    // ip-api.com — 免费、支持 CORS、国内可达
    async () => {
      const r = await fetchWithTimeout('http://ip-api.com/json/?lang=zh-CN', undefined, 5000);
      const d = await r.json();
      if (d.status === 'success' && d.query) return d.query as string;
      throw new Error('no ip in response');
    },
  ];

  for (const getIP of chineseAPIs) {
    try {
      const ip = await getIP();
      if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
        ipv4 = ip;
        break;
      }
    } catch {
      // CORS 被拦截或网络错误，尝试下一个
    }
  }

  // 策略2: 降级用其他可用服务
  if (!ipv4) {
    const fallbackAPIs: Array<() => Promise<string>> = [
      // ip.sb — 国内可达、支持 CORS、返回 IP+地理位置
      async () => {
        const res = await fetchWithTimeout('https://api.ip.sb/geoip', undefined, 5000);
        if (res.ok) { const data = await res.json(); if (data.ip) return data.ip; }
        throw new Error('no ip');
      },
      // ipinfo.io — 国内可达、支持 CORS
      async () => {
        const res = await fetchWithTimeout('https://ipinfo.io/json', undefined, 5000);
        if (res.ok) { const data = await res.json(); if (data.ip) return data.ip; }
        throw new Error('no ip');
      },
      // freeipapi.com — 国内可达、支持 CORS
      async () => {
        const res = await fetchWithTimeout('https://freeipapi.com/api/json', undefined, 5000);
        if (res.ok) { const data = await res.json(); if (data.ipAddress) return data.ipAddress; }
        throw new Error('no ip');
      },
      // ipify 作为最后降级（需代理才可达）
      async () => {
        const res = await fetchWithTimeout('https://api64.ipify.org?format=json', undefined, 5000);
        if (res.ok) { const data = await res.json(); if (data.ip) return data.ip; }
        throw new Error('no ip');
      },
    ];
    for (const getIP of fallbackAPIs) {
      try {
        const ip = await getIP();
        if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
          ipv4 = ip;
          base.desc = '访问国内网站所使用的IP（国内服务不可用，结果可能与国外IP相同）';
          break;
        }
      } catch {
        // 继续尝试下一个
      }
    }
  }

  // 异步尝试获取 IPv6
  ipv6 = await tryGetIPv6();

  if (ipv4) {
    const geo = await fetchGeo(ipv4);
    const location = geo.city ? `${geo.country} ${geo.city}` : geo.country;
    return { ...base, ip: ipv4, ipv6, location, status: 'success' };
  }

  return { ...base, ip: '获取失败', location: '未知', status: 'error' };
}

// 国外 IP：使用海外 IP 服务（代理分流下走代理线路，拿到代理出口 IP）
async function getForeignIP(): Promise<IPSourceResult> {
  const base = {
    id: 'foreign',
    name: '国外 IP',
    desc: '访问国外网站所使用的IP',
    color: 'from-blue-500 to-cyan-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    icon: '🌍',
  };

  let ip = '';

  // 依次尝试多个 API（优先国内可达的，海外服务需代理才可达）
  const apis: Array<() => Promise<string>> = [
    // ipify（经典海外 IP 服务，需代理）
    async () => {
      const res = await fetchWithTimeout('https://api64.ipify.org?format=json', undefined, 5000);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      if (!data.ip) throw new Error('no ip');
      return data.ip;
    },
    // ip.sb（国内可达、支持 CORS）
    async () => {
      const res = await fetchWithTimeout('https://api.ip.sb/geoip', undefined, 5000);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      if (!data.ip) throw new Error('no ip');
      return data.ip;
    },
    // ipinfo.io（国内可达、支持 CORS）
    async () => {
      const res = await fetchWithTimeout('https://ipinfo.io/json', undefined, 5000);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      if (!data.ip) throw new Error('no ip');
      return data.ip;
    },
    // ip-api.com（国内可达、HTTP、支持 CORS）
    async () => {
      const res = await fetchWithTimeout('http://ip-api.com/json/?lang=zh-CN', undefined, 5000);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      if (data.status !== 'success' || !data.query) throw new Error('no ip');
      return data.query;
    },
    // freeipapi.com
    async () => {
      const res = await fetchWithTimeout('https://freeipapi.com/api/json', undefined, 5000);
      if (!res.ok) throw new Error('bad response');
      const data = await res.json();
      if (!data.ipAddress) throw new Error('no ip');
      return data.ipAddress;
    },
  ];

  for (const fn of apis) {
    try {
      const result = await fn();
      if (result && /^\d+\.\d+\.\d+\.\d+$/.test(result)) {
        ip = result;
        break;
      }
    } catch {
      // 继续尝试下一个
    }
  }

  if (!ip) {
    return { ...base, ip: '获取失败', location: '未知', status: 'error' };
  }

  const geo = await fetchGeo(ip);
  const location = geo.city ? `${geo.country} ${geo.city}` : geo.country;

  // 异步尝试获取 IPv6
  const ipv6 = await tryGetIPv6();

  return { ...base, ip, ipv6, location, status: 'success' };
}

// 谷歌 IP：通过 Google DoH API 探测 quad9 出口IP
async function getGoogleIP(): Promise<IPSourceResult> {
  const base = {
    id: 'google',
    name: '谷歌 IP',
    desc: '访问谷歌、Facebook、Twitter等网站所使用的IP',
    color: 'from-green-500 to-emerald-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    icon: '🔍',
  };

  let ipv4 = '';
  let ipv6: string | undefined;

  // 通过 Google DoH 查 A 记录获取 IPv4
  try {
    const res = await fetchWithTimeout('https://dns.google/resolve?name=myip.quad9.net&type=A', undefined, 6000);
    if (res.ok) {
      const data = await res.json();
      const answers: { data: string }[] = data.Answer || [];
      const ipAnswer = answers.find((a) => /^\d+\.\d+\.\d+\.\d+$/.test(a.data));
      if (ipAnswer) {
        ipv4 = ipAnswer.data;
      }
    }
  } catch (e) {
    console.warn('Google IP via DoH failed:', e);
  }

  // 通过 Google DoH 查 AAAA 记录获取 IPv6
  try {
    const res = await fetchWithTimeout('https://dns.google/resolve?name=myip.quad9.net&type=AAAA', undefined, 5000);
    if (res.ok) {
      const data = await res.json();
      const answers: { data: string }[] = data.Answer || [];
      const ip6Answer = answers.find((a) => isIPv6(a.data));
      if (ip6Answer) {
        ipv6 = ip6Answer.data;
      }
    }
  } catch {
    // IPv6 查询失败不影响整体
  }

  // 降级方案：尝试多个 API
  if (!ipv4) {
    const fallbackAPIs: Array<() => Promise<string>> = [
      async () => {
        const res = await fetchWithTimeout('https://api64.ipify.org?format=json', undefined, 5000);
        if (res.ok) { const d = await res.json(); if (d.ip) return d.ip; }
        throw new Error('no ip');
      },
      async () => {
        const res = await fetchWithTimeout('https://api.ip.sb/geoip', undefined, 5000);
        if (res.ok) { const d = await res.json(); if (d.ip) return d.ip; }
        throw new Error('no ip');
      },
      async () => {
        const res = await fetchWithTimeout('https://ipinfo.io/json', undefined, 5000);
        if (res.ok) { const d = await res.json(); if (d.ip) return d.ip; }
        throw new Error('no ip');
      },
      async () => {
        const res = await fetchWithTimeout('http://ip-api.com/json/?lang=zh-CN', undefined, 5000);
        if (res.ok) { const d = await res.json(); if (d.status === 'success' && d.query) return d.query; }
        throw new Error('no ip');
      },
      async () => {
        const res = await fetchWithTimeout('https://freeipapi.com/api/json', undefined, 5000);
        if (res.ok) { const d = await res.json(); if (d.ipAddress) return d.ipAddress; }
        throw new Error('no ip');
      },
    ];
    for (const fn of fallbackAPIs) {
      try {
        const result = await fn();
        if (result && /^\d+\.\d+\.\d+\.\d+$/.test(result)) {
          ipv4 = result;
          base.desc = '访问谷歌、Facebook、Twitter等网站所使用的IP（仅供参考）';
          break;
        }
      } catch { /* 继续 */ }
    }
  }

  if (!ipv6) {
    ipv6 = await tryGetIPv6();
  }

  if (ipv4) {
    const geo = await fetchGeo(ipv4);
    const location = geo.city ? `${geo.country} ${geo.city}` : geo.country;
    return { ...base, ip: ipv4, ipv6, location, status: 'success' };
  }

  return { ...base, ip: '无法检测', location: '未知', status: 'error' };
}

// ── 组件 ───────────────────────────────────────────────────

const INITIAL_RESULTS: IPSourceResult[] = [
  {
    id: 'domestic', name: '国内 IP', desc: '访问国内网站所使用的IP',
    ip: '检测中...', location: '检测中...', status: 'loading',
    color: 'from-red-500 to-orange-400', bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30', textColor: 'text-red-400', icon: '🇨🇳',
  },
  {
    id: 'foreign', name: '国外 IP', desc: '访问国外网站所使用的IP',
    ip: '检测中...', location: '检测中...', status: 'loading',
    color: 'from-blue-500 to-cyan-400', bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30', textColor: 'text-blue-400', icon: '🌍',
  },
  {
    id: 'google', name: '谷歌 IP', desc: '访问谷歌、Facebook、Twitter等网站所使用的IP',
    ip: '检测中...', location: '检测中...', status: 'loading',
    color: 'from-green-500 to-emerald-400', bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30', textColor: 'text-green-400', icon: '🔍',
  },
];

function DetailCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string }) {
  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-blue-400" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="text-white font-semibold truncate">{value || '-'}</p>
    </div>
  );
}

export default function IPInfoSection() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<IPSourceResult[]>(INITIAL_RESULTS);
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedIP, setSelectedIP] = useState<IPSourceResult | null>(null);

  const loadAllIPs = async () => {
    setLoading(true);
    setResults(INITIAL_RESULTS);
    setSelectedIP(null);

    // 逐个检测并立即更新状态，避免一个 API 卡死全部"检测中"
    const detectors: Array<{ id: string; fn: () => Promise<IPSourceResult> }> = [
      { id: 'domestic', fn: getDomesticIP },
      { id: 'foreign', fn: getForeignIP },
      { id: 'google', fn: getGoogleIP },
    ];

    const promises = detectors.map(async ({ id, fn }) => {
      const result = await fn();
      // 每个检测完成后立即更新对应卡片
      setResults(prev => prev.map(r => r.id === id ? result : r));
      return result;
    });

    const settled = await Promise.allSettled(promises);
    const allResults = settled.map((s, i) =>
      s.status === 'fulfilled' ? s.value : { ...INITIAL_RESULTS[i], status: 'error' as const, ip: '获取失败', location: '未知' }
    );

    const firstSuccess = allResults.find(r => r.status === 'success');
    if (firstSuccess) setSelectedIP(firstSuccess);

    setLoading(false);
  };

  useEffect(() => {
    loadAllIPs();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* 标题 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          全方位查询您的IP地址
        </h1>
        <p className="text-slate-400">从中国、国外、谷歌三个维度检测您的IP</p>
      </motion.div>

      {/* 三个 IP 检测卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => result.status === 'success' && setSelectedIP(result)}
            className={`relative overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
              selectedIP?.id === result.id
                ? `${result.borderColor} ${result.bgColor} ring-2 ring-offset-2 ring-offset-slate-900 ${result.borderColor.replace('/30', '/50')}`
                : 'border-slate-700/50 bg-slate-800/50 hover:border-slate-600'
            }`}
          >
            {/* 顶部渐变条 */}
            <div className={`h-1.5 bg-gradient-to-r ${result.color}`} />

            <div className="p-5">
              {/* 标题行 */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{result.icon}</span>
                <div>
                  <h3 className="text-white font-semibold text-lg">{result.name}</h3>
                  <p className="text-slate-400 text-xs">{result.desc}</p>
                </div>
              </div>

              {/* IP 地址 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">IPv4 地址</span>
                  {result.status === 'success' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(result.ip, result.id);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                    >
                      {copied === result.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                  )}
                </div>

                <code className={`block text-xl font-mono font-bold truncate ${
                  result.status === 'success' ? result.textColor :
                  result.status === 'error' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {result.ip}
                </code>

                {/* IPv6 地址 */}
                {result.status === 'success' && result.ipv6 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">IPv6 地址</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(result.ipv6!, `${result.id}-v6`);
                        }}
                        className="p-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        {copied === `${result.id}-v6` ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                    <code className={`block text-sm font-mono truncate ${result.textColor} opacity-80`}>
                      {result.ipv6}
                    </code>
                  </div>
                )}

                {/* 位置信息 */}
                {result.status === 'success' && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{result.location}</span>
                  </div>
                )}

                {/* 状态指示 */}
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    result.status === 'success' ? 'bg-green-400' :
                    result.status === 'error' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                  }`} />
                  <span className="text-xs text-slate-500">
                    {result.status === 'success' ? '检测成功' :
                     result.status === 'error' ? '检测失败' : '检测中...'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 选中的 IP 详情 */}
      {selectedIP && selectedIP.status === 'success' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{selectedIP.icon}</span>
              <div>
                <h3 className="text-white font-semibold">{selectedIP.name} 详情</h3>
                <p className="text-slate-400 text-sm">{selectedIP.ip}</p>
              </div>
            </div>
            <button
              onClick={loadAllIPs}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              重新检测
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailCard icon={Globe} label="国家/地区" value={selectedIP.location.split(' ')[0]} />
            <DetailCard icon={MapPin} label="城市" value={selectedIP.location.split(' ')[1] || '未知'} />
            <DetailCard icon={Server} label="IPv4 地址" value={selectedIP.ip} />
            <DetailCard icon={Shield} label="类型" value={selectedIP.name} />
          </div>
          {selectedIP.ipv6 && (
            <div className="mt-4 grid grid-cols-1">
              <DetailCard icon={Server} label="IPv6 地址" value={selectedIP.ipv6} />
            </div>
          )}

          {/* 外部链接 */}
          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t border-slate-700/50">
            <a
              href={`https://www.ipshudi.com/${selectedIP.ip}.htm`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-sm text-slate-300"
            >
              <ExternalLink className="w-4 h-4" />
              IP 归属地查询
            </a>
            <a
              href={`https://ip.sb/whois/${selectedIP.ip}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-sm text-slate-300"
            >
              <ExternalLink className="w-4 h-4" />
              Whois 查询
            </a>
            <a
              href={`https://ip.sb/ip/${selectedIP.ip}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 transition-colors text-sm text-slate-300"
            >
              <ExternalLink className="w-4 h-4" />
              IP 信息查询
            </a>
          </div>
        </motion.div>
      )}

      {/* 说明 */}
      <div className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-blue-400" />
          检测说明
        </h4>
        <ul className="text-slate-400 text-sm space-y-1 list-disc list-inside">
          <li><span className="text-red-400">国内 IP</span>：优先通过中国 IP 服务检测（需服务支持 CORS），降级时可能和国外 IP 相同</li>
          <li><span className="text-blue-400">国外 IP</span>：通过海外 IP 服务检测（代理分流下走代理线路）</li>
          <li><span className="text-green-400">谷歌 IP</span>：通过 Google DNS-over-HTTPS 探测出口 IP</li>
          <li>如果使用了分流代理（如 Clash/V2Ray），国内和国外 IP 可能不同；直连网络下三者通常相同</li>
        </ul>
      </div>
    </div>
  );
}
