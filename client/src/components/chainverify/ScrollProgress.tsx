import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Slim top-of-page progress bar tied to scroll position.
 * Uses a spring for a smooth, premium feel.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[3px] origin-left z-[60]"
    >
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(90deg, var(--cv-cyan), var(--cv-purple), var(--cv-orange))",
          boxShadow: "0 0 12px rgba(181,86,43,0.45)",
        }}
      />
    </motion.div>
  );
}