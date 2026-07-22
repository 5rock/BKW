const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    images: [String],
    stock: { type: Number, default: 0 },
    brand: String,
    sku: { type: String, unique: true, sparse: true },
    tags: [String],
    discountPrice: { type: Number },
    sizes: [String],
    colors: [String],
    metadata: { type: Map, of: String }, // For flexible key-value pairs (e.g., Material, Dimensions)
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratingsAverage: { type: Number, default: 0 },
    ratingsQuantity: { type: Number, default: 0 },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
  if (!this.discountPrice || this.price <= this.discountPrice) return 0;
  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

// Virtual for final price
productSchema.virtual('finalPrice').get(function() {
  return this.discountPrice && this.discountPrice < this.price ? this.discountPrice : this.price;
});

// Indexes for performance optimization
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ ratingsAverage: -1 });

const mongooseDelete = require('mongoose-delete');

productSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true });

module.exports = mongoose.model('Product', productSchema);
