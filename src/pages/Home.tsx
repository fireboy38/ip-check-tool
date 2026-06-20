import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
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

  return (
    <div className="space-y-8">
      {/* 顶部刷新按钮（精简，不再有 Hero 区） */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end"
      >
        <button
          onClick={handleRefresh}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-panel border border-soft hover:border-strong text-sm font-medium text-primary transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-[var(--accent-blue)] ${refreshing ? 'animate-spin' : ''}`} />
          重新检测全部
        </button>
      </motion.div>

      {/* 直接进入 IP 检测 */}
      <IPInfoSection key={`ip-${refreshKey}`} />

      <ConnectivityTest key={`conn-${refreshKey}`} />

      <WebRTCSection key={`webrtc-${refreshKey}`} />

      <DNSSection key={`dns-${refreshKey}`} />

      <SpeedTestSection key={`speed-${refreshKey}`} />
    </div>
  );
}
