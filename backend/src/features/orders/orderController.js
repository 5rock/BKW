const Order = require('../../models/Order');

exports.createOrder = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'No order items' });
    }

    const order = new Order({
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    
    // Send mock email
    const sendEmail = require('../../utils/sendEmail');
    await sendEmail({
      to: req.user.email || 'customer@example.com',
      subject: `Order Confirmation - #${createdOrder._id}`,
      text: `Thank you for your order! Your total is $${totalPrice}.\nWe will notify you when it ships.`
    });

    res.status(201).json({
      status: 'success',
      data: { order: createdOrder }
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .select('orderItems totalPrice isPaid isDelivered status createdAt')
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: 'success',
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    // Only allow admin or the user who placed the order to view it
    const orderUserId = order.user._id?.toString() || order.user.toString();
    if (orderUserId !== req.user.id && !req.user.isAdmin) {
      // Check if user is a seller for any item in this order
      const isSellerForOrder = order.orderItems.some(
        item => item.seller.toString() === req.user.id
      );
      if (!isSellerForOrder) {
        return res.status(403).json({ status: 'fail', message: 'Not authorized to view this order' });
      }
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status transition' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ status: 'fail', message: 'Order not found' });
    }

    // Authorization: Admin, or Seller who has items in this order
    const isSellerForOrder = order.orderItems.some(
      item => item.seller.toString() === req.user.id
    );

    if (!req.user.isAdmin && !isSellerForOrder) {
      return res.status(403).json({ status: 'fail', message: 'Not authorized to update this order' });
    }

    // State transition logic
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    } else if (status === 'Processing' || status === 'Shipped') {
      order.isDelivered = false;
      order.deliveredAt = undefined;
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({
      status: 'success',
      data: { order: updatedOrder }
    });
  } catch (error) {
    next(error);
  }
};
