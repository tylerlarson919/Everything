import React from 'react';

interface PlusIconProps {
  className?: string;
  fill?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({ className, fill = "#e8eaed" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    width="24px"
    viewBox="0 -960 960 960"
    fill={fill}
    className={className}
  >
    <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z"/>
  </svg>
);

export default PlusIcon;

