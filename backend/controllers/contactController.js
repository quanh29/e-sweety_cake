import Contact from '../models/Contact.js';

// Public endpoint - create a new contact message
export const createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and message are required' 
      });
    }

    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      message,
      status: 'unread'
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send contact message',
      error: error.message 
    });
  }
};

// Admin endpoint - get all contact messages with pagination
export const getAllContactMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, search } = req.query;
    
    // Build filter
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Contact.countDocuments(filter);
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      contacts: contacts.map(c => ({
        id: c._id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        message: c.message,
        status: c.status,
        repliedAt: c.repliedAt,
        repliedBy: c.repliedBy,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contact messages',
      error: error.message 
    });
  }
};

// Admin endpoint - get single contact message
export const getContactMessageById = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status,
        repliedAt: contact.repliedAt,
        repliedBy: contact.repliedBy,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch contact message',
      error: error.message 
    });
  }
};

// Admin endpoint - update contact message status
export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ 
        success: false, 
        message: 'Status is required' 
      });
    }

    // Get old data for audit log
    const oldContact = await Contact.findById(id);
    if (!oldContact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    // Store old data in request for audit middleware
    req.originalData = {
      id: oldContact._id,
      status: oldContact.status
    };

    const updateData = { status };
    if (status === 'replied') {
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user?.username || 'Admin';
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      contact: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status,
        repliedAt: contact.repliedAt,
        repliedBy: contact.repliedBy,
        createdAt: contact.createdAt,
        updatedAt: contact.updatedAt
      }
    });
  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update contact message',
      error: error.message 
    });
  }
};

// Admin endpoint - delete contact message
export const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await Contact.findById(id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    // Store deleted data for audit log
    req.deletedData = {
      id: contact._id,
      name: contact.name,
      email: contact.email,
      status: contact.status
    };

    await Contact.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Contact message deleted successfully',
      id: contact._id
    });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact message',
      error: error.message 
    });
  }
};
