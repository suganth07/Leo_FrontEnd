"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ParticleBackground() {
  const [particles, setParticles] = useState<{ x: number; y: number; size: number }[]>([]);

  useEffect(() => {
    // Generate particles only on client-side
    const generateParticles = () => {
      const newParticles = [];
      const count = Math.floor(window.innerWidth / 100); // Responsive number of particles
      
      for (let i = 0; i < count; i++) {
        newParticles.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
        });
      }
      
      setParticles(newParticles);
    };

    generateParticles();
    
    // Regenerate on window resize
    window.addEventListener("resize", generateParticles);
    return () => window.removeEventListener("resize", generateParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-primary/10 dark:bg-primary/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}rem`,
            height: `${particle.size}rem`,
          }}
          animate={{
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
          }}
          transition={{
            duration: 10 + Math.random() * 20,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
