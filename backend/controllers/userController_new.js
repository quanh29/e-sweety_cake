import User from '../models/User.js';
import bcrypt from 'bcrypt';

// Get all users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().sort({ fullName: 1 }).lean();

        const formattedUsers = users.map(user => ({
            id: user._id.toString(),
            fullname: user.fullName,
            username: user.username,
            role: user.isAdmin ? 'admin' : 'user',
            status: user.isActive ? 'active' : 'inactive',
            isAdmin: user.isAdmin,
            isActive: user.isActive
        }));

        res.json(formattedUsers);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng' });
    }
};

// Get user by ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).lean();

        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        res.json({
            id: user._id.toString(),
            fullname: user.fullName,
            username: user.username,
            role: user.isAdmin ? 'admin' : 'user',
            status: user.isActive ? 'active' : 'inactive',
            isAdmin: user.isAdmin,
            isActive: user.isActive
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng' });
    }
};

// Create new user
export const createUser = async (req, res) => {
    try {
        const { fullname, username, password, role } = req.body;

        if (!fullname || !username || !password) {
            return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
        }

        // Check if username already exists
        const existing = await User.findOne({ username: username.toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        }

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const isAdmin = role === 'admin';

        const newUser = await User.create({
            fullName: fullname,
            username: username.toLowerCase(),
            hashedPassword,
            salt,
            isActive: true,
            isAdmin
        });

        res.status(201).json({
            id: newUser._id.toString(),
            fullname: newUser.fullName,
            username: newUser.username,
            role: role || 'user',
            status: 'active',
            isAdmin,
            isActive: true
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Lỗi khi tạo người dùng' });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, password, role, status } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Prepare update data
        const updateData = {};

        if (fullname !== undefined && fullname !== null) {
            updateData.fullName = fullname;
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateData.hashedPassword = hashedPassword;
            updateData.salt = salt;
        }

        if (role !== undefined && role !== null) {
            updateData.isAdmin = role === 'admin';
        }

        if (status !== undefined && status !== null) {
            updateData.isActive = status === 'active';
        }

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).lean();

        res.json({
            id: updatedUser._id.toString(),
            fullname: updatedUser.fullName,
            username: updatedUser.username,
            role: updatedUser.isAdmin ? 'admin' : 'user',
            status: updatedUser.isActive ? 'active' : 'inactive',
            isAdmin: updatedUser.isAdmin,
            isActive: updatedUser.isActive
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
    }
};

// Delete user
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user exists and is admin
        const user = await User.findById(id).lean();
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Prevent deleting admin users (optional safeguard)
        if (user.isAdmin) {
            return res.status(403).json({ message: 'Không thể xóa tài khoản admin' });
        }

        // Check if deleting self
        if (req.user.id === id) {
            return res.status(403).json({ message: 'Không thể xóa chính tài khoản của bạn' });
        }

        await User.findByIdAndDelete(id);
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng' });
    }
};

// Toggle user active status (ban/activate)
export const toggleUserStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Prevent toggling admin status
        if (user.isAdmin) {
            return res.status(403).json({ message: 'Không thể thay đổi trạng thái tài khoản admin' });
        }

        const newStatus = !user.isActive;
        user.isActive = newStatus;
        await user.save();

        res.json({
            message: newStatus ? 'Kích hoạt người dùng thành công' : 'Vô hiệu hóa người dùng thành công',
            status: newStatus ? 'active' : 'inactive'
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái người dùng' });
    }
};
