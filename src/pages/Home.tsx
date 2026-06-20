import React from 'react';
import { useGlobalRefresh } from '../hooks/useGlobalRefresh';
import IPInfoSection from '../components/IPInfoSection';
import ConnectivityTest from '../components/ConnectivityTest';
import WebRTCSection from '../components/WebRTCSection';
import DNSSection from '../components/DNSSection';
import SpeedTestSection from '../components/SpeedTestSection';

export default function Home() {
  const { refreshKey } = useGlobalRefresh();

  return (
    <div className="space-y-8">
      {/* 直接进入 IP 检测 — 刷新按钮已移到顶部 header */}
      <IPInfoSection key={`ip-${refreshKey}`} />

      <ConnectivityTest key={`conn-${refreshKey}`} />

      <WebRTCSection key={`webrtc-${refreshKey}`} />

      <DNSSection key={`dns-${refreshKey}`} />

      <SpeedTestSection key={`speed-${refreshKey}`} />
    </div>
  );
}
