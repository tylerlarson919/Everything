import React from "react";

const HealthBar = ({ percent }: { percent: number }) => {
  return (
    <div className="w-full bg-gray-900/50 rounded-lg h-4 overflow-hidden border border-red-400/30 backdrop-blur-sm p-0.5 relative">
      <div
        className="bg-gradient-to-r from-red-600 to-red-400 h-full rounded transition-all duration-300"
        style={{ width: `${percent}%` }}
      >
        {percent > 30 && (
          <div className="absolute top-0 left-0 w-full h-full flex items-center">
            {[...Array(Math.min(10, Math.floor(percent / 10)))].map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-full bg-red-300/20" 
                style={{marginLeft: `${i * 10}%`}}
              ></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthBar;