import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import ProductCard from './ProductCard';
import Reveal from '../animations/Reveal';

const ProductRail = ({ title, eyebrow, copy, products = [] }) => (
  <section className="luxury-shell py-14">
    <Reveal className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">{eyebrow}</p>
        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h2>
        {copy && <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">{copy}</p>}
      </div>
      <Link to="/products" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-amber-200">
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </Reveal>
    <Swiper modules={[FreeMode]} freeMode slidesPerView={1.35} spaceBetween={18} breakpoints={{ 640: { slidesPerView: 2.35 }, 1024: { slidesPerView: 3.35 }, 1280: { slidesPerView: 4.1 } }}>
      {products.map((product) => (
        <SwiperSlide key={product.id || product._id} className="h-auto pb-2">
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  </section>
);

export default ProductRail;
