// Simple favicon generator that creates a data URI based on Sweeny AI branding
export function generateFaviconSVG(): string {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1a1a1a"/>
      <circle cx="16" cy="16" r="15" fill="none" stroke="#ffffff" stroke-width="1"/>
      <path d="M10 12 Q16 8 22 12 Q20 14 16 14 Q12 14 10 16 Q12 18 16 18 Q20 18 22 20 Q16 24 10 20 Q12 18 16 18" 
            fill="#8B5CF6" 
            stroke="#ffffff" 
            stroke-width="0.5"/>
      <path d="M12 13 Q16 10 20 13 Q18 15 16 15 Q14 15 12 16 Q14 17 16 17 Q18 17 20 19 Q16 22 12 19" 
            fill="#A855F7" 
            opacity="0.8"/>
    </svg>
  `)}`;
}

export function updateFavicon(): void {
  // Update the favicon dynamically
  const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
  if (favicon) {
    favicon.href = generateFaviconSVG();
  } else {
    // Create favicon link if it doesn't exist
    const link = document.createElement('link');
    link.rel = 'icon';
    link.type = 'image/svg+xml';
    link.href = generateFaviconSVG();
    document.head.appendChild(link);
  }
}
