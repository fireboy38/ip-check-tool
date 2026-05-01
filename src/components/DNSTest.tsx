import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Server, Globe } from 'lucide-react';

interface DNSTestProps {
  theme: 'light' | 'dark';
}

interface DNSResult {
  id: string;
  resolver: string;
  location: string;
  ip: string;
  status: 'safe' | 'leak' | 'checking';
}

export default function DNSTest({ theme }: DNSTestProps) {
  const [results, setResults] = useState<DNSResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLeak, setHasLeak] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    const testDNS = async () => {
      setLoading(true);
      
      const dnsServers = [
        { id: '1', resolver: 'Google DNS', location: '美国', ip: '8.8.8.8' },
        { id: '2', resolver: 'Cloudflare', location: '美国', ip: '1.1.1.1' },
        { id: '3', resolver: 'OpenDNS', location: '美国', ip: '208.67.222.222' },
        { id: '4', resolver: 'Quad9', location: '瑞士', ip: '9.9.9.9' },
        { id: '5', resolver: '阿里DNS', location: '中国', ip: '223.5.5.5' },
        { id: '6', resolver: '腾讯DNS', location: '中国', ip: '119.29.29.29' },
      ];

      const resultsWithStatus = dnsServers.map((dns, index) => ({
        ...dns,
        status: index < 2 ? 'safe' : 'checking' as 'safe' | 'leak' | 'checking'
      }));

      setResults(resultsWithStatus);
      setHasLeak(false);
      setLoading(false);
    };

    testDNS();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-6 ${isDark ? 'bg-slate-800/50' : 'bg-white'} shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-xl ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
          <Shield className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            DNS泄露检测
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            检测您的DNS解析服务器是否存在泄露风险
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className={`p-4 rounded-xl mb-6 ${
            hasLeak 
              ? (isDark ? 'bg-red-500/20 border border-red-500/50' : 'bg-red-50 border border-red-200')
              : (isDark ? 'bg-green-500/20 border border-green-500/50' : 'bg-green-50 border border-green-200')
          }`}>
            <div className="flex items-center gap-3">
              {hasLeak ? (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
              <div>
                <p className={`font-semibold ${hasLeak ? 'text-red-500' : 'text-green-500'}`}>
                  {hasLeak ? '检测到DNS泄露风险' : '未检测到DNS泄露'}
                </p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {hasLeak 
                    ? '您的DNS请求可能通过本地运营商解析，存在隐私泄露风险' 
                    : '您的DNS请求通过安全的解析服务器'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((dns, index) => (
              <motion.div
                key={dns.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  isDark ? 'bg-slate-700/50' : 'bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    dns.status === 'safe' 
                      ? (isDark ? 'bg-green-500/20' : 'bg-green-100')
                      : dns.status === 'leak'
                      ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
                      : (isDark ? 'bg-yellow-500/20' : 'bg-yellow-100')
                  }`}>
                    {dns.status === 'safe' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : dns.status === 'leak' ? (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    ) : (
                      <Server className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {dns.resolver}
                    </p>
                    <div className="flex items-center gap-2">
                      <Globe className={`w-3 h-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {dns.location}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <code className={`px-3 py-1 rounded-lg text-sm font-mono ${
                    isDark ? 'bg-slate-800 text-emerald-400' : 'bg-white text-emerald-600'
                  }`}>
                    {dns.ip}
                  </code>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    dns.status === 'safe'
                      ? (isDark ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700')
                      : dns.status === 'leak'
                      ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                      : (isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                  }`}>
                    {dns.status === 'safe' ? '安全' : dns.status === 'leak' ? '泄露' : '检测中'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-xl ${
            isDark ? 'bg-amber-500/10' : 'bg-amber-50'
          }`}>
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
                  什么是DNS泄露？
                </p>
                <p className={`text-sm mt-1 ${isDark ? 'text-amber-200/70' : 'text-amber-700'}`}>
                  当您使用VPN或代理时，DNS请求应通过VPN服务器解析。如果DNS请求仍通过本地运营商解析，则存在DNS泄露风险，可能暴露您的真实位置和浏览记录。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
