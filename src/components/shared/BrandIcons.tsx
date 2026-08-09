import React from "react";

export function HubStudioIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L20.66 7V17L12 22L3.34 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
        className="text-indigo-400"
      />
      <circle cx="12" cy="12" r="3.5" fill="currentColor" className="text-indigo-400" />
    </svg>
  );
}

export function WhatsAppBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M17.472 14.382c-.301-.15-1.781-.879-2.057-.98-.276-.1-.477-.15-.678.15-.2.3-.778.98-.954 1.18-.176.2-.351.226-.653.075-.301-.15-1.272-.469-2.423-1.496-.896-.798-1.501-1.784-1.677-2.085-.176-.3-.019-.462.132-.612.136-.135.301-.35.452-.526.15-.175.201-.3.301-.5.1-.2.05-.376-.025-.526-.075-.15-.678-1.634-.929-2.239-.245-.588-.494-.509-.678-.518-.176-.009-.377-.011-.578-.011s-.527.075-.803.376c-.276.3-1.054 1.03-1.054 2.512 0 1.482 1.079 2.914 1.23 3.115.15.2 2.124 3.243 5.145 4.548.719.311 1.28.497 1.718.636.722.23 1.378.197 1.898.12.579-.087 1.781-.728 2.032-1.431.251-.703.251-1.306.176-1.431-.076-.126-.277-.201-.578-.352z"
        fill="#25D366"
      />
      <path
        d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.98-1.39A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2a8.17 8.17 0 01-4.303-1.218l-.308-.184-2.955.825.84-2.88-.201-.32A8.163 8.163 0 013.8 12c0-4.522 3.678-8.2 8.2-8.2 4.522 0 8.2 3.678 8.2 8.2 0 4.522-3.678 8.2-8.2 8.2z"
        fill="#25D366"
      />
    </svg>
  );
}

export function YouTubeBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
        fill="#FF0000"
      />
    </svg>
  );
}

export function InstagramBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad" cx="20%" cy="100%" r="150%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="5%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="60%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="20" height="20" x="2" y="2" rx="5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="3.6" stroke="#fff" strokeWidth="1.6" />
      <circle cx="16.5" cy="7.5" r="1.1" fill="#fff" />
    </svg>
  );
}

export function XTwitterBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function BitcoinBrandIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="11" fill="#F7931A" />
      <path
        d="M15.42 10.3c.27-.9-.55-1.39-1.48-1.72l.3-.82-.76-.19-.3.8c-.2-.05-.4-.1-.61-.15l.3-.82-.76-.19-.3.82c-.17-.04-.33-.08-.5-.12l-.01-.03-1.05-.26-.2.81s.57.13.55.14c.31.08.37.28.36.45l-.36 1.45c.02.01.05.02.08.03l-.08-.02-.5 2.03c-.04.1-.14.24-.36.19.01.01-.55-.14-.55-.14l-.38.88 1 .25c.18.05.36.09.54.14l-.31.83.76.19.3-.83c.21.06.41.11.61.16l-.3.82.76.19.31-.83c1.3.25 2.28.15 2.69-.97.33-.91-.02-1.43-.68-1.77.48-.11.84-.43.94-1.08zm-1.68 2.37c-.24.95-1.84.44-2.36.31l.42-1.69c.52.13 2.18.39 1.94 1.38zm.24-2.42c-.22.86-1.55.43-1.99.31l.38-1.54c.44.11 1.83.33 1.61 1.23z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
