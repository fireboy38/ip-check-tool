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
                  IP.SCXS.VIP
                </h1>
                <p className="text-xs text-slate-500">四川新数 IP 工具箱</p>
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
          <p className="flex items-center justify-center gap-2">
            <span>四川新数 IP 工具箱</span>
            <span className="opacity-40">|</span>
            <a
              href="https://github.com/fireboy38/ip-check-tool"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-blue-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
          </p>
          <p className="mt-2 text-xs opacity-60">
            <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">蜀ICP备20007839号</a>
            <span className="mx-2 opacity-40">|</span>
            © {new Date().getFullYear()} 四川新数
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
