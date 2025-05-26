const User = require('../models/User');
const Pet = require('../models/Pet');
const Order = require('../models/Order');
const Appointment = require('../models/Appointment');

// Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    // Get user stats
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const totalCustomers = await User.countDocuments({ role: 'user' });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(new Date().setDate(1)) } // First day of current month
    });

    // Get pet stats
    const totalPets = await Pet.countDocuments();
    const availablePets = await Pet.countDocuments({ available: true });
    const soldPets = await Pet.countDocuments({ available: false });

    // Group pets by species
    const petsBySpecies = await Pet.aggregate([
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Format pets by species for frontend
    const petCategories = petsBySpecies.map(item => ({
      category: item._id,
      count: item.count
    }));

    // Get order stats
    const totalOrders = await Order.countDocuments();
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });
    
    // Calculate total revenue (exclude cancelled orders)
    const revenueResult = await Order.aggregate([
      {
        $match: { status: { $ne: 'cancelled' } }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // Get revenue for current month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    
    const currentMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    const currentMonthRevenue = currentMonthRevenueResult.length > 0 ? currentMonthRevenueResult[0].totalRevenue : 0;

    // Get revenue for previous month
    const firstDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const lastDayOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
    
    const previousMonthRevenueResult = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayOfPreviousMonth, $lte: lastDayOfPreviousMonth },
          status: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' }
        }
      }
    ]);
    
    const previousMonthRevenue = previousMonthRevenueResult.length > 0 ? previousMonthRevenueResult[0].totalRevenue : 0;
    
    // Calculate revenue change percentage
    let revenueChange = 0;
    if (previousMonthRevenue > 0) {
      revenueChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
    }

    // Get appointment stats
    const totalAppointments = await Appointment.countDocuments();
    const pendingAppointments = await Appointment.countDocuments({ status: 'pending' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });
    const cancelledAppointments = await Appointment.countDocuments({ status: 'cancelled' });

    // Get upcoming appointments
    const upcoming = await Appointment.countDocuments({
      date: { $gte: new Date() },
      status: 'pending'
    });

    // Combine all stats
    const stats = {
      users: {
        total: totalUsers,
        admins: totalAdmins,
        customers: totalCustomers,
        newThisMonth: newUsersThisMonth
      },
      pets: {
        total: totalPets,
        available: availablePets,
        sold: soldPets,
        bySpecies: petCategories
      },
      orders: {
        total: totalOrders,
        completed: completedOrders,
        pending: pendingOrders,
        processing: processingOrders,
        cancelled: cancelledOrders
      },
      appointments: {
        total: totalAppointments,
        pending: pendingAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        upcoming: upcoming
      },
      revenue: {
        total: totalRevenue,
        currentMonth: currentMonthRevenue,
        previousMonth: previousMonthRevenue,
        changePercentage: revenueChange
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboardStats
}; 