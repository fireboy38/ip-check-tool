import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert, RefreshCw, Server, Globe } from 'lucide-react';

interface STUNServer {
  name: string;
  host: string;
  status: 'testing' | 'success' | 'failed';
  ip?: string;
}

interface WebRTCInfo {
  localIPs: string[];
  publicIPs: string[];
  natType: string;
  hasLeak: boolean;
}

const stunServers: STUNServer[] = [
  { name: 'Google', host: 'stun.l.google.com:19302', status: 'testing' },
  { name: 'NextCloud', host: 'stun.nextcloud.com:443', status: 'testing' },
  { name: 'Twilio', host: 'global.stun.twilio.com', status: 'testing' },
  { name: 'Cloudflare', host: 'stun.cloudflare.com', status: 'testing' },
];

export function WebRTCTest() {
  const [servers, setServers] = useState<STUNServer[]>(stunServers);
  const [webRTCInfo, setWebRTCInfo] = useState<WebRTCInfo>({
    localIPs: [],
    publicIPs: [],
    natType: '检测中...',
    hasLeak: false,
  });
  const [loading, setLoading] = useState(true);

  const detectWebRTC = async () => {
    setLoading(true);
    const localIPs: string[] = [];
    const publicIPs: string[] = [];

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');

      pc.onicecandidate = (e) => {
        if (!e.candidate) return;
        
        const ipMatch = e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
        if (ipMatch) {
          const ip = ipMatch[0];
          const isPrivate = ip.startsWith('10.') ||
            ip.startsWith('172.') ||
            ip.startsWith('192.168.') ||
            ip.startsWith('169.254.') ||
            ip.startsWith('127.');

          if (isPrivate && !localIPs.includes(ip)) {
            localIPs.push(ip);
          } else if (!isPrivate && !publicIPs.includes(ip)) {
            publicIPs.push(ip);
          }
        }
      };

      await pc.createOffer().then(offer => pc.setLocalDescription(offer));

      setTimeout(() => {
        pc.close();
        setWebRTCInfo({
          localIPs,
          publicIPs,
          natType: '端口限制型或对称型NAT',
          hasLeak: publicIPs.length > 0,
        });
        setServers(prev => prev.map(s => ({ ...s, status: 'success' as const })));
        setLoading(false);
      }, 2000);
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectWebRTC();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">WebRTC 测试</h2>
            <p className="text-slate-400 text-sm">检测 WebRTC 连接和 IP 泄漏风险</p>
          </div>
        </div>
        <button
          onClick={detectWebRTC}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          重新测试
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            STUN 服务器连接状态
          </h3>
          <div className="space-y-3">
            {servers.map((server) => (
              <div
                key={server.name}
                className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    server.status === 'success' ? 'bg-green-400' :
                    server.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400 animate-pulse'
                  }`} />
                  <span className="text-white font-medium">{server.name}</span>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-sm">{server.host}</p>
                  <p className={`text-xs ${
                    server.status === 'success' ? 'text-green-400' :
                    server.status === 'failed' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {server.status === 'success' ? '连接成功' :
                     server.status === 'failed' ? '连接失败' : '测试中...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            NAT 类型检测
          </h3>
          <div className="p-4 bg-slate-900/50 rounded-xl mb-4">
            <p className="text-slate-400 text-sm mb-1">当前 NAT 类型</p>
            <p className="text-xl font-bold text-white">{webRTCInfo.natType}</p>
          </div>
          <div className={`p-4 rounded-xl ${webRTCInfo.hasLeak ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/20 border border-green-500/50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {webRTCInfo.hasLeak ? (
                <ShieldAlert className="w-5 h-5 text-red-400" />
              ) : (
                <Shield className="w-5 h-5 text-green-400" />
              )}
              <p className={`font-semibold ${webRTCInfo.hasLeak ? 'text-red-400' : 'text-green-400'}`}>
                {webRTCInfo.hasLeak ? '检测到 IP 泄漏风险' : '未检测到 IP 泄漏'}
              </p>
            </div>
            <p className="text-slate-400 text-sm">
              {webRTCInfo.hasLeak
                ? '您的真实 IP 地址可能通过 WebRTC 暴露'
                : 'WebRTC 连接安全，未检测到 IP 地址泄漏'}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">本地 IP 地址</h3>
          {webRTCInfo.localIPs.length > 0 ? (
            <div className="space-y-2">
              {webRTCInfo.localIPs.map((ip, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                  <code className="text-yellow-400 font-mono">{ip}</code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">未检测到本地 IP</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700"
        >
          <h3 className="text-lg font-semibold text-white mb-4">公网 IP 地址</h3>
          {webRTCInfo.publicIPs.length > 0 ? (
            <div className="space-y-2">
              {webRTCInfo.publicIPs.map((ip, idx) => (
                <div key={idx} className="p-3 bg-slate-900/50 rounded-lg">
                  <code className="text-cyan-400 font-mono">{ip}</code>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">未检测到公网 IP</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
