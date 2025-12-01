# Migration từ MySQL sang MongoDB

## Đã hoàn thành:

### 1. Cài đặt packages
```bash
cd backend
npm install mongoose
```

### 2. Tạo cấu hình MongoDB
- ✅ `config/mongodb.js` - Kết nối MongoDB với Mongoose

### 3. Tạo Models
- ✅ `models/User.js` - User schema
- ✅ `models/RefreshToken.js` - RefreshToken schema  
- ✅ `models/Product.js` - Product schema
- ✅ `models/Voucher.js` - Voucher schema
- ✅ `models/Order.js` - Order schema (embedded items)
- ✅ `models/StockEntry.js` - StockEntry schema (embedded items)
- ✅ `models/index.js` - Export tất cả models

### 4. Cập nhật Services
- ✅ `services/authService.js` - Đổi user_id thành _id
- ✅ `services/productService.js` - Sử dụng Mongoose methods

## Cần làm tiếp:

### 5. Cập nhật Controllers
Cần cập nhật tất cả controllers để sử dụng Mongoose thay vì MySQL queries:

- ⏳ `controllers/authController.js`
  - Đổi pool.query thành User.findOne(), RefreshToken.create(), etc.
  - Cập nhật field names: user_id → _id, full_name → fullName, is_admin → isAdmin, is_actived → isActive
  
- ⏳ `controllers/productController.js`
  - Đã có productService.js mới, chỉ cần kiểm tra

- ⏳ `controllers/orderController.js`
  - Đổi pool.query thành Order.find(), Order.create(), Order.findByIdAndUpdate()
  - Embedded items thay vì JOIN order_details
  - Cập nhật field names

- ⏳ `controllers/voucherController.js`
  - Đổi pool.query thành Voucher.find(), Voucher.create()
  - Cập nhật field names: voucher_code → code, is_absolute → isAbsolute, is_active → isActive
  - Tính used count từ Order collection

- ⏳ `controllers/userController.js`
  - Đổi pool.query thành User.find(), User.create(), User.findByIdAndUpdate()
  - Cập nhật field names

- ⏳ `controllers/importController.js`
  - Đổi pool.query thành StockEntry methods
  - Embedded items thay vì JOIN entry_details

### 6. Cập nhật Middleware
- ⏳ `middleware/auth.js`
  - Đổi pool.query thành User.findById()
  - Cập nhật field names

### 7. Cập nhật Server
- ⏳ `server.js`
  - Import connectDB từ config/mongodb.js
  - Gọi connectDB() trước khi start server
  - Xóa import mysql.js (nếu có)

### 8. Environment Variables
Thêm vào `.env`:
```
MONGODB_URI=mongodb://localhost:27017/esweetie_cake
```

Hoặc nếu dùng MongoDB Atlas:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/esweetie_cake
```

## Mapping Schema MySQL → MongoDB

### Users Table → User Model
- `user_id` (VARCHAR) → `_id` (ObjectId - auto)
- `full_name` → `fullName`
- `hashed_password` → `hashedPassword`
- `salt` → `salt`
- `is_actived` → `isActive`
- `is_admin` → `isAdmin`

### Products Table → Product Model  
- `prod_id` → `_id`
- `prod_name` → `name`
- `prod_description` → `description`
- `price` → `price`
- `stock` → `stock`
- `picture_url` → `pictureUrl`

### Vouchers Table → Voucher Model
- `voucher_code` → `code`
- `is_absolute` → `isAbsolute`
- `amount` → `amount`
- `quantity` → `quantity`
- `is_active` → `isActive`
- `start_at` → `startAt`
- `expired_at` → `expiredAt`

### Orders Table + Order_Details → Order Model (Embedded)
- `order_id` → `_id`
- `customer_name` → `customerName`
- `phone_number` → `phoneNumber`
- `address` → `address`
- `shipping_fee` → `shippingFee`
- `voucher_code` → `voucherCode`
- `note` → `note`
- `created_by` → `createdBy` (ObjectId ref User)
- `status_id` → `status` (enum: 'pending', 'confirmed', 'shipped', 'completed', 'cancelled')
- `order_details` → `items[]` (embedded array)
  - `prod_id` → `productId` (ObjectId ref Product)
  - `quantity` → `quantity`
  - `price` → `price`

### Stock_Entries + Entry_Details → StockEntry Model (Embedded)
- `entry_id` → `_id`
- `created_by` → `createdBy` (ObjectId ref User)
- `shipping_fee` → `shippingFee`
- `entry_details` → `items[]` (embedded array)
  - `prod_id` → `productId`
  - `quantity` → `quantity`
  - `price` → `price`

### Refresh_Tokens Table → RefreshToken Model
- `id` → `_id`
- `user_id` → `userId` (ObjectId ref User)
- `token_hash` → `tokenHash`
- `expires_at` → `expiresAt`
- `revoked` → `revoked`
- `device_info` → `deviceInfo`

## Lưu ý quan trọng:

1. **ObjectId vs String**: MongoDB dùng ObjectId cho _id, cần convert khi trả về frontend
2. **Embedded vs Referenced**: Orders và StockEntries có items embedded, không cần JOIN
3. **Timestamps**: Mongoose tự động thêm createdAt và updatedAt
4. **Indexes**: Đã định nghĩa indexes trong schemas
5. **Population**: Dùng `.populate()` để load referenced documents (User, Product)
6. **Transactions**: MongoDB hỗ trợ transactions cho multi-document operations

## Test Migration:

1. Chạy MongoDB local hoặc kết nối MongoDB Atlas
2. Cập nhật .env với MONGODB_URI
3. Chạy server: `npm run dev`
4. Test các API endpoints
5. Kiểm tra data trong MongoDB Compass hoặc mongosh

## Rollback Plan:

- Giữ nguyên file `config/mysql.js` để có thể rollback
- Backup database MySQL trước khi migrate
- Test kỹ trên môi trường dev trước khi deploy production
