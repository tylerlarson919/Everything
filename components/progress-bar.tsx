import React from "react";

const ProgressBar = ({ percent }: { percent: number }) => {
  return (
    <div className="w-full bg-gray-900/50 rounded-lg h-4 overflow-hidden border border-blue-400/30 backdrop-blur-sm p-0.5">
      <div
        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded transition-all duration-300 flex items-center justify-end pr-1"
        style={{ width: `${percent}%` }}
      >
        {percent > 15 && (
          <div className="flex space-x-1">
            {[...Array(Math.min(5, Math.floor(percent / 20)))].map((_, i) => (
              <div key={i} className="w-1 h-2 bg-white/70 rounded-sm"></div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;