import React from 'react';

// Utility to calculate 3D highlights and shadows dynamically
const adjustColor = (color, amount) => {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  let R = parseInt(color.substring(0, 2), 16);
  let G = parseInt(color.substring(2, 4), 16);
  let B = parseInt(color.substring(4, 6), 16);

  R = Math.min(255, Math.max(0, R + amount));
  G = Math.min(255, Math.max(0, G + amount));
  B = Math.min(255, Math.max(0, B + amount));

  let RR = (R.toString(16).length === 1 ? "0" + R.toString(16) : R.toString(16));
  let GG = (G.toString(16).length === 1 ? "0" + G.toString(16) : G.toString(16));
  let BB = (B.toString(16).length === 1 ? "0" + B.toString(16) : B.toString(16));

  return (usePound ? "#" : "") + RR + GG + BB;
};

export const PushPin = ({ color = '#ce6e53', className = "w-12 h-12" }) => {
  const lightColor = adjustColor(color, 45); // Generates top-left highlight
  const darkColor = adjustColor(color, -45);  // Generates bottom-right shadow
  const id = color.replace('#', '');

  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Custom Blur for 3D Cast Shadow */}
        <filter id={`shadow-blur-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2.5" />
        </filter>

        {/* Soft blur for highlights/shine */}
        <filter id={`shine-blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" />
        </filter>

        {/* Linear Gradient for shiny plastic cylinder bodies */}
        <linearGradient id={`grad-side-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={darkColor} />
          <stop offset="25%" stopColor={lightColor} />
          <stop offset="60%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>

        {/* Radial Gradient for the domed top cap */}
        <radialGradient id={`grad-top-${id}`} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </radialGradient>
      </defs>
      <g filter={`url(#shadow-blur-${id})`} opacity="0.25">
        {/* Base Cylinder Shadow (Tight to the paper) */}
        <ellipse cx="33" cy="50" rx="13" ry="8" fill="#000" />
        {/* Top Cylinder Shadow (Offset due to height) */}
        <ellipse cx="38" cy="53" rx="12" ry="7" fill="#000" />
        {/* Stem Shadow connecting them */}
        <path d="M33 50 L38 53" stroke="#000" strokeWidth="12" />
      </g>

      <g>
        {/* Base Cylinder (Thickness: 2px based on cy difference) */}
        <ellipse cx="32" cy="46" rx="13" ry="10" fill={darkColor} />
        <path d="M19 44 L19 46 A13 10 0 0 0 45 46 L45 44 Z" fill={`url(#grad-side-${id})`} />
        <ellipse cx="32" cy="44" rx="13" ry="10" fill={color} />

        {/* Internal Cast Shadow (from Top Cylinder onto Base Cylinder) */}
        <ellipse cx="38" cy="48" rx="9" ry="7" fill="#000" opacity="0.2" filter={`url(#shadow-blur-${id})`} />

        {/* Stem (Shortened by 50% -> 5px height) */}
        <path d="M27 36 L27 44 A5 3 0 0 0 37 44 L37 36 Z" fill={`url(#grad-side-${id})`} />

        {/* Top Cylinder Side Wall */}
        <ellipse cx="32" cy="39" rx="10" ry="4" fill={darkColor} />
        <path d="M22 34 L22 39 A10 4 0 0 0 42 39 L42 34 Z" fill={`url(#grad-side-${id})`} />

        {/* Soft edge / domed top */}
        <ellipse cx="32" cy="34" rx="10" ry="6.5" fill={`url(#grad-top-${id})`} />

        {/* Shine on the lower curve of the upper ellipse */}
        <path d="M22 32 A10 6.5 0 0 0 42 34" fill="none" stroke="white" strokeWidth="1.9" opacity="0.5" strokeLinecap="round" filter={`url(#shine-blur-${id})`} />
      </g>
    </svg>
  );
};
