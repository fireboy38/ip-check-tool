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
    // 获取客户端 IP
    const clientIP = req.headers.get('x-forwarded-for') || 
                    req.headers.get('x-real-ip') || 
                    '127.0.0.1';
    
    const ip = clientIP.split(',')[0].trim();
    
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
      source: 'foreign',
      ip,
      country: geoData.country_name || '未知',
      countryCode: geoData.country_code || '',
      region: geoData.region || '未知',
      city: geoData.city || '未知',
      isp: geoData.org || geoData.asn || '未知',
      org: geoData.org || '未知',
      as: geoData.asn ? `AS${geoData.asn}` : 'AS未知',
      type: geoData.type || '未知',
      proxy: geoData.proxy ? '是代理/VPN' : '不是代理或VPN',
      description: '访问国外网站所使用的IP',
    }), { headers: corsHeaders });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message,
      source: 'foreign',
      ip: '获取失败'
    }), {
      status: 500,
      headers: corsHeaders,
    });
  }
});
