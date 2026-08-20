import { QRContentType, QRScanRecord } from '../types';

export function parseQRContent(rawText: string): {
  type: QRContentType;
  parsedDetails?: QRScanRecord['parsedDetails'];
} {
  const trimmed = rawText.trim();

  // URL detection
  if (/^https?:\/\//i.test(trimmed) || /^(www\.)[a-z0-9-]+(\.[a-z]{2,})+/i.test(trimmed)) {
    const url = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    return {
      type: 'url',
      parsedDetails: { url }
    };
  }

  // Wi-Fi detection (e.g. WIFI:S:MySSID;T:WPA;P:MyPassword;;)
  if (/^WIFI:/i.test(trimmed)) {
    const ssidMatch = trimmed.match(/S:([^;]+)/i);
    const passMatch = trimmed.match(/P:([^;]+)/i);
    const typeMatch = trimmed.match(/T:([^;]+)/i);
    return {
      type: 'wifi',
      parsedDetails: {
        ssid: ssidMatch ? ssidMatch[1] : undefined,
        password: passMatch ? passMatch[1] : undefined,
        authType: typeMatch ? typeMatch[1] : 'WPA'
      }
    };
  }

  // Email detection (mailto: or plain email address)
  if (/^mailto:/i.test(trimmed) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    const clean = trimmed.replace(/^mailto:/i, '');
    const [emailPart, queryPart] = clean.split('?');
    let subject: string | undefined;
    if (queryPart) {
      const params = new URLSearchParams(queryPart);
      subject = params.get('subject') || undefined;
    }
    return {
      type: 'email',
      parsedDetails: {
        email: emailPart,
        subject
      }
    };
  }

  // Phone detection (tel: or direct digits)
  if (/^tel:/i.test(trimmed) || /^\+?[0-9\s\-()]{7,20}$/.test(trimmed)) {
    const phone = trimmed.replace(/^tel:/i, '').trim();
    return {
      type: 'phone',
      parsedDetails: { phone }
    };
  }

  // Geo location detection (geo:lat,lng)
  if (/^geo:/i.test(trimmed)) {
    const coords = trimmed.replace(/^geo:/i, '').split('?')[0];
    return {
      type: 'geo',
      parsedDetails: { coordinates: coords }
    };
  }

  // SMS detection (sms:number?body=...)
  if (/^sms:/i.test(trimmed) || /^smsto:/i.test(trimmed)) {
    const clean = trimmed.replace(/^(sms|smsto):/i, '');
    const [num] = clean.split('?');
    return {
      type: 'sms',
      parsedDetails: { phone: num }
    };
  }

  // Default to plain text
  return {
    type: 'text'
  };
}
