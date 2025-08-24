interface LockIconProps {
  isLocked: boolean;
  className?: string;
}

export default function LockIcon({ isLocked, className = "w-4 h-4" }: LockIconProps) {
  if (isLocked) {
    // Locked state - closed padlock
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
    );
  } else {
    // Unlocked state - open padlock
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
      </svg>
    );
  }
}