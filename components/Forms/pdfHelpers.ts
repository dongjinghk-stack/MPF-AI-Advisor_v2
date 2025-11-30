
export const ENROLLMENT_FORM_URL = "https://drive.google.com/uc?export=download&id=1NVGDLBM3sxaugqB9rFzvl6sbiuKrMwBa";
export const TRANSFER_FORM_URL = "https://drive.google.com/uc?export=download&id=1zZWNz1JWvW1hmToOktU71zCn6P8CpH98";

export const fetchPdfBuffer = async (url: string): Promise<ArrayBuffer> => {
  // Array of proxy URL generators to try in sequence
  const proxies = [
    // 1. CorsProxy.io - Usually fast and handles binary data well
    (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
    
    // 2. CodeTabs - Robust alternative for binary files
    (target: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(target)}`,
    
    // 3. AllOrigins - Good fallback, using /raw to get the file directly
    // Appending timestamp to prevent caching of failed/stale responses
    (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}&t=${Date.now()}`
  ];

  // 0. Try Direct Fetch first (in case the environment allows it or CORS is permissive)
  try {
    const response = await fetch(url, { method: 'GET' });
    if (response.ok) {
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 0) return buffer;
    }
  } catch (e) {
    console.warn("Direct fetch failed, attempting proxies...");
  }

  // Loop through proxies
  for (const createProxyUrl of proxies) {
    try {
      const proxyUrl = createProxyUrl(url);
      const response = await fetch(proxyUrl);
      
      if (response.ok) {
        const buffer = await response.arrayBuffer();
        // Simple validation check (PDFs should be substantial in size)
        if (buffer.byteLength > 1000) {
          return buffer;
        }
      } else {
        console.warn(`Proxy ${proxyUrl} returned status ${response.status}`);
      }
    } catch (error) {
      console.warn(`Proxy attempt failed for logic`, error);
    }
  }

  throw new Error("All proxies failed to fetch the PDF templates. Please check your internet connection or try again later.");
};
