'use client';

export function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 w-full">
      <div className="dot-spinner">
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
        <div className="dot-spinner__dot" />
      </div>
      <p className="text-[#5f559a] font-semibold tracking-wide animate-pulse">Loading MindCare...</p>
    </div>
  );
}
