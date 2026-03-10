import React from 'react';

export const LocationMap: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  return (
    <div className="w-full h-64 rounded-[2rem] overflow-hidden shadow-inner border border-slate-200 mt-6 relative group">
      <iframe 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        scrolling="no" 
        marginHeight={0} 
        marginWidth={0} 
        src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        title="User Location"
        className="grayscale group-hover:grayscale-0 transition-all duration-700"
      ></iframe>
      <div className="absolute inset-0 pointer-events-none border-[6px] border-white/50 rounded-[2rem]"></div>
    </div>
  );
};
