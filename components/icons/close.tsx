import React from 'react';

interface CloseIconProps {
  className?: string;
  fill?: string;
}

const CloseIcon: React.FC<CloseIconProps> = ({ className, fill = "#e8eaed" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    width="24px"
    viewBox="0 -960 960 960"
    fill={fill}
    className={className}
  >
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
  </svg>
);

export default CloseIcon;