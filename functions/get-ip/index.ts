Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // 获取请求中的真实IP（从各种代理头）
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');
    const clientIP = req.headers.get('x-client-ip');
    
    let ip = '127.0.0.1';
    if (forwarded) {
      ip = forwarded.split(',')[0].trim();
    } else if (realIP) {
      ip = realIP;
    } else if (cfIP) {
      ip = cfIP;
    } else if (clientIP) {
      ip = clientIP;
    }
    
    // 如果是内网IP，说明请求来自内部网络，需要从外部服务获取公网IP
    const isPrivateIP = ip === '127.0.0.1' || 
                        ip.startsWith('192.168.') || 
                        ip.startsWith('10.') || 
                        ip.startsWith('172.');
    
    if (isPrivateIP) {
      // 尝试多个IP获取服务
      const ipServices = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://checkip.amazonaws.com/',
        'https://icanhazip.com/',
      ];
      
      for (const service of ipServices) {
        try {
          const res = await fetch(service, { 
            method: 'GET',
            headers: { 'Accept': 'application/json, text/plain' }
          });
          if (res.ok) {
            const text = await res.text();
            try {
              const data = JSON.parse(text);
              if (data.ip) {
                ip = data.ip;
                break;
              }
            } catch {
              // 纯文本响应
              const cleanIP = text.trim();
              if (cleanIP && !cleanIP.startsWith('10.') && !cleanIP.startsWith('192.168.')) {
                ip = cleanIP;
                break;
              }
            }
          }
        } catch (e) {
          console.log(`Service ${service} failed:`, e);
        }
      }
    }
    
    // 获取地理位置信息
    let geoData: any = {};
    try {
      const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (geoRes.ok) {
        geoData = await geoRes.json();
      }
    } catch (e) {
      console.log('Geo fetch failed:', e);
    }

    return new Response(JSON.stringify({
      ip,
      country: geoData.country_name || '未知',
      countryCode: geoData.country_code || '',
      region: geoData.region || '未知',
      city: geoData.city || '未知',
      lat: geoData.latitude || 0,
      lon: geoData.longitude || 0,
      timezone: geoData.timezone || '未知',
      isp: geoData.org || geoData.asn || '未知',
      org: geoData.org || '未知',
      as: geoData.asn ? `AS${geoData.asn}` : 'AS未知',
      type: geoData.type || '未知',
      proxy: geoData.proxy ? '是代理/VPN' : '不是代理或VPN',
    }), { headers: corsHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message,
      ip: '获取失败'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
