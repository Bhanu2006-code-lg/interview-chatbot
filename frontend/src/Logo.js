import React from "react";

export default function Logo({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>

      {/* Background rounded square */}
      <rect width="40" height="40" rx="10" fill="url(#lg1)" />

      {/* Mic body */}
      <rect x="15" y="8" width="10" height="14" rx="5" fill="white" />

      {/* Mic stand arc */}
      <path d="M10 20 Q10 30 20 30 Q30 30 30 20" stroke="white" strokeWidth="2.2" fill="none" strokeLinecap="round"/>

      {/* Mic stand line */}
      <line x1="20" y1="30" x2="20" y2="34" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
      <line x1="15" y1="34" x2="25" y2="34" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>

      {/* AI spark dot top-right */}
      <circle cx="32" cy="8" r="4" fill="#10B981" />
      <text x="32" y="11.5" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold">✦</text>
    </svg>
  );
}
