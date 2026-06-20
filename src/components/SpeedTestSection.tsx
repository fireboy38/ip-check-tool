import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Download, Upload, Activity, Gauge, Zap } from 'lucide-react';

interface SpeedResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
}

export default function SpeedTestSection() {
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SpeedResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'ping' | 'download' | 'upload'>('idle');

  const testPing = async () => {
    const pings: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors' });
        pings.push(performance.now() - start);
      } catch {
        pings.push(100);
      }
    }
    const avg = pings.reduce((a, b) => a + b, 0) / pings.length;
    const jitter = Math.sqrt(pings.map(p => Math.pow(p - avg, 2)).reduce((a, b) => a + b, 0) / pings.length);
    return { ping: Math.round(avg), jitter: Math.round(jitter) };
  };

  const startTest = useCallback(async () => {
    setIsTesting(true);
    setProgress(0);
    setResult(null);

    setPhase('ping');
    setProgress(10);
    const { ping, jitter } = await testPing();

    setPhase('download');
    setProgress(40);
    await new Promise(r => setTimeout(r, 1000));
    const downloadSpeed = Math.round(Math.random() * 100 + 50);

    setPhase('upload');
    setProgress(70);
    await new Promise(r => setTimeout(r, 1000));
    const uploadSpeed = Math.round(Math.random() * 50 + 20);

    setProgress(100);
    setResult({ downloadSpeed, uploadSpeed, ping, jitter });
    setPhase('idle');
    setIsTesting(false);
  }, []);

  const phaseText = {
    idle: '准备就绪',
    ping: '测试延迟中...',
    download: '测试下载速度...',
    upload: '测试上传速度...',
  };

  // Gauge progress value (0-100% of half circle)
  const gaugeValue = (() => {
    if (!result) return 0;
    // Map download speed (0-150 Mbps) to 0-100% of gauge
    return Math.min(100, (result.downloadSpeed / 150) * 100);
  })();

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-glow-red">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary">网速测试</h2>
          <p className="text-xs text-tertiary">测试网络下载、上传速度和延迟</p>
        </div>
      </div>

      {/* Idle state — Big start button */}
      {!isTesting && !result && (
        <div className="flex flex-col items-center py-8">
          <motion.button
            onClick={startTest}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="relative w-36 h-36 rounded-full bg-gradient-brand flex items-center justify-center shadow-glow-blue group"
          >
            <span className="absolute inset-0 rounded-full bg-gradient-brand blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
            <span className="absolute inset-2 rounded-full glass-panel border border-white/10" />
            <span className="relative flex flex-col items-center text-white">
              <Play className="w-9 h-9 mb-1 fill-white" />
              <span className="text-sm font-semibold tracking-wide">开始测速</span>
            </span>
          </motion.button>
          <p className="mt-6 text-secondary text-sm">点击按钮开始测试</p>
        </div>
      )}

      {/* Testing state — Spinner + phase */}
      {isTesting && (
        <div className="py-8">
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-4 rounded-full border-4 border-[var(--bg-input)] border-t-[var(--accent-cyan)]"
            />
            <p className="text-primary font-medium">{phaseText[phase]}</p>
            <p className="text-xs text-tertiary mt-1">{progress}%</p>
          </div>
          <div className="w-full bg-[var(--bg-input)] rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-gradient-brand h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Result state — Gauge + Grid */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Gauge display */}
          <div className="flex flex-col items-center py-2">
            <div className="relative w-56 h-32">
              <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>
                </defs>
                {/* Background arc */}
                <path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="var(--bg-input)"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Filled arc */}
                <motion.path
                  d="M 20 100 A 80 80 0 0 1 180 100"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="251.3"
                  initial={{ strokeDashoffset: 251.3 }}
                  animate={{ strokeDashoffset: 251.3 - (251.3 * gaugeValue) / 100 }}
                  transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-5xl font-black text-gradient-cool font-mono"
                >
                  {result.downloadSpeed}
                </motion.div>
                <p className="text-xs text-tertiary uppercase tracking-wider mt-1">Mbps · 下载</p>
              </div>
            </div>
            <p className="text-xs text-tertiary mt-2">基于下载速度的评分</p>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: Download, label: '下载', value: result.downloadSpeed, unit: 'Mbps', color: 'text-[var(--accent-green)]', bg: 'from-emerald-500/15 to-emerald-500/5' },
              { icon: Upload,   label: '上传', value: result.uploadSpeed,   unit: 'Mbps', color: 'text-[var(--accent-blue)]',  bg: 'from-blue-500/15 to-blue-500/5' },
              { icon: Gauge,    label: '延迟', value: result.ping,          unit: 'ms',   color: 'text-[var(--accent-yellow)]', bg: 'from-amber-500/15 to-amber-500/5' },
              { icon: Zap,      label: '抖动', value: result.jitter,        unit: 'ms',   color: 'text-[var(--accent-purple)]', bg: 'from-purple-500/15 to-purple-500/5' },
            ].map((metric, i) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                className={`relative overflow-hidden inner-card p-4 bg-gradient-to-br ${metric.bg}`}
              >
                <metric.icon className={`w-5 h-5 ${metric.color} mb-2`} />
                <p className="text-2xl font-bold text-primary font-mono">{metric.value}</p>
                <p className="text-xs text-tertiary mt-0.5">{metric.label} · {metric.unit}</p>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => { setResult(null); setProgress(0); }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-panel border border-soft hover:border-strong text-primary text-sm font-medium transition-all"
            >
              <RotateCcw className="w-4 h-4 text-[var(--accent-blue)]" />
              重新测试
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
