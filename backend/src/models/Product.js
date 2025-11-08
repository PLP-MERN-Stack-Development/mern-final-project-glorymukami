const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: [
      'Electronics',
      'Computers',
      'Smart Home',
      'Arts & Crafts',
      'Automotive',
      'Baby',
      'Beauty & Personal Care',
      'Books',
      'Fashion',
      'Health & Household',
      'Sports & Outdoors',
      'Tools & Home Improvement',
      'Toys & Games',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String
  }],
  featuredImage: {
    type: String,
    default: '/images/default-product.jpg'
  },
  inventory: {
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    trackQuantity: {
      type: Boolean,
      default: true
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  specifications: {
    type: Map,
    of: String
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  vendor: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Comment cannot be more than 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],  // CHANGED FROM 1 to 0
    max: [5, 'Rating cannot be more than 5'],
    default: 0  // CHANGED: Allow 0 for products with no reviews
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  salesCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate average rating when reviews are updated
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.reviewCount = 0;
    return;
  }

  const sum = this.reviews.reduce((acc, item) => acc + item.rating, 0);
  this.averageRating = (sum / this.reviews.length).toFixed(1);
  this.reviewCount = this.reviews.length;
};

// Recalculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.isModified('reviews')) {
    this.calculateAverageRating();
  }
  next();
});

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);