import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import IPInfoSection from '../components/IPInfoSection';
import ConnectivityTest from '../components/ConnectivityTest';
import WebRTCSection from '../components/WebRTCSection';
import DNSSection from '../components/DNSSection';
import SpeedTestSection from '../components/SpeedTestSection';

export default function Home() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-end"
      >
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">刷新</span>
        </button>
      </motion.div>

      <IPInfoSection />
      <ConnectivityTest />
      <WebRTCSection />
      <DNSSection />
      <SpeedTestSection />
    </div>
  );
}
