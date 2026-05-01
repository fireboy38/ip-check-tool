import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Server, Clock, Navigation } from 'lucide-react';
import type { IPInfo } from '../types';

interface IPInfoCardProps {
  ipInfo: IPInfo | null;
  loading: boolean;
}

export const IPInfoCard: React.FC<IPInfoCardProps> = ({ ipInfo, loading }) => {
  if (loading) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 animate-pulse">
        <div className="h-8 bg-slate-700/50 rounded mb-4 w-1/3"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
          <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
          <div className="h-4 bg-slate-700/50 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!ipInfo) {
    return (
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
        <p className="text-slate-400 text-center">无法获取IP信息</p>
      </div>
    );
  }

  const items = [
    { icon: Globe, label: 'IP地址', value: ipInfo.ip },
    { icon: MapPin, label: '地理位置', value: `${ipInfo.country} ${ipInfo.city}` },
    { icon: Server, label: 'ISP运营商', value: ipInfo.isp },
    { icon: Navigation, label: '经纬度', value: `${ipInfo.lat.toFixed(4)}, ${ipInfo.lon.toFixed(4)}` },
    { icon: Clock, label: '时区', value: ipInfo.timezone },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50"
    >
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-cyan-400" />
        IP信息详情
      </h2>
      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
          >
            <item.icon className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-sm text-white font-medium truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
