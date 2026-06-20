import React from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, Activity, Shield, Server, Zap, Wrench, Sun, Moon, Github, RefreshCw } from 'lucide-react';
import { useTheme } from './hooks/useTheme';
import { useGlobalRefresh } from './hooks/useGlobalRefresh';
import Home from './pages/Home';
import ConnectivityTest from './components/ConnectivityTest';
import WebRTCSection from './components/WebRTCSection';
import DNSSection from './components/DNSSection';
import SpeedTestSection from './components/SpeedTestSection';
import ToolsPage from './pages/ToolsPage';

const navItems = [
  { path: '/', icon: Globe, label: 'IP 信息', desc: '国内 / 海外 / 谷歌 IP' },
  { path: '/connectivity', icon: Activity, label: '网络连通性', desc: 'TCPing 多节点' },
  { path: '/webrtc', icon: Shield, label: 'WebRTC 测试', desc: '泄漏检测' },
  { path: '/dns', icon: Server, label: 'DNS 泄漏', desc: 'DoH 真实查询' },
  { path: '/speed', icon: Zap, label: '网速测试', desc: '下载 / 上传 / 延迟' },
  { path: '/tools', icon: Wrench, label: '高级工具', desc: '浏览器指纹' },
];

function App() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const location = useLocation();
  const { refreshing, triggerRefresh } = useGlobalRefresh();

  // 只在首页显示"重新检测全部"按钮
  const showRefreshBtn = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col text-primary">
      {/* Decorative floating blobs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-32 -left-24 w-[28rem] h-[28rem] rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/3 -right-32 w-[32rem] h-[32rem] rounded-full opacity-30 blur-3xl animate-float"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/4 w-[26rem] h-[26rem] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)' }}
        />
      </div>

      {/* ─────────── Header ─────────── */}
      <header className="sticky top-0 z-50 glass-panel border-b border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="relative w-11 h-11 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue shrink-0">
                <Globe className="w-6 h-6 text-white" />
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[var(--bg-app)]">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75" />
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-gradient-brand truncate">
                  IP.SCXS.VIP
                </h1>
                <p className="text-[11px] text-tertiary truncate">四川新数 · 网络诊断工具箱</p>
              </div>
            </motion.div>

            {/* Right side: Refresh + Theme toggle */}
            <div className="flex items-center gap-2">
              {/* 重新检测全部 — 只在首页显示 */}
              {showRefreshBtn && (
                <motion.button
                  onClick={triggerRefresh}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl glass-panel border border-soft hover:border-strong text-sm font-medium text-primary transition-all"
                  aria-label="重新检测全部"
                  title="重新检测全部"
                >
                  <RefreshCw className={`w-4 h-4 text-[var(--accent-blue)] ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">重新检测全部</span>
                </motion.button>
              )}

              {/* Theme toggle */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2.5 rounded-xl glass-panel border border-soft hover:border-strong transition-all"
                aria-label="切换主题"
              >
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="block"
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-600" />
                  )}
                </motion.span>
              </motion.button>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-1 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-gradient-brand text-white shadow-glow-blue'
                      : 'text-secondary hover:text-primary hover:bg-[var(--bg-input)]'
                  }`
                }
              >
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* ─────────── Main ─────────── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/connectivity" element={<ConnectivityTest />} />
          <Route path="/webrtc" element={<WebRTCSection />} />
          <Route path="/dns" element={<DNSSection />} />
          <Route path="/speed" element={<SpeedTestSection />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </main>

      {/* ─────────── Footer ─────────── */}
      <footer className="border-t border-soft glass-panel mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-primary">四川新数 IP 工具箱</p>
                <p className="text-xs text-tertiary">所有检测在浏览器本地完成 · 不上传任何数据</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-tertiary">
              <a
                href="https://github.com/fireboy38/ip-check-tool"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-primary transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <span className="opacity-40">·</span>
              <a
                href="https://beian.miit.gov.cn/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors"
              >
                蜀ICP备20007839号
              </a>
              <span className="opacity-40">·</span>
              <span>© {new Date().getFullYear()} 四川新数</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
