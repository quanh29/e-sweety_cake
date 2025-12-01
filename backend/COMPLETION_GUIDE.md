# Hoàn thành Migration MongoDB

## ✅ Đã hoàn thành:

### 1. Cấu hình & Models
- ✅ `config/mongodb.js` - Kết nối MongoDB
- ✅ Tất cả 6 models: User, RefreshToken, Product, Voucher, Order, StockEntry
- ✅ `models/index.js` - Export tổng hợp

### 2. Services
- ✅ `services/authService.js` - Đã cập nhật field names
- ✅ `services/productService.js` - Hoàn toàn mới với Mongoose

### 3. Data Layer
- ✅ `data/users.js` - Cập nhật sử dụng User và RefreshToken models

### 4. Controllers đã cập nhật
- ✅ `controllers/authController.js` - Sử dụng User model thay vì pool.query
- ✅ `controllers/userController.js` - Hoàn toàn chuyển sang MongoDB
- ✅ `controllers/productController.js` - Đã dùng productService (đã là MongoDB)

### 5. Middleware
- ✅ `middleware/auth.js` - Sử dụng User model

### 6. Server
- ✅ `server.js` - Import và gọi connectDB()

## ⏳ CẦN HOÀN THÀNH:

### Controllers còn lại cần cập nhật:

#### 1. voucherController.js
Cần thay đổi:
```javascript
import Voucher from '../models/Voucher.js';
import Order from '../models/Order.js';

// Thay tất cả pool.query bằng:
// - Voucher.find(), Voucher.findOne({ code })
// - Voucher.create()
// - Voucher.findOneAndUpdate()
// - Order.countDocuments({ voucherCode, status: { $ne: 'cancelled' } })

// Field mapping:
// - voucher_code → code
// - is_absolute → isAbsolute
// - amount → amount
// - quantity → quantity
// - is_active → isActive
// - start_at → startAt
// - expired_at → expiredAt
```

#### 2. orderController.js
Cần thay đổi:
```javascript
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Thay tất cả pool.query bằng:
// - Order.find().populate('createdBy', 'fullName').populate('items.productId', 'name')
// - Order.create()
// - Order.findByIdAndUpdate()
// - Order.findByIdAndDelete()
// - Product.findByIdAndUpdate() để cập nhật stock

// Embedded items - Không cần JOIN order_details
// Status: 'pending', 'confirmed', 'shipped', 'completed', 'cancelled'
// Không cần statusToId mapping nữa

// Field mapping:
// - order_id → _id
// - customer_name → customerName
// - phone_number → phoneNumber
// - shipping_fee → shippingFee
// - voucher_code → voucherCode
// - created_by → createdBy (ObjectId)
// - status_id → status (string enum)
```

#### 3. importController.js
Cần thay đổi:
```javascript
import StockEntry from '../models/StockEntry.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Thay tất cả pool.query bằng:
// - StockEntry.find().populate('createdBy', 'fullName').populate('items.productId', 'name')
// - StockEntry.create()
// - StockEntry.findByIdAndUpdate()
// - StockEntry.findByIdAndDelete()
// - Product.findByIdAndUpdate() để cập nhật stock

// Embedded items - Không cần JOIN entry_details

// Field mapping:
// - entry_id → _id
// - created_by → createdBy (ObjectId)
// - shipping_fee → shippingFee
```

## 📝 Các bước cần làm:

### Bước 1: Cài đặt package
```bash
cd backend
npm install mongoose
```

### Bước 2: Cập nhật .env
Thêm dòng:
```
MONGODB_URI=mongodb://localhost:27017/esweetie_cake
```

Hoặc MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esweetie_cake
```

### Bước 3: Cập nhật 3 controllers còn lại
- Xem file mẫu trong `MIGRATION_MONGODB.md`
- Thay pool.query bằng Mongoose methods
- Cập nhật field names theo mapping

### Bước 4: Test migration
```bash
# Chạy MongoDB local hoặc đảm bảo kết nối được MongoDB Atlas
mongod # nếu local

# Start backend
cd backend
npm run dev
```

### Bước 5: Kiểm tra kết nối
- Server phải log: "✓ MongoDB connected successfully"
- Test các API endpoints
- Kiểm tra data trong MongoDB Compass

## 🔧 Debug Tips:

### Lỗi kết nối MongoDB:
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
→ Đảm bảo MongoDB đang chạy: `mongod` hoặc kiểm tra connection string

### Lỗi field undefined:
```
Cannot read property 'field_name' of undefined
```
→ Kiểm tra field mapping: MySQL snake_case → MongoDB camelCase

### Lỗi ObjectId:
```
Cast to ObjectId failed
```
→ Đảm bảo dùng `.toString()` khi trả về _id cho frontend

## 📊 Data Migration (Optional):

Nếu muốn migrate data từ MySQL sang MongoDB:

1. Export data từ MySQL:
```sql
SELECT * FROM users;
SELECT * FROM products;
-- etc.
```

2. Tạo migration script:
```javascript
// scripts/migrate-data.js
import connectDB from '../config/mongodb.js';
import { User, Product, Voucher, Order } from '../models/index.js';
import pool from '../config/mysql.js';

async function migrateData() {
    await connectDB();
    
    // Migrate users
    const [users] = await pool.query('SELECT * FROM users');
    for (const user of users) {
        await User.create({
            fullName: user.full_name,
            username: user.username,
            hashedPassword: user.hashed_password,
            salt: user.salt,
            isActive: user.is_actived,
            isAdmin: user.is_admin
        });
    }
    
    // Migrate products, vouchers, orders...
}

migrateData();
```

3. Chạy migration:
```bash
node scripts/migrate-data.js
```

## 🚀 Kết quả mong đợi:

Sau khi hoàn thành:
- ✅ Backend chạy với MongoDB thay vì MySQL
- ✅ Tất cả API endpoints hoạt động bình thường
- ✅ Frontend không cần thay đổi (vì response format giống nhau)
- ✅ Authentication & authorization hoạt động
- ✅ CRUD operations cho tất cả entities
- ✅ Embedded documents (Order items, StockEntry items)
- ✅ Populate references (User, Product)

## 📁 Files còn lại cần cập nhật:

1. `controllers/voucherController.js` - Khoảng 200 lines
2. `controllers/orderController.js` - Khoảng 400 lines (phức tạp nhất)
3. `controllers/importController.js` - Khoảng 350 lines

Bạn có muốn tôi tiếp tục cập nhật 3 controllers này không?
