import { RequestHandler } from "express";

export const nhostProxy: RequestHandler = async (req, res) => {
  try {
    const targetUrl = `https://rjobnorfovzdsfuialca.auth.ap-south-1.nhost.run${req.path}`;
    
    console.log('Proxying nHost request:', {
      method: req.method,
      targetUrl,
      body: req.body
    });

    // Filter headers to avoid conflicts
    const filteredHeaders: Record<string, string> = {};
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key !== 'host' && typeof value === 'string') {
        filteredHeaders[key] = value;
      }
    });

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...filteredHeaders,
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.text();
    
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    res.status(response.status);
    
    try {
      res.json(JSON.parse(data));
    } catch {
      res.send(data);
    }
    
  } catch (error) {
    console.error('nHost proxy error:', error);
    res.status(500).json({ 
      error: 'Proxy error', 
      message: error.message,
      details: 'Failed to connect to nHost service'
    });
  }
};
