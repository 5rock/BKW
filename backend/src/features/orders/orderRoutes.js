const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrderById } = require('./orderController');

const router = express.Router();

router.use(protect);

router.route('/').post(createOrder);
router.route('/myorders').get(getMyOrders);
router.route('/:id').get(getOrderById);

module.exports = router;
