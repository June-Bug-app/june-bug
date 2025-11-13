import { motion } from 'framer-motion';

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -8 },
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  return (
    <motion.div
      className="flex items-center gap-2 px-16 md:px-24 py-3"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
        <img
          src="/june-bug-logo.png"
          alt="June Bug"
          className="w-full h-full rounded-full object-cover"
        />
      </div>
      <div className="bg-card border border-border rounded-2xl px-4 py-3 flex gap-1">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-2 h-2 bg-foreground/60 rounded-full"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: 'reverse',
              delay: index * 0.15,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
