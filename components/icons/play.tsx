import React from 'react';

interface PlayIconProps {
  className?: string;
  fill?: string;
}

const PlayIcon: React.FC<PlayIconProps> = ({ className, fill = "#e8eaed" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24px"
    width="24px"
    viewBox="0 -960 960 960"
    fill={fill}
    className={className}
  >
    <path d="M320-200v-560l440 280-440 280Z"/>
  </svg>
);

export default PlayIcon;