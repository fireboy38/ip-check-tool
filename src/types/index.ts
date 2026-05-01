export interface IPInfo {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
  isp: string;
  org: string;
  as: string;
}

export interface PingResult {
  node: string;
  location: string;
  latency: number;
  status: 'success' | 'timeout' | 'error';
}

export interface WebRTCInfo {
  localIPs: string[];
  publicIPs: string[];
  hasLeak: boolean;
}

export interface DNSResult {
  resolver: string;
  location: string;
  ip: string;
}

export interface SpeedTestResult {
  downloadSpeed: number;
  uploadSpeed: number;
  ping: number;
  jitter: number;
}

export interface LatencyPoint {
  lat: number;
  lng: number;
  city: string;
  latency: number;
}

export type Theme = 'light' | 'dark';
