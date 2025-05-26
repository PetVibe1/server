const Order = require('../models/Order');
const Pet = require('../models/Pet');

// Get all orders with optional filtering
const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    const total = await Order.countDocuments(filter);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error in getOrderById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new order
const createOrder = async (req, res) => {
  try {
    const { customer, items, total, paymentMethod, paymentStatus } = req.body;
    
    // Generate order number
    const orderDate = new Date();
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const count = await Order.countDocuments();
    const orderNumber = `ORD-${year}${month}-${String(count + 1).padStart(3, '0')}`;
    
    // Create the order
    const order = new Order({
      orderNumber,
      customer,
      items,
      total,
      paymentMethod,
      paymentStatus
    });
    
    const createdOrder = await order.save();
    
    // Update pet availability if order is created successfully
    if (createdOrder) {
      for (const item of items) {
        await Pet.findByIdAndUpdate(item.petId, { available: false });
      }
    }
    
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    
    // If order is cancelled and pets were previously marked as sold,
    // update their availability back to true
    if (status === 'cancelled') {
      for (const item of order.items) {
        await Pet.findByIdAndUpdate(item.petId, { available: true });
      }
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error in updatePaymentStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get revenue data by month for current year
const getRevenueData = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1); // January 1st of current year
    const endDate = new Date(currentYear, 11, 31); // December 31st of current year
    
    // Aggregate orders to get monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelled' } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          sales: { $sum: '$total' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Format data for frontend chart
    const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
    
    const revenueData = months.map((month, index) => {
      const monthData = monthlyRevenue.find(item => item._id === index + 1);
      return {
        month,
        sales: monthData ? monthData.sales : 0
      };
    });
    
    res.json(revenueData);
  } catch (error) {
    console.error('Error in getRevenueData:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus,
  getRevenueData
}; 