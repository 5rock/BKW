export const ProductCardSkeleton = () => (
  <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
    <div className="aspect-square animate-pulse bg-gray-100 dark:bg-gray-800" />
    <div className="space-y-3 p-4">
      <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-4 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
      <div className="h-9 w-full animate-pulse rounded-full bg-gray-100 dark:bg-gray-800" />
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
