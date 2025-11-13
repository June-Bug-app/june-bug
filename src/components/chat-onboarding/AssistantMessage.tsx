import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AssistantMessageProps {
  children: ReactNode;
  delay?: number;
  showAvatar?: boolean;
}

export function AssistantMessage({ children, delay = 0, showAvatar = true }: AssistantMessageProps) {
  return (
    <motion.div
      className="flex items-start gap-2 px-16 md:px-24 py-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      {showAvatar ? (
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <img
            src="/june-bug-logo.png"
            alt="June Bug"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex-shrink-0" />
      )}
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </motion.div>
  );
}
