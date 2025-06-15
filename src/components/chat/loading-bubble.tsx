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
    <div className="flex items-center w-1/3 p-3 bg-accent rounded-xl shadow-lg">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-primary">
        <SparklesIcon className="h-5 w-5 animate-spin-slow" />
      </div>
      <span className="text-primary">Thinking</span>
      <div className="flex items-end space-x-2 ml-2">
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-primary opacity-90 [animation-delay:0s]" />
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-primary opacity-90 [animation-delay:0.2s]" />
        <span className="block h-1.5 w-1.5 animate-bounce rounded-full bg-primary opacity-90 [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
