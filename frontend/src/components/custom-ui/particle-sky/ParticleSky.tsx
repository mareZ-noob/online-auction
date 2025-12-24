import React from "react";
import { motion } from "framer-motion";

type Particle = {
  id: number;
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  xOffset: number;
  yOffset: number;
  opacity: number;
};

const rand = (min: number, max: number) => Math.random() * (max - min) + min;

export default function ParticleSky({ count = 40 }: { count?: number }) {
  const particles = React.useMemo<Particle[]>(() => {
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: `${rand(0, 100)}%`,
      top: `${rand(0, 100)}%`,
      size: Math.round(rand(1, 4)),
      delay: rand(0, 8),
      duration: rand(6, 24),
      xOffset: rand(-20, 20),
      yOffset: rand(-10, 10),
      opacity: rand(0.4, 1),
    }));
  }, [count]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0 }}
          animate={{
            x: [0, p.xOffset, 0],
            y: [0, p.yOffset, 0],
            opacity: [0, p.opacity, 0.1, p.opacity],
            scale: [1, 1.3, 1],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: p.duration,
            delay: p.delay,
            ease: "linear",
          }}
          style={{
            left: p.left,
            top: p.top,
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            position: "absolute",
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 6px rgba(255,255,255,0.45)",
          }}
        />
      ))}
      {/* subtle large glow */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.06, 0], scale: [1, 1.02, 1] }}
        transition={{ repeat: Infinity, duration: 30, ease: "easeInOut" }}
        className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent"
        style={{ pointerEvents: "none" }}
      />
    </div>
  );
}
