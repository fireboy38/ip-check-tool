import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw, Wifi, Lock, Unlock, Eye, EyeOff, Radio, Globe, Server, Copy, Check, Monitor, Layers, Terminal } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';

// ICE candidate 类型
interface ICECandidate {
  type: 'host' | 'srflx' | 'relay' | 'prflx';
  protocol: 'udp' | 'tcp';
  ip: string;
  port: number;
  relatedAddress?: string;
  relatedPort?: number;
  foundation: string;
  priority: number;
  component: 'rtp' | 'rtcp';
  raw: string;
}

// STUN 服务器
interface STUNServerResult {
  name: string;
  url: string;
  status: 'checking' | 'done' | 'error';
  candidates: ICECandidate[];
  responseTime: number;
}

export default function WebRTCSection() {
  const [loading, setLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [allCandidates, setAllCandidates] = useState<ICECandidate[]>([]);
  const [localIPs, setLocalIPs] = useState<string[]>([]);
  const [publicIPs, setPublicIPs] = useState<string[]>([]);
  const [stunResults, setStunResults] = useState<STUNServerResult[]>([]);
  const [showSDP, setShowSDP] = useState(false);
  const [sdpLog, setSdpLog] = useState<string>('');
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail' | 'protection'>('overview');

  // WebRTC 支持检测
  const webrtcSupported = typeof RTCPeerConnection !== 'undefined';
  const dataChannelSupported = webrtcSupported && typeof RTCDataChannel !== 'undefined';

  const STUN_SERVERS = [
    { name: 'Google', url: 'stun:stun.l.google.com:19302' },
    { name: 'Google #2', url: 'stun:stun1.l.google.com:19302' },
    { name: 'Cloudflare', url: 'stun:stun.cloudflare.com:3478' },
    { name: 'Twilio', url: 'stun:global.stun.twilio.com:3478' },
    { name: 'Nextcloud', url: 'stun:stun.nextcloud.com:443' },
    { name: 'Mozilla', url: 'stun:stun.services.mozilla.com' },
  ];

  const copyToClipboardHandler = (text: string, id: string) => {
    copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // 解析 ICE candidate
  const parseCandidate = (candidateStr: string): ICECandidate | null => {
    const parts = candidateStr.split(' ');
    if (parts.length < 8) return null;

    const foundation = parts[0];
    const component = parseInt(parts[1]) === 1 ? 'rtp' : 'rtcp';
    const protocol = parts[2] as 'udp' | 'tcp';
    const priority = parseInt(parts[3]);
    const ip = parts[4];
    const port = parseInt(parts[5]);
    const type = parts[7] as ICECandidate['type'];

    let relatedAddress: string | undefined;
    let relatedPort: number | undefined;
    for (let i = 8; i < parts.length; i++) {
      if (parts[i] === 'raddr' && i + 1 < parts.length) relatedAddress = parts[i + 1];
      if (parts[i] === 'rport' && i + 1 < parts.length) relatedPort = parseInt(parts[i + 1]);
    }

    return { type, protocol, ip, port, relatedAddress, relatedPort, foundation, priority, component, raw: candidateStr };
  };

  // 判断是否为本地/内网 IP
  const isLocalIP = (ip: string) => {
    return ip.startsWith('10.') || ip.startsWith('192.168.') ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
      ip.startsWith('169.254.') || ip === '0.0.0.0' || ip.includes(':');
  };

  const isIPv4 = (ip: string) => /^\d+\.\d+\.\d+\.\d+$/.test(ip);

  // 执行 WebRTC 检测
  const detectWebRTC = useCallback(async () => {
    if (!webrtcSupported) return;

    setLoading(true);
    setHasRun(true);
    setAllCandidates([]);
    setLocalIPs([]);
    setPublicIPs([]);
    setStunResults([]);
    setSdpLog('');

    const allCands: ICECandidate[] = [];
    const allLocal: string[] = [];
    const allPublic: string[] = [];
    const results: STUNServerResult[] = [];
    let fullSDP = '';

    for (const server of STUN_SERVERS) {
      const startTime = performance.now();
      const serverResult: STUNServerResult = {
        name: server.name,
        url: server.url,
        status: 'checking',
        candidates: [],
        responseTime: 0,
      };

      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: server.url }],
        });
        pc.createDataChannel('');

        const candidates: ICECandidate[] = [];

        await new Promise<void>((resolve) => {
          pc.onicecandidate = (e) => {
            if (!e.candidate) {
              resolve();
              return;
            }
            const parsed = parseCandidate(e.candidate.candidate);
            if (parsed && isIPv4(parsed.ip)) {
              candidates.push(parsed);
              if (!allCands.find(c => c.ip === parsed.ip && c.type === parsed.type)) {
                allCands.push(parsed);
              }
              // 分类
              if (parsed.type === 'host' && !allLocal.includes(parsed.ip)) {
                allLocal.push(parsed.ip);
              }
              if ((parsed.type === 'srflx' || parsed.type === 'relay') && !allPublic.includes(parsed.ip)) {
                allPublic.push(parsed.ip);
              }
            }
          };

          pc.createOffer().then(offer => {
            pc.setLocalDescription(offer);
            if (offer.sdp) {
              fullSDP += `=== ${server.name} (${server.url}) ===\n${offer.sdp}\n\n`;
            }
          });

          // 3 秒超时
          setTimeout(() => {
            pc.close();
            resolve();
          }, 3000);
        });

        serverResult.candidates = candidates;
        serverResult.status = 'done';
        serverResult.responseTime = Math.round(performance.now() - startTime);
      } catch {
        serverResult.status = 'error';
        serverResult.responseTime = Math.round(performance.now() - startTime);
      }

      results.push(serverResult);
      // 逐步更新
      setStunResults([...results]);
    }

    setAllCandidates(allCands);
    setLocalIPs(allLocal);
    setPublicIPs(allPublic);
    setSdpLog(fullSDP);
    setLoading(false);
  }, [webrtcSupported]);

  useEffect(() => {
    detectWebRTC();
  }, [detectWebRTC]);

  const hasLeak = publicIPs.length > 0;
  const candidateTypes = {
    host: allCandidates.filter(c => c.type === 'host'),
    srflx: allCandidates.filter(c => c.type === 'srflx'),
    relay: allCandidates.filter(c => c.type === 'relay'),
    prflx: allCandidates.filter(c => c.type === 'prflx'),
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'host': return { label: '本地地址 (Host)', color: 'text-blue-400', bg: 'bg-blue-500/20' };
      case 'srflx': return { label: '服务器反射 (Server Reflexive)', color: 'text-red-400', bg: 'bg-red-500/20' };
      case 'relay': return { label: '中继地址 (Relay)', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
      case 'prflx': return { label: '对等反射 (Peer Reflexive)', color: 'text-purple-400', bg: 'bg-purple-500/20' };
      default: return { label: type, color: 'text-slate-400', bg: 'bg-slate-500/20' };
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500 to-purple-400 flex items-center justify-center shadow-glow-purple">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">WebRTC 泄漏测试</h2>
            <p className="text-secondary text-sm">检测浏览器 WebRTC 是否暴露真实 IP 地址</p>
          </div>
        </div>
        <button
          onClick={detectWebRTC}
          disabled={loading || !webrtcSupported}
          className="btn-primary flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? '检测中...' : '重新检测'}
        </button>
      </div>

      {/* WebRTC 不支持提示 */}
      {!webrtcSupported && (
        <div className="glass-card p-4 border-l-4 !border-l-[var(--accent-yellow)]">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-[var(--accent-yellow)] shrink-0" />
            <div>
              <p className="text-[var(--accent-yellow)] font-medium">您的浏览器不支持 WebRTC</p>
              <p className="text-secondary text-sm mt-1">无法执行 WebRTC 泄漏检测</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 导航 */}
      <div className="flex gap-1 p-1 glass-card !rounded-2xl overflow-x-auto">
        {[
          { key: 'overview', label: '检测概览', icon: Shield },
          { key: 'detail', label: '详细结果', icon: Terminal },
          { key: 'protection', label: '防护建议', icon: Lock },
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
        {/* ── 概览 ── */}
        {activeTab === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

            {/* 泄漏状态 */}
            <div className={`glass-card p-5 ${hasLeak ? '!border-l-4 !border-l-[var(--accent-red)]' : hasRun ? '!border-l-4 !border-l-[var(--accent-green)]' : ''}`}>
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  hasLeak ? 'bg-[var(--accent-red)]/15' : hasRun ? 'bg-[var(--accent-green)]/15' : 'bg-[var(--bg-input)]'
                }`}>
                  {loading ? <RefreshCw className="w-7 h-7 text-[var(--accent-blue)] animate-spin" /> :
                   hasLeak ? <Unlock className="w-7 h-7 text-[var(--accent-red)]" /> :
                   hasRun ? <Lock className="w-7 h-7 text-[var(--accent-green)]" /> :
                   <Radio className="w-7 h-7 text-tertiary" />}
                </div>
                <div>
                  <span className={`text-xl font-bold ${hasLeak ? 'text-[var(--accent-red)]' : hasRun ? 'text-[var(--accent-green)]' : 'text-secondary'}`}>
                    {loading ? '正在检测...' : hasLeak ? '检测到 WebRTC 泄漏' : hasRun ? '未检测到 IP 泄漏' : '等待检测'}
                  </span>
                  <p className="text-secondary text-sm mt-1">
                    {loading ? '正在通过 STUN 服务器收集 ICE candidates...' :
                     hasLeak ? `发现 ${publicIPs.length} 个公网 IP 通过 WebRTC 暴露` :
                     hasRun ? '您的 WebRTC 连接未暴露公网 IP' :
                     '点击"重新检测"开始'}
                  </p>
                </div>
              </div>
            </div>

            {/* IP 地址汇总 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 本地 IP */}
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Monitor className="w-4 h-4 text-[var(--accent-blue)]" />
                  <span className="text-primary font-medium text-sm">本地 IP 地址 (Host)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-blue)]/15 text-[var(--accent-blue)]">{localIPs.length}</span>
                </div>
                <p className="text-tertiary text-xs mb-3">内网地址，仅在局域网内可路由</p>
                <div className="flex flex-wrap gap-2">
                  {localIPs.length > 0 ? localIPs.map((ip, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 inner-card">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-blue)]" />
                      <code className="text-[var(--accent-blue)] font-mono text-sm">{ip}</code>
                      <button onClick={() => copyToClipboardHandler(ip, `local-${i}`)} className="p-0.5 hover:bg-[var(--bg-input)] rounded">
                        {copied === `local-${i}` ? <Check className="w-3 h-3 text-[var(--accent-green)]" /> : <Copy className="w-3 h-3 text-tertiary" />}
                      </button>
                    </div>
                  )) : (
                    <span className="text-tertiary text-sm">{loading ? '检测中...' : '未检测到'}</span>
                  )}
                </div>
              </div>

              {/* 公网 IP */}
              <div className={`glass-card p-4 ${hasLeak ? '!border-l-4 !border-l-[var(--accent-red)]' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4 text-[var(--accent-red)]" />
                  <span className="text-primary font-medium text-sm">公网 IP 地址 (Server Reflexive)</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${hasLeak ? 'bg-[var(--accent-red)]/15 text-[var(--accent-red)]' : 'bg-[var(--accent-green)]/15 text-[var(--accent-green)]'}`}>{publicIPs.length}</span>
                </div>
                <p className="text-tertiary text-xs mb-3">由 STUN 服务器发现的公网 IP，可能泄漏真实地址</p>
                <div className="flex flex-wrap gap-2">
                  {publicIPs.length > 0 ? publicIPs.map((ip, i) => (
                    <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-red)]/10 rounded-lg border border-[var(--accent-red)]/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-red)] animate-pulse" />
                      <code className="text-[var(--accent-red)] font-mono text-sm">{ip}</code>
                      <button onClick={() => copyToClipboardHandler(ip, `public-${i}`)} className="p-0.5 hover:bg-[var(--bg-input)] rounded">
                        {copied === `public-${i}` ? <Check className="w-3 h-3 text-[var(--accent-green)]" /> : <Copy className="w-3 h-3 text-tertiary" />}
                      </button>
                    </div>
                  )) : (
                    <span className={`text-sm ${hasLeak ? 'text-[var(--accent-red)]' : loading ? 'text-tertiary' : 'text-[var(--accent-green)]'}`}>
                      {loading ? '检测中...' : '无暴露 ✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* WebRTC API 支持状态 */}
            <div className="glass-card p-4">
              <h3 className="text-primary font-medium text-sm mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--accent-cyan)]" />
                WebRTC API 支持状态
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { name: 'RTCPeerConnection', supported: webrtcSupported },
                  { name: 'RTCDataChannel', supported: dataChannelSupported },
                  { name: 'getUserMedia', supported: !!(navigator.mediaDevices?.getUserMedia) },
                  { name: 'getDisplayMedia', supported: !!(navigator.mediaDevices?.getDisplayMedia) },
                ].map(api => (
                  <div key={api.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${api.supported ? 'bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20' : 'bg-[var(--accent-red)]/10 border border-[var(--accent-red)]/20'}`}>
                    {api.supported ? <CheckCircle className="w-4 h-4 text-[var(--accent-green)]" /> : <XCircle className="w-4 h-4 text-[var(--accent-red)]" />}
                    <span className={`text-xs ${api.supported ? 'text-[var(--accent-green)]' : 'text-[var(--accent-red)]'}`}>{api.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* STUN 服务器扫描进度 */}
            {stunResults.length > 0 && (
              <div className="glass-card p-4">
                <h3 className="text-primary font-medium text-sm mb-3 flex items-center gap-2">
                  <Server className="w-4 h-4 text-[var(--accent-blue)]" />
                  STUN 服务器扫描
                </h3>
                <div className="space-y-2">
                  {stunResults.map((sr) => (
                    <div key={sr.url} className={`flex items-center justify-between px-3 py-2 rounded-lg ${sr.status === 'done' ? 'bg-[var(--accent-green)]/5 border border-[var(--accent-green)]/20' : sr.status === 'error' ? 'bg-[var(--accent-red)]/5 border border-[var(--accent-red)]/20' : 'inner-card'}`}>
                      <div className="flex items-center gap-2 min-w-0">
                        {sr.status === 'checking' ? <RefreshCw className="w-3.5 h-3.5 text-[var(--accent-blue)] animate-spin shrink-0" /> :
                         sr.status === 'done' ? <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-green)] shrink-0" /> :
                         <XCircle className="w-3.5 h-3.5 text-[var(--accent-red)] shrink-0" />}
                        <span className="text-primary text-sm">{sr.name}</span>
                        <span className="text-tertiary text-xs truncate">{sr.url.replace('stun:', '')}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {sr.candidates.length > 0 && (
                          <span className="text-xs text-secondary">{sr.candidates.length} candidates</span>
                        )}
                        {sr.responseTime > 0 && (
                          <span className="text-xs text-[var(--accent-cyan)] font-mono">{sr.responseTime}ms</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 说明 */}
            <div className="glass-card p-4">
              <h3 className="text-primary font-medium mb-2 flex items-center gap-2 text-sm">
                <Wifi className="w-4 h-4 text-[var(--accent-blue)]" />
                什么是 WebRTC 泄漏？
              </h3>
              <p className="text-secondary text-sm leading-relaxed">
                WebRTC 通过 ICE 协议建立连接时会向 STUN 服务器发送请求，可能绕过 VPN/代理暴露真实公网 IP。
                <strong className="text-primary"> Host</strong> 类型为本地内网地址（风险低），
                <strong className="text-[var(--accent-red)]"> Server Reflexive</strong> 类型为 STUN 发现的公网 IP（泄漏风险高）。
              </p>
            </div>
          </motion.div>
        )}

        {/* ── 详细结果 ── */}
        {activeTab === 'detail' && (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">

            {/* 按 candidate 类型分组 */}
            {Object.entries(candidateTypes).map(([type, cands]) => {
              if (cands.length === 0) return null;
              const info = getTypeLabel(type);
              return (
                <div key={type} className="glass-card overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-soft">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.bg} ${info.color}`}>{type.toUpperCase()}</span>
                      <span className="text-primary font-medium text-sm">{info.label}</span>
                    </div>
                    <span className="text-tertiary text-xs">{cands.length} 个</span>
                  </div>
                  <div className="divide-y divide-[var(--border-soft)]">
                    {/* 去重 */}
                    {[...new Map(cands.map(c => [c.ip, c])).values()].map((c, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 hover:bg-[var(--bg-input)] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${type === 'srflx' ? 'bg-[var(--accent-red)]' : type === 'host' ? 'bg-[var(--accent-blue)]' : 'bg-[var(--accent-yellow)]'}`} />
                          <code className={`font-mono text-sm truncate ${info.color}`}>{c.ip}:{c.port}</code>
                          <span className="text-xs text-tertiary uppercase">{c.protocol}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.relatedAddress && (
                            <span className="text-xs text-tertiary hidden sm:inline">via {c.relatedAddress}:{c.relatedPort}</span>
                          )}
                          <button onClick={() => copyToClipboardHandler(c.ip, `cand-${type}-${i}`)} className="p-1 rounded hover:bg-[var(--bg-input)] transition-colors">
                            {copied === `cand-${type}-${i}` ? <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" /> : <Copy className="w-3.5 h-3.5 text-tertiary" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {allCandidates.length === 0 && (
              <div className="text-center py-12 text-tertiary glass-card">
                {loading ? '正在收集 ICE candidates...' : '暂无检测数据，请先执行检测'}
              </div>
            )}

            {/* SDP 日志 */}
            {sdpLog && (
              <div className="glass-card overflow-hidden">
                <button
                  onClick={() => setShowSDP(!showSDP)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--bg-input)] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[var(--accent-cyan)]" />
                    <span className="text-primary font-medium text-sm">SDP 日志 (Session Description Protocol)</span>
                  </div>
                  {showSDP ? <EyeOff className="w-4 h-4 text-tertiary" /> : <Eye className="w-4 h-4 text-tertiary" />}
                </button>
                <AnimatePresence>
                  {showSDP && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <pre className="px-4 py-3 text-xs font-mono text-secondary bg-[var(--bg-input)] max-h-96 overflow-y-auto whitespace-pre-wrap break-all">
                        {sdpLog}
                      </pre>
                      <div className="px-4 py-2 border-t border-soft">
                        <button
                          onClick={() => copyToClipboardHandler(sdpLog, 'sdp')}
                          className="flex items-center gap-2 text-xs text-secondary hover:text-primary transition-colors"
                        >
                          {copied === 'sdp' ? <Check className="w-3 h-3 text-[var(--accent-green)]" /> : <Copy className="w-3 h-3" />}
                          {copied === 'sdp' ? '已复制' : '复制 SDP 日志'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {/* ── 防护建议 ── */}
        {activeTab === 'protection' && (
          <motion.div key="protection" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            <div className="glass-card p-5">
              <h3 className="text-primary font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[var(--accent-yellow)]" />
                如何防止 WebRTC 泄漏
              </h3>
              <div className="space-y-3">
                {[
                  {
                    browser: 'Mozilla Firefox',
                    steps: ['地址栏输入 about:config', '搜索 media.peerconnection.enabled', '设置为 false 即可完全禁用 WebRTC'],
                    level: 'high',
                  },
                  {
                    browser: 'Google Chrome',
                    steps: ['安装 WebRTC Network Limiter 扩展', '或安装 uBlock Origin → 设置 → 勾选"阻止 WebRTC 泄漏本地 IP"', 'Chrome 无法原生禁用 WebRTC'],
                    level: 'medium',
                  },
                  {
                    browser: 'Microsoft Edge',
                    steps: ['安装 WebRTC Leak Prevent 扩展', '或在 Edge://flags 中搜索 WebRTC 相关选项'],
                    level: 'medium',
                  },
                  {
                    browser: 'Safari',
                    steps: ['偏好设置 → 网站 → 自动化', '取消 WebRTC 权限', 'Safari 对 WebRTC 有较好的默认保护'],
                    level: 'low',
                  },
                ].map((item, i) => (
                  <div key={i} className={`p-4 rounded-lg border ${
                    item.level === 'high' ? 'bg-[var(--accent-red)]/5 border-[var(--accent-red)]/20' :
                    item.level === 'medium' ? 'bg-[var(--accent-yellow)]/5 border-[var(--accent-yellow)]/20' :
                    'bg-[var(--accent-blue)]/5 border-[var(--accent-blue)]/20'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${item.level === 'high' ? 'bg-[var(--accent-red)]' : item.level === 'medium' ? 'bg-[var(--accent-yellow)]' : 'bg-[var(--accent-blue)]'}`} />
                      <span className="text-primary font-medium text-sm">{item.browser}</span>
                    </div>
                    <ol className="text-secondary text-xs space-y-1 ml-4 list-decimal list-inside">
                      {item.steps.map((s, j) => <li key={j}>{s}</li>)}
                    </ol>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-4 !border-l-4 !border-l-[var(--accent-blue)]">
              <h4 className="text-[var(--accent-blue)] font-medium mb-2">推荐工具</h4>
              <ul className="text-secondary text-sm space-y-1.5">
                <li className="flex gap-2"><span className="text-tertiary">·</span> WebRTC Network Limiter (Chrome 官方扩展)</li>
                <li className="flex gap-2"><span className="text-tertiary">·</span> uBlock Origin (启用阻止 WebRTC 选项)</li>
                <li className="flex gap-2"><span className="text-tertiary">·</span> Privacy Badger (EFF 开发的隐私保护工具)</li>
                <li className="flex gap-2"><span className="text-tertiary">·</span> 使用支持 WebRTC 泄漏保护的 VPN 服务</li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
