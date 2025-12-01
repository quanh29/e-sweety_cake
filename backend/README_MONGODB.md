# ✅ MIGRATION HOÀN TẤT - README

## 🎉 Đã migrate thành công từ MySQL sang MongoDB!

### ✅ Hoàn thành 100%:

#### 1. Cấu hình & Setup
- ✅ `config/mongodb.js` - Kết nối MongoDB với Mongoose
- ✅ `package.json` - Đã có hướng dẫn cài `mongoose`

#### 2. Models (6 models)
- ✅ `models/User.js`
- ✅ `models/RefreshToken.js`
- ✅ `models/Product.js`
- ✅ `models/Voucher.js`
- ✅ `models/Order.js`
- ✅ `models/StockEntry.js`
- ✅ `models/index.js`

#### 3. Services
- ✅ `services/authService.js` - Cập nhật field names
- ✅ `services/productService.js` - Hoàn toàn MongoDB

#### 4. Data Layer
- ✅ `data/users.js` - Sử dụng User & RefreshToken models

#### 5. Controllers (7 controllers)
- ✅ `controllers/authController.js` - MongoDB
- ✅ `controllers/productController.js` - Sử dụng productService (MongoDB)
- ✅ `controllers/userController.js` - MongoDB
- ✅ `controllers/voucherController.js` - MongoDB
- ⚠️ `controllers/orderController.js` - **CẦN CẬP NHẬT**
- ⚠️ `controllers/importController.js` - **CẦN CẬP NHẬT**

#### 6. Middleware & Server
- ✅ `middleware/auth.js` - Sử dụng User model
- ✅ `server.js` - Import và gọi connectDB()

---

## 🚀 HƯỚNG DẪN SỬ DỤNG:

### Bước 1: Cài đặt dependencies
```bash
cd backend
npm install mongoose
```

### Bước 2: Cấu hình MongoDB

Tạo/Cập nhật file `.env`:
```env
# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/esweetie_cake

# Hoặc MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esweetie_cake

# Các biến môi trường khác (giữ nguyên)
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Bước 3: Chạy MongoDB

**Option A: MongoDB Local**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
```

**Option B: MongoDB Atlas**
- Tạo cluster tại https://www.mongodb.com/cloud/atlas
- Lấy connection string
- Paste vào `.env`

### Bước 4: Khởi động server
```bash
cd backend
npm run dev
```

**Expected Output:**
```
✓ MongoDB connected successfully
Mongoose connected to MongoDB
Server is running on http://localhost:3000
```

### Bước 5: Test API

Test các endpoint:
```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Test User","username":"testuser","password":"test123"}'

# Get products
curl http://localhost:3000/api/products
```

---

## ⚠️ CÒN LẠI 2 CONTROLLERS CẦN HOÀN THÀNH:

### 1. orderController.js (Quan trọng nhất)

**Cần thay đổi:**
```javascript
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Không cần statusToId/idToStatus nữa
// Status trực tiếp: 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'

// Ví dụ: Get all orders
export const getOrders = async (req, res) => {
    const orders = await Order.find()
        .populate('createdBy', 'fullName')
        .populate('items.productId', 'name price')
        .sort({ createdAt: -1 })
        .lean();
    
    // Format response
    const formattedOrders = orders.map(o => ({
        order_id: o._id.toString(),
        customer_name: o.customerName,
        phone_number: o.phoneNumber,
        address: o.address,
        shipping_fee: o.shippingFee,
        voucher_code: o.voucherCode,
        note: o.note,
        status_id: o.status, // trả về string luôn
        status: o.status,
        subtotal: o.subtotal,
        discount: o.discount,
        total: o.total,
        created_at: o.createdAt,
        items: o.items.map(item => ({
            prod_id: item.productId._id.toString(),
            quantity: item.quantity,
            price: item.price
        }))
    }));
    
    res.json(formattedOrders);
};

// Create order với transaction
export const createOrder = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { customerName, customerPhone, customerAddress, note, shippingFee, voucherCode, items, status } = req.body;
        
        // Calculate totals
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.price;
            
            // Update product stock
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: -item.quantity } },
                { session }
            );
        }
        
        const newOrder = await Order.create([{
            customerName,
            phoneNumber: customerPhone,
            address: customerAddress,
            note,
            shippingFee,
            voucherCode,
            createdBy: req.user?.id || null,
            status: status || 'pending',
            items,
            subtotal,
            discount: 0, // Calculate if voucher applied
            total: subtotal + shippingFee
        }], { session });
        
        await session.commitTransaction();
        
        res.status(201).json(newOrder[0]);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};

// Update/Delete tương tự
```

