import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FilterSection = ({ title, children, defaultOpen = true, action }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="border-b border-black/5 pb-5 last:border-b-0 last:pb-0 dark:border-white/10">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex flex-1 items-center justify-between text-left"
        >
          <span className="text-sm font-black uppercase tracking-[0.12em] text-gray-950 dark:text-white">{title}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </motion.span>
        </button>
        {action}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default FilterSection;
