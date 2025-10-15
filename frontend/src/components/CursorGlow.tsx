import { motion } from 'framer-motion'
import {useState, useEffect} from 'react'
interface MousePosition {
  x: number;
  y: number;
}


const CursorGlow = () => {
      const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });
      useEffect(() => {
    let rafId: number | null = null;
    const handleMouseMove = (e: MouseEvent) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div>
          <motion.div className="fixed top-0 left-0 pointer-events-none z-50 mix-blend-screen" animate={{ x: mousePosition.x - 100, y: mousePosition.y - 100 }} transition={{ type: "tween", ease: "backOut", duration: 0.5 }}>
        <div className="w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
      </motion.div>
    </div>
  )
}

export default CursorGlow
