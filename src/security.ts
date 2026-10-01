const DEFAULT_MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB

export async function validateRequestSize(request: Request, maxBytes = DEFAULT_MAX_BODY_SIZE): Promise<boolean> {
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return false;
  }
  return true;
}

export function sanitizeHeaders(headers: Headers): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
  
  headers.forEach((value, key) => {
    if (sensitiveHeaders.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  });
  
  return sanitized;
}

export function sanitizeError(error: any): any {
  if (!error) return error;
  
  let errorMessage = error.message || String(error);
  
  // Basic regex to strip out potential api keys/tokens
  errorMessage = errorMessage.replace(/(eyJ[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]{5,}\.[a-zA-Z0-9_-]{5,})/g, '[REDACTED_JWT]');
  errorMessage = errorMessage.replace(/(sk-[a-zA-Z0-9]{20,})/g, '[REDACTED_KEY]');
  
  if (error instanceof Error) {
    return { ...error, message: errorMessage, stack: undefined };
  }
  return errorMessage;
}

export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    
    const hostname = parsed.hostname;
    // Reject basic private IPs
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      (hostname.startsWith('172.') && parseInt(hostname.split('.')[1], 10) >= 16 && parseInt(hostname.split('.')[1], 10) <= 31)
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

export function generateRequestId(): string {
  return crypto.randomUUID();
}
