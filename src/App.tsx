import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Activity, Shield, Server, Zap, Wrench, Sun, Moon } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import Home from './pages/Home';
import ConnectivityTest from './components/ConnectivityTest';
import WebRTCSection from './components/WebRTCSection';
import DNSSection from './components/DNSSection';
import SpeedTestSection from './components/SpeedTestSection';
import ToolsPage from './pages/ToolsPage';

const navItems = [
  { path: '/', icon: Globe, label: 'IP信息' },
  { path: '/connectivity', icon: Activity, label: '网络连通性' },
  { path: '/webrtc', icon: Shield, label: 'WebRTC测试' },
  { path: '/dns', icon: Server, label: 'DNS泄漏测试' },
  { path: '/speed', icon: Zap, label: '网速测试' },
  { path: '/tools', icon: Wrench, label: '高级工具' },
];

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0a0f1c] text-white' : 'bg-gray-50 text-gray-900'}`}>
      <header className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[#0f172a]/95 border-slate-800' : 'bg-white/95 border-gray-200'} backdrop-blur-md`}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  IPCheck.ing
                </h1>
                <p className="text-xs text-slate-500">开源IP工具箱</p>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>

          <nav className="flex items-center gap-1 mt-4 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : isDark
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connectivity" element={<ConnectivityTest />} />
          <Route path="/webrtc" element={<WebRTCSection />} />
          <Route path="/dns" element={<DNSSection />} />
          <Route path="/speed" element={<SpeedTestSection />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </main>

      <footer className={`border-t mt-12 py-6 ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-slate-500">
          <p>IPCheck.ing - 开源网络诊断工具箱</p>
          <p className="mt-1 text-xs opacity-60">基于 React + TypeScript + Tailwind CSS 构建</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
