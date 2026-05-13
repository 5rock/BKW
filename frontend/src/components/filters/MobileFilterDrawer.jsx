import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FilterSidebar from './FilterSidebar';

const MobileFilterDrawer = ({ open, onClose, resultCount, ...filterProps }) => (
  <AnimatePresence>
    {open && (
      <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <button type="button" className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={onClose} aria-label="Close filters" />
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 260 }}
          className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[2rem] bg-white shadow-2xl dark:bg-gray-950"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/10">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-600 dark:text-amber-200">Refine</p>
              <h2 className="text-lg font-black text-gray-950 dark:text-white">Filters</h2>
            </div>
            <button type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-2xl bg-gray-100 dark:bg-white/10" aria-label="Close filters">
              <X className="h-5 w-5 dark:text-white" />
            </button>
          </div>
          <div className="max-h-[calc(88vh-9rem)] overflow-y-auto p-4">
            <FilterSidebar {...filterProps} />
          </div>
          <div className="border-t border-gray-100 bg-white/95 p-4 backdrop-blur dark:border-white/10 dark:bg-gray-950/95">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-2xl bg-gray-950 py-4 text-sm font-black text-brand-yellow shadow-xl shadow-black/20 transition hover:scale-[1.01] dark:bg-brand-yellow dark:text-gray-950"
            >
              Apply filters ({resultCount})
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default MobileFilterDrawer;
