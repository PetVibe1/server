const Appointment = require('../models/Appointment');

// Get all appointments with optional filtering
const getAllAppointments = async (req, res) => {
  try {
    const { status, date, limit = 20, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (status) filter.status = status;
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const appointments = await Appointment.find(filter)
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .skip(skip);
      
    const total = await Appointment.countDocuments(filter);
    
    res.json({
      appointments,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    console.error('Error in getAllAppointments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (appointment) {
      res.json(appointment);
    } else {
      res.status(404).json({ message: 'Appointment not found' });
    }
  } catch (error) {
    console.error('Error in getAppointmentById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create new appointment
const createAppointment = async (req, res) => {
  try {
    const { title, date, customer, customerId, petId, petName, status, notes } = req.body;
    
    const appointment = new Appointment({
      title,
      date,
      customer,
      customerId,
      petId,
      petName,
      status,
      notes
    });
    
    const createdAppointment = await appointment.save();
    res.status(201).json(createdAppointment);
  } catch (error) {
    console.error('Error in createAppointment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update appointment
const updateAppointment = async (req, res) => {
  try {
    const { title, date, customer, customerId, petId, petName, status, notes } = req.body;
    
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    // Update fields
    if (title) appointment.title = title;
    if (date) appointment.date = date;
    if (customer) appointment.customer = customer;
    if (customerId) appointment.customerId = customerId;
    if (petId) appointment.petId = petId;
    if (petName) appointment.petName = petName;
    if (status) appointment.status = status;
    if (notes !== undefined) appointment.notes = notes;
    
    const updatedAppointment = await appointment.save();
    res.json(updatedAppointment);
  } catch (error) {
    console.error('Error in updateAppointment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    await appointment.remove();
    res.json({ success: true, message: 'Appointment removed' });
  } catch (error) {
    console.error('Error in deleteAppointment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get appointments by date range
const getAppointmentsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    
    const appointments = await Appointment.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });
    
    res.json(appointments);
  } catch (error) {
    console.error('Error in getAppointmentsByDateRange:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentsByDateRange
}; 