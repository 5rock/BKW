export const ProductCardSkeleton = () => (
  <div className="theme-card flex h-full flex-col overflow-hidden rounded-[1.5rem]">
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/5 dark:bg-neutral-900/50">
      <div className="shimmer absolute inset-0" />
    </div>
    <div className="flex flex-1 flex-col p-4">
      {/* Brand & Stars */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="theme-card h-3 w-16 overflow-hidden rounded-full">
          <div className="shimmer h-full w-full" />
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="theme-card h-3.5 w-3.5 rounded" />
          ))}
        </div>
      </div>
      {/* Title placeholder (min-h-[2.6rem] equivalent) */}
      <div className="space-y-1.5 py-1">
        <div className="theme-card h-4 w-full overflow-hidden rounded">
          <div className="shimmer h-full w-full" />
        </div>
        <div className="theme-card h-4 w-4/5 overflow-hidden rounded">
          <div className="shimmer h-full w-full" />
        </div>
      </div>
      {/* Category */}
      <div className="theme-card mt-2 h-3 w-1/3 overflow-hidden rounded">
        <div className="shimmer h-full w-full" />
      </div>
      {/* Bottom price + button row */}
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <div className="space-y-1.5 w-1/2">
          <div className="theme-card h-5 w-24 overflow-hidden rounded">
            <div className="shimmer h-full w-full" />
          </div>
          <div className="theme-card h-3 w-16 overflow-hidden rounded">
            <div className="shimmer h-full w-full" />
          </div>
        </div>
        <div className="theme-card h-11 w-11 shrink-0 overflow-hidden rounded-full">
          <div className="shimmer h-full w-full" />
        </div>
      </div>
    </div>
  </div>
);

export const PageSectionSkeleton = ({ rows = 8 }) => (
  <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
    {Array.from({ length: rows }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-2">
    <div className="theme-card aspect-square overflow-hidden rounded-3xl">
      <div className="shimmer h-full w-full" />
    </div>
    <div className="space-y-5">
      {Array.from({ length: 7 }).map((_, i) => (
        <div
          key={i}
          className="theme-card overflow-hidden rounded-xl"
          style={{
            height: i === 0 ? '28px' : i === 1 ? '56px' : i === 2 ? '36px' : '44px',
            width: i === 0 ? '40%' : i === 1 ? '90%' : i === 2 ? '30%' : '100%',
          }}
        >
          <div className="shimmer h-full w-full" />
        </div>
      ))}
    </div>
  </div>
);

export const CartSkeleton = () => (
  <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="theme-card flex gap-4 overflow-hidden rounded-3xl p-4">
          <div className="theme-card h-24 w-24 shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
            <div className="shimmer h-full w-full" />
          </div>
          <div className="flex flex-1 flex-col justify-center space-y-3">
            <div className="theme-card h-5 w-3/4 overflow-hidden rounded">
              <div className="shimmer h-full w-full" />
            </div>
            <div className="theme-card h-4 w-1/3 overflow-hidden rounded">
              <div className="shimmer h-full w-full" />
            </div>
            <div className="theme-card h-6 w-24 overflow-hidden rounded">
              <div className="shimmer h-full w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="theme-card h-[400px] w-full overflow-hidden rounded-[2.5rem]">
      <div className="shimmer h-full w-full" />
    </div>
  </div>
);
