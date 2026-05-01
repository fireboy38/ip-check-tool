import type { IPInfo, PingResult, DNSResult, LatencyPoint } from '../types';

export async function fetchIPInfo(): Promise<IPInfo> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
  
  return {
    ip: data.ip,
    country: data.country_name,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.timezone,
    isp: data.org || data.asn,
    org: data.org,
    as: data.asn,
    };
  } catch (error) {
    console.error('IP fetch error:', error);
    return {
      ip: '获取失败',
      country: '未知',
      countryCode: '',
      region: '未知',
      city: '未知',
      lat: 0,
      lon: 0,
      timezone: '未知',
      isp: '未知',
      org: '未知',
      as: '未知',
    };
  }
}

export async function fetchIPInfoByIP(ip: string): Promise<IPInfo> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
  
  return {
    ip: data.ip,
    country: data.country_name,
    countryCode: data.country_code,
    region: data.region,
    city: data.city,
    lat: data.latitude,
    lon: data.longitude,
    timezone: data.timezone,
    isp: data.org || data.asn,
    org: data.org,
    as: data.asn,
    };
  } catch (error) {
    console.error('IP fetch error:', error);
    return {
      ip: '获取失败',
      country: '未知',
      countryCode: '',
      region: '未知',
      city: '未知',
      lat: 0,
      lon: 0,
      timezone: '未知',
      isp: '未知',
      org: '未知',
      as: '未知',
    };
  }
}

export const PING_NODES = [
  { name: '北京', location: '中国', host: 'baidu.com' },
  { name: '上海', location: '中国', host: 'aliyun.com' },
  { name: '广州', location: '中国', host: 'tencent.com' },
  { name: '东京', location: '日本', host: 'yahoo.co.jp' },
  { name: '新加坡', location: '新加坡', host: 'google.com.sg' },
  { name: '香港', location: '中国香港', host: 'hkust.edu.hk' },
  { name: '洛杉矶', location: '美国', host: 'google.com' },
  { name: '纽约', location: '美国', host: 'cloudflare.com' },
  { name: '伦敦', location: '英国', host: 'bbc.co.uk' },
  { name: '法兰克福', location: '德国', host: 'debian.org' },
  { name: '悉尼', location: '澳大利亚', host: 'google.com.au' },
  { name: '圣保罗', location: '巴西', host: 'google.com.br' },
];

export async function pingNode(node: typeof PING_NODES[0]): Promise<PingResult> {
  const start = performance.now();
  try {
    await fetch(`https://${node.host}`, {
      mode: 'no-cors',
      cache: 'no-cache',
    });
    const latency = Math.round(performance.now() - start);
    return {
      node: node.name,
      location: node.location,
      latency,
      status: 'success',
    };
  } catch (error) {
    console.error(`Ping ${node.name} failed:`, error);
    return {
      node: node.name,
      location: node.location,
      latency: 0,
      status: 'timeout',
    };
  }
}

export function detectWebRTC(): Promise<{ localIPs: string[]; publicIPs: string[] }> {
  return new Promise((resolve) => {
    const localIPs: string[] = [];
    const publicIPs: string[] = [];
    
    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      pc.createDataChannel('');
      
      pc.onicecandidate = (e) => {
        if (!e.candidate) {
          resolve({ localIPs, publicIPs });
          return;
        }
        
        const ip = e.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
        if (ip) {
          const ipAddr = ip[0];
          if (ipAddr.startsWith('10.') || 
              ipAddr.startsWith('172.') || 
              ipAddr.startsWith('192.168.') ||
              ipAddr.startsWith('169.254.') ||
              ipAddr.startsWith('127.') ||
              ipAddr.startsWith('0.') ||
              ipAddr.startsWith('255.')) {
            if (!localIPs.includes(ipAddr)) localIPs.push(ipAddr);
          } else {
            if (!publicIPs.includes(ipAddr)) publicIPs.push(ipAddr);
          }
        }
      };
      
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
      
      setTimeout(() => {
        pc.close();
        resolve({ localIPs, publicIPs });
      }, 3000);
    } catch {
      resolve({ localIPs, publicIPs });
    }
  });
}

export async function checkDNSLeak(): Promise<DNSResult[]> {
  const resolvers = [
    { name: 'Google DNS', location: '美国', ips: ['8.8.8.8', '8.8.4.4'] },
    { name: 'Cloudflare', location: '美国', ips: ['1.1.1.1', '1.0.0.1'] },
    { name: 'OpenDNS', location: '美国', ips: ['208.67.222.222'] },
    { name: 'Quad9', location: '瑞士', ips: ['9.9.9.9'] },
    { name: '阿里DNS', location: '中国', ips: ['223.5.5.5', '223.6.6.6'] },
    { name: '腾讯DNS', location: '中国', ips: ['119.29.29.29'] },
  ];
  
  return resolvers.map(r => ({
    resolver: r.name,
    location: r.location,
    ip: r.ips[0],
  }));
}

export const GLOBAL_LATENCY_POINTS: LatencyPoint[] = [
  { lat: 39.9042, lng: 116.4074, city: '北京', latency: 0 },
  { lat: 31.2304, lng: 121.4737, city: '上海', latency: 0 },
  { lat: 23.1291, lng: 113.2644, city: '广州', latency: 0 },
  { lat: 35.6762, lng: 139.6503, city: '东京', latency: 0 },
  { lat: 1.3521, lng: 103.8198, city: '新加坡', latency: 0 },
  { lat: 22.3193, lng: 114.1694, city: '香港', latency: 0 },
  { lat: 34.0522, lng: -118.2437, city: '洛杉矶', latency: 0 },
  { lat: 40.7128, lng: -74.0060, city: '纽约', latency: 0 },
  { lat: 51.5074, lng: -0.1278, city: '伦敦', latency: 0 },
  { lat: 50.1109, lng: 8.6821, city: '法兰克福', latency: 0 },
  { lat: -33.8688, lng: 151.2093, city: '悉尼', latency: 0 },
  { lat: -23.5505, lng: -46.6333, city: '圣保罗', latency: 0 },
  { lat: 37.5665, lng: 126.9780, city: '首尔', latency: 0 },
  { lat: 13.7563, lng: 100.5018, city: '曼谷', latency: 0 },
  { lat: 55.7558, lng: 37.6173, city: '莫斯科', latency: 0 },
  { lat: 52.5200, lng: 13.4050, city: '柏林', latency: 0 },
  { lat: 48.8566, lng: 2.3522, city: '巴黎', latency: 0 },
  { lat: 41.9028, lng: 12.4964, city: '罗马', latency: 0 },
  { lat: 25.2048, lng: 55.2708, city: '迪拜', latency: 0 },
  { lat: -6.2088, lng: 106.8456, city: '雅加达', latency: 0 },
];
