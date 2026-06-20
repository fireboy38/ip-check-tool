import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Shield, Globe, ShieldCheck, Server, Zap, Activity, ArrowDown } from 'lucide-react';
import IPInfoSection from '../components/IPInfoSection';
import ConnectivityTest from '../components/ConnectivityTest';
import WebRTCSection from '../components/WebRTCSection';
import DNSSection from '../components/DNSSection';
import SpeedTestSection from '../components/SpeedTestSection';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setRefreshKey(k => k + 1);
    setTimeout(() => setRefreshing(false), 1200);
  };

  const features = [
    { icon: Globe,      label: 'IP 检测',  color: 'from-blue-500 to-cyan-400' },
    { icon: Activity,   label: '连通性',   color: 'from-emerald-500 to-teal-400' },
    { icon: Shield,     label: 'WebRTC',   color: 'from-violet-500 to-purple-400' },
    { icon: Server,     label: 'DNS 泄漏', color: 'from-amber-500 to-orange-400' },
    { icon: Zap,        label: '网速',     color: 'from-pink-500 to-rose-400' },
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* ─────────── Hero ─────────── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-4xl glass-card p-8 sm:p-12 lg:p-16"
      >
        {/* Decorative gradient ring */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-50 blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.6) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full opacity-40 blur-3xl"
             style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.5) 0%, transparent 70%)' }} />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-soft text-xs font-medium text-secondary mb-5"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
              </span>
              全部检测在浏览器本地完成 · 不上传任何数据
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
            >
              一站式
              <span className="text-gradient-aurora bg-[length:200%_auto] animate-gradient-pan"> 网络诊断 </span>
              与隐私检测
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 text-base sm:text-lg text-secondary leading-relaxed"
            >
              从国内、海外、谷歌三个维度检测 IP 地址；测试网络连通性、WebRTC 泄漏、DNS 泄漏、网速；
              查看浏览器指纹。所有功能完全免费、无需登录。
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-7 flex flex-wrap items-center gap-3"
            >
              <button
                onClick={handleRefresh}
                className="btn-primary inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                重新检测全部
              </button>
              <a
                href="#ip-section"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl glass-panel border border-soft text-sm font-medium text-primary hover:border-strong transition-all"
              >
                <ArrowDown className="w-4 h-4" />
                查看检测结果
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="mt-8 flex flex-wrap items-center gap-2.5"
            >
              {features.map((f, i) => (
                <div
                  key={f.label}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel border border-soft text-xs font-medium text-secondary"
                >
                  <span className={`w-5 h-5 rounded-md bg-gradient-to-br ${f.color} flex items-center justify-center`}>
                    <f.icon className="w-3 h-3 text-white" />
                  </span>
                  {f.label}
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ─────────── Sections ─────────── */}
      <div id="ip-section" className="scroll-mt-24">
        <IPInfoSection key={`ip-${refreshKey}`} />
      </div>

      <ConnectivityTest key={`conn-${refreshKey}`} />

      <WebRTCSection key={`webrtc-${refreshKey}`} />

      <DNSSection key={`dns-${refreshKey}`} />

      <SpeedTestSection key={`speed-${refreshKey}`} />
    </div>
  );
}
