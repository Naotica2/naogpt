export function NaoLogo({ className = "", size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="naoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Outer abstract shape (looks like a modern stylized flower/star) */}
      <path 
        d="M50 5 C50 30 70 50 95 50 C70 50 50 70 50 95 C50 70 30 50 5 C50 C30 50 50 30 50 5 Z" 
        fill="url(#naoGradient)" 
      />
      
      {/* Inner geometric core */}
      <circle cx="50" cy="50" r="15" fill="white" opacity="0.9" />
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}
