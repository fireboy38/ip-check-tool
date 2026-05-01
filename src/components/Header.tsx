import React from 'react';
import { Shield, Sun, Moon, Globe, Activity, Wifi, Server, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  toggleTheme: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'ip', label: 'IP信息', icon: Globe },
  { id: 'ping', label: 'Ping测试', icon: Activity },
  { id: 'webrtc', label: 'WebRTC', icon: Wifi },
  { id: 'dns', label: 'DNS检测', icon: Server },
  { id: 'speed', label: '网速测试', icon: Zap },
];

export default function Header({ theme, toggleTheme, activeTab, setActiveTab }: HeaderProps) {
  const isDark = theme === 'dark';

  return (
    <header className={`sticky top-0 z-50 backdrop-blur-md border-b ${
      isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
              <Shield className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <span className={`text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent`}>
              IP.SCXS.VIP
            </span>
          </motion.div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? isDark 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'bg-blue-100 text-blue-700'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </nav>

          <motion.button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${
              isDark 
                ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </header>
  );
}
