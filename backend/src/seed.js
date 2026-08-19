require('dotenv').config();

const { connectDB } = require('./utils/connectDB');
const { mockModel } = require('./utils/db');
const User = require('./models/User');
const Product = require('./models/Product');
const { SAMPLE_PRODUCTS, ADMIN_ACCOUNT } = require('./utils/seedData');

const seedMock = async () => {
  const MockUser = mockModel('users');
  const existing = await MockUser.findOne({ email: ADMIN_ACCOUNT.email });
  if (!existing) {
    await MockUser.create(ADMIN_ACCOUNT);
    console.log('Mock admin account created.');
  }

  const MockProduct = mockModel('products');
  const db = require('./utils/db').readDB();
  if ((db.products || []).length > 0) {
    console.log(`Clearing ${db.products.length} existing mock products...`);
    db.products = [];
    require('./utils/db').writeDB(db);
  }

  for (const product of SAMPLE_PRODUCTS) {
    await MockProduct.create(product);
  }
  console.log(`Seeded ${SAMPLE_PRODUCTS.length} mock products.`);
};

const seedMongo = async () => {
  await connectDB();

  let admin = await User.findOne({ email: ADMIN_ACCOUNT.email });
  if (!admin) {
    admin = await User.create(ADMIN_ACCOUNT);
    console.log('MongoDB admin account created (admin@goldmarket.com / admin12345).');
  }

  const count = await Product.countDocuments();
  if (count > 0) {
    console.log(`Clearing ${count} existing products from MongoDB...`);
    await Product.deleteMany({});
  }

  await Product.insertMany(
    SAMPLE_PRODUCTS.map((product) => ({
      ...product,
      seller: admin._id,
    }))
  );
  console.log(`Seeded ${SAMPLE_PRODUCTS.length} products into MongoDB.`);
};

const seed = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (uri) {
      await seedMongo();
    } else {
      await seedMock();
    }
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
