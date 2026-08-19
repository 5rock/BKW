const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const { createOrder, getMyOrders, getOrderById, updateOrderStatus } = require('./orderController');

const router = express.Router();

router.use(protect);

router.route('/').post(createOrder);
router.route('/myorders').get(getMyOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/status').patch(updateOrderStatus);

module.exports = router;
