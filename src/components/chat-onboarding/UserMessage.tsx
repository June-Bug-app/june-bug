import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface UserMessageProps {
  children: ReactNode;
}

export function UserMessage({ children }: UserMessageProps) {
  return (
    <motion.div
      className="flex items-start justify-end px-16 md:px-24 py-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
        <div className="text-sm">{children}</div>
      </div>
    </motion.div>
  );
}
