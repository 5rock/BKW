/** Shared sample catalog used by mock JSON seed and MongoDB seed. */
const SAMPLE_PRODUCTS = [
  {
    name: 'Premium Leather Watch',
    description: 'Classic luxury timepiece with genuine leather strap and sapphire crystal.',
    price: 299,
    category: 'Watches',
    images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80'],
    stock: 10,
    brand: 'Lusso',
    ratingsAverage: 4.8,
    ratingsQuantity: 24,
  },
  {
    name: 'Noise-Cancelling Wireless Headphones',
    description: 'Experience pure sound with advanced active noise cancellation technology.',
    price: 199,
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'],
    stock: 50,
    brand: 'Sonic',
    ratingsAverage: 4.5,
    ratingsQuantity: 120,
  },
  {
    name: 'Designer Silk Scarf',
    description: 'Elegant 100% pure silk scarf with hand-rolled edges.',
    price: 85,
    category: 'Accessories',
    images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'],
    stock: 15,
    brand: 'Aura',
    ratingsAverage: 4.9,
    ratingsQuantity: 45,
  },
  {
    name: 'Minimalist Floor Lamp',
    description: 'Sleek modern design with adjustable brightness and warm lighting.',
    price: 145,
    category: 'Home Decor',
    images: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80'],
    stock: 20,
    brand: 'Lume',
    ratingsAverage: 4.7,
    ratingsQuantity: 32,
  },
];

const ADMIN_ACCOUNT = {
  name: 'System Admin',
  email: 'admin@goldmarket.com',
  password: 'admin12345',
  role: 'admin',
  isVerified: true,
  provider: 'email',
};

module.exports = { SAMPLE_PRODUCTS, ADMIN_ACCOUNT };
