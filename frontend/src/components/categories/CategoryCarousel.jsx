import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FreeMode } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/free-mode';
import { categories } from '../../constants/marketplace';
import Reveal from '../animations/Reveal';

const CategoryCarousel = () => {
  const navigate = useNavigate();

  return (
    <section className="luxury-shell py-16">
      <Reveal className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-amber-200">Shop by Category</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">Curated departments</h2>
        </div>
        <p className="max-w-md text-sm leading-7 text-white/52">Circular premium cards, fast touch controls, and category signals for better discovery.</p>
      </Reveal>

      <Swiper modules={[FreeMode]} freeMode slidesPerView={2.2} spaceBetween={16} breakpoints={{ 640: { slidesPerView: 3.4 }, 1024: { slidesPerView: 5.2 }, 1280: { slidesPerView: 6.2 } }}>
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <SwiperSlide key={category.name}>
              <motion.button
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate(`/products?category=${encodeURIComponent(category.name)}`)}
                className="group w-full"
              >
                <div className="relative mx-auto aspect-square overflow-hidden rounded-full border border-white/10 bg-white/[0.06] p-2 shadow-2xl shadow-black/25">
                  <img src={category.image} alt={category.name} loading="lazy" className="h-full w-full rounded-full object-cover transition duration-700 group-hover:scale-110" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-t from-black/74 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-1/2 grid h-11 w-11 -translate-x-1/2 place-items-center rounded-full bg-amber-300 text-black shadow-xl">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-4 text-center text-sm font-black text-white">{category.name}</p>
                <p className="mt-1 text-center text-xs font-bold text-amber-200/70">{category.count} products</p>
              </motion.button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
};

export default CategoryCarousel;
