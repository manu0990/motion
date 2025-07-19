import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L1.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.25 12L17 14.25l-1.25-2.25L13.5 11l2.25-1.25L17 7.5l1.25 2.25L20.5 11l-2.25 1.25z"
    />
  </svg>
);

export function LoadingBubble() {
  return (
    <div className="flex flex-col gap-3 max-w-96 md:max-w-full p-3 bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border/60 transition-all duration-300 hover:shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-md ring-2 ring-primary/20">
            <SparklesIcon className="h-4 w-4 text-primary-foreground drop-shadow-sm" />
          </div>
          <span className="text-foreground/90 font-semibold text-sm md:text-base tracking-tight">Motion</span>
        </div>
        <div className="ml-auto w-2.5 md:w-3 h-2.5 md:h-3 bg-primary rounded-full animate-pulse shadow-sm ring-2 ring-primary/30"></div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="h-2 md:h-3 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-full animate-pulse shadow-sm"></div>
        <div className="h-2 md:h-3 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-full animate-pulse hidden md:block shadow-sm" style={{ animationDelay: '0.15s' }}></div>
        <div className="h-2 md:h-3 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-full animate-pulse w-11/12 shadow-sm" style={{ animationDelay: '0.3s' }}></div>
        <div className="h-2 md:h-3 bg-gradient-to-r from-muted via-muted/70 to-muted rounded-full animate-pulse w-4/5 shadow-sm" style={{ animationDelay: '0.45s' }}></div>
      </div>
    </div>
  );
}
