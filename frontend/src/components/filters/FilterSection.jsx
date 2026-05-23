import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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
          <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </span>
        </button>
        {action}
      </div>
      <div className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
  );
};

export default FilterSection;
