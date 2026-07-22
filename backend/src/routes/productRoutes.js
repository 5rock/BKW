const express = require('express');
const router  = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, requireSeller } = require('../middleware/authMiddleware');
const { productRules, handleValidation } = require('../middleware/validate');

router.get('/',    getProducts);
router.get('/:id', getProductById);
router.post('/',    protect, requireSeller, productRules, handleValidation, createProduct);
router.put('/:id',  protect, requireSeller, productRules, handleValidation, updateProduct);
router.delete('/:id', protect, requireSeller, deleteProduct);

module.exports = router;
