const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, sellerOnly } = require('../middleware/authMiddleware');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, sellerOnly, createProduct);
router.put('/:id', protect, sellerOnly, updateProduct);
router.delete('/:id', protect, sellerOnly, deleteProduct);

module.exports = router;
