import React from 'react';

interface BackgroundVideoProps {
  url?: string;
}

const DEFAULT_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-stars-in-the-night-sky-loop-9955-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-driving-in-a-dark-tunnel-with-lights-42564-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-coffee-and-a-notebook-on-a-table-42565-large.mp4'
];

export function BackgroundVideo({ url }: BackgroundVideoProps) {
  const videoSrc = url || DEFAULT_VIDEOS[0];

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      <video
        key={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover opacity-60"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
    </div>
  );
}
