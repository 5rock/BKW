import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '@/features/products/components/ProductCard';
import SectionHeading from '@/components/ui/SectionHeading';

const ProductRail = memo(({ title, eyebrow, products = [] }) => (
  <section className="luxury-shell py-24 sm:py-32 cv-auto border-t border-surface-border">
    <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
      <SectionHeading 
        title={title} 
        subtitle={eyebrow} 
        align="left"
      />
      <Link
        to="/collections"
        className="inline-flex items-center gap-3 font-sans font-medium uppercase tracking-widest text-xs text-text-secondary hover:text-color-gold transition-colors group"
      >
        View Collection 
        <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
    
    <div className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-12 scroll-smooth no-scrollbar sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-0">
      {products.map((product) => (
        <div
          key={product.id || product._id}
          className="w-[80vw] shrink-0 snap-start sm:w-[45vw] lg:w-auto"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  </section>
));

ProductRail.displayName = 'ProductRail';

export default ProductRail;
