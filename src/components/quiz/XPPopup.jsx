import React from 'react';

const XPPopup = ({ show, amount = 20 }) => {
  if (!show) return null;

  return (
    <div className="absolute top-4 right-8 bg-amber-500 text-white font-mono font-bold text-xs px-3 py-1 rounded-full animate-float-up shadow-lg shadow-amber-500/20 z-10">
      +{amount} XP 🔥
    </div>
  );
};

export default XPPopup;
