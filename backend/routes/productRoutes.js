const express = require('express');
const router  = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireSeller } = require('../middleware/authMiddleware');

router.get('/',    getProducts);
router.get('/:id', getProductById);
router.post('/',    protect, requireSeller, createProduct);
router.put('/:id',  protect, requireSeller, updateProduct);
router.delete('/:id', protect, requireSeller, deleteProduct);

module.exports = router;
