// Free IP geolocation using ipapi.co (1000 requests/day free)
export async function getLocationFromIP(ip: string) {
  try {
    // Skip localhost/private IPs
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return { city: 'Local', region: 'Local', country: 'Local', ip };
    }

    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'metrics-dashboard' }
    });
    
    if (!response.ok) {
      console.error('IP geolocation failed:', response.status);
      return { city: 'Unknown', region: 'Unknown', country: 'Unknown', ip };
    }

    const data = await response.json();
    
    return {
      ip,
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
    };
  } catch (error) {
    console.error('IP geolocation error:', error);
    return { city: 'Unknown', region: 'Unknown', country: 'Unknown', ip };
  }
}

export function getClientIP(request: Request): string {
  // Try various headers that might contain the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return '0.0.0.0';
}
