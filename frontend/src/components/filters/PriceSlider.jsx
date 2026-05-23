import { Range, getTrackBackground } from 'react-range';
import { money } from '../../utils/productUtils';

const MIN = 0;
const MAX = 5000;
const STEP = 50;

const clamp = (value) => Math.min(MAX, Math.max(MIN, Number(value) || 0));

const PriceSlider = ({ value, onChange }) => {
  const updateMin = (nextValue) => {
    const next = clamp(nextValue);
    onChange([Math.min(next, value[1] - STEP), value[1]]);
  };

  const updateMax = (nextValue) => {
    const next = clamp(nextValue);
    onChange([value[0], Math.max(next, value[0] + STEP)]);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white p-4 shadow-inner dark:border-amber-300/10 dark:from-amber-400/10 dark:to-white/5">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-200">Price range</p>
        <div className="mt-2 flex items-center gap-2 text-lg font-black text-gray-950 dark:text-white">
          <span>{money(value[0])}</span>
          <span className="h-px flex-1 bg-amber-300/80" />
          <span>{money(value[1])}</span>
        </div>
      </div>

      <div className="px-2 py-3">
        <Range
          values={value}
          step={STEP}
          min={MIN}
          max={MAX}
          onChange={onChange}
          renderTrack={({ props, children }) => (
            <div
              {...props}
              className="h-2 w-full rounded-full"
              style={{
                ...props.style,
                background: getTrackBackground({
                  values: value,
                  colors: ['#e5e7eb', '#d4af37', '#111827'],
                  min: MIN,
                  max: MAX,
                }),
              }}
            >
              {children}
            </div>
          )}
          renderThumb={({ props, index }) => {
            const { key, ...thumbProps } = props;
            return (
              <div
                key={key}
                {...thumbProps}
                className="grid h-6 w-6 place-items-center rounded-full border-2 border-white bg-gray-950 shadow-xl shadow-amber-500/30 outline-none ring-2 ring-amber-400 transition-transform hover:scale-110 active:scale-95"
                aria-label={index === 0 ? 'Minimum price' : 'Maximum price'}
              >
                <span className="h-2 w-2 rounded-full bg-brand-yellow" />
              </div>
            );
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Min</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={STEP}
            value={value[0]}
            onChange={(event) => updateMin(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">Max</span>
          <input
            type="number"
            min={MIN}
            max={MAX}
            step={STEP}
            value={value[1]}
            onChange={(event) => updateMax(event.target.value)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-black outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-200/60 dark:border-white/10 dark:bg-white/5 dark:text-white"
          />
        </label>
      </div>
    </div>
  );
};

export default PriceSlider;