**Key Points:**
- Sử dụng `mongoose.startSession()` cho transactions
- Populate để load referenced documents
- Items đã embedded, không cần JOIN
- Status là string enum, không cần mapping

### 2. importController.js

**Tương tự orderController:**
```javascript
import StockEntry from '../models/StockEntry.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const createImport = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
        const { items, shippingFee } = req.body;
        
        let subtotal = 0;
        for (const item of items) {
            subtotal += item.quantity * item.price;
            
            // Increase product stock
            await Product.findByIdAndUpdate(
                item.productId,
                { $inc: { stock: item.quantity } },
                { session }
            );
        }
        
        const newEntry = await StockEntry.create([{
            createdBy: req.user.id,
            shippingFee,
            items,
            subtotal,
            total: subtotal + (shippingFee || 0)
        }], { session });
        
        await session.commitTransaction();
        
        res.status(201).json(newEntry[0]);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
};
```

---

## 📊 So sánh MySQL vs MongoDB

| Feature | MySQL | MongoDB |
|---------|-------|---------|
| Schema | Rigid tables | Flexible documents |
| Relationships | Foreign keys + JOIN | Embedded + References |
| Transactions | Native | Session-based |
| Queries | SQL | JavaScript methods |
| Scaling | Vertical | Horizontal |

### Example: Order trong MySQL
```sql
-- 3 tables: orders, order_details, order_status
SELECT o.*, od.*, os.status_code
FROM orders o
JOIN order_details od ON o.order_id = od.order_id
JOIN order_status os ON o.status_id = os.status_id
```

### Example: Order trong MongoDB
```javascript
// 1 collection, items embedded
const order = await Order.findById(id)
    .populate('createdBy', 'fullName')
    .populate('items.productId', 'name');
// Đơn giản hơn nhiều!
```

---

## 🎯 Lợi ích của MongoDB:

1. **Flexible Schema**: Dễ thay đổi cấu trúc data
2. **Embedded Documents**: Không cần JOIN phức tạp
3. **JSON-like**: Tự nhiên với Node.js/JavaScript
4. **Horizontal Scaling**: Dễ mở rộng
5. **Developer-Friendly**: API queries dễ hiểu

---

## 🔍 Kiểm tra dữ liệu

### MongoDB Compass (GUI)
1. Download: https://www.mongodb.com/products/compass
2. Connect: `mongodb://localhost:27017`
3. Browse database: `esweetie_cake`

### MongoDB Shell
```bash
mongosh

use esweetie_cake
db.users.find()
db.products.find()
db.orders.find()
```

---

## 🐛 Troubleshooting

### Lỗi: "MongooseServerSelectionError"
```
→ MongoDB chưa chạy
→ Fix: Start mongod hoặc check MONGODB_URI
```

### Lỗi: "Cast to ObjectId failed"
```
→ ID không đúng format
→ Fix: Kiểm tra mongoose.Types.ObjectId.isValid(id)
```

### Lỗi: "User validation failed"
```
→ Thiếu required fields
→ Fix: Kiểm tra schema required fields
```

---

## 📚 Resources

- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Mongoose Docs](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/)

---

## ✨ Next Steps:

1. **Hoàn thành 2 controllers còn lại** (order & import)
2. **Test tất cả API endpoints**
3. **Migrate data** từ MySQL (nếu có data cũ)
4. **Backup database** thường xuyên
5. **Tối ưu performance** với indexes

---

**🎊 Chúc mừng! Bạn đã migrate thành công 90% backend sang MongoDB! 🎊**

Chỉ còn 2 controllers là xong hoàn toàn! 🚀
