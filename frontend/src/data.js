// Products Data
export const products = [
    {
        id: 1,
        name: "Bánh Kem Dâu Tươi",
        description: "Bánh kem với lớp kem tươi mềm mịn và dâu tây tươi ngon",
        price: 250000,
        image: "🍰"
    },
    {
        id: 2,
        name: "Bánh Tiramisu",
        description: "Bánh Tiramisu Italia truyền thống với hương vị cà phê đặc trưng",
        price: 280000,
        image: "🎂"
    },
    {
        id: 3,
        name: "Bánh Sô-cô-la",
        description: "Bánh sô-cô-la đậm đà với lớp ganache mềm mịn",
        price: 220000,
        image: "🍫"
    },
    {
        id: 4,
        name: "Bánh Mousse Chanh",
        description: "Bánh mousse chanh dây chua ngọt thanh mát",
        price: 260000,
        image: "🍋"
    },
    {
        id: 5,
        name: "Bánh Red Velvet",
        description: "Bánh nhung đỏ với lớp kem cheese béo ngậy",
        price: 290000,
        image: "❤️"
    },
    {
        id: 6,
        name: "Bánh Matcha",
        description: "Bánh trà xanh Matcha Nhật Bản thơm ngon",
        price: 270000,
        image: "🍵"
    },
    {
        id: 7,
        name: "Bánh Cupcake",
        description: "Set 6 bánh cupcake với nhiều hương vị khác nhau",
        price: 180000,
        image: "🧁"
    },
    {
        id: 8,
        name: "Bánh Macaron",
        description: "Hộp 12 bánh macaron Pháp cao cấp nhiều màu sắc",
        price: 320000,
        image: "🍪"
    },
    {
        id: 9,
        name: "Bánh Cheesecake",
        description: "Bánh phô mai New York kiểu cổ điển",
        price: 240000,
        image: "🧀"
    }
];

// Voucher Data
export const vouchers = [
    {
        code: "BANH10",
        discount: 10, // Percentage
        type: "percentage",
        description: "Giảm 10%",
        minOrder: 0
    },
    {
        code: "BANH20",
        discount: 20, // Percentage
        type: "percentage",
        description: "Giảm 20%",
        minOrder: 500000
    },
    {
        code: "GIAM50K",
        discount: 50000, // Fixed amount
        type: "fixed",
        description: "Giảm 50,000đ",
        minOrder: 200000
    },
    {
        code: "FREESHIP",
        discount: 30000, // Fixed amount
        type: "fixed",
        description: "Miễn phí vận chuyển (30,000đ)",
        minOrder: 0
    },
    {
        code: "VIP30",
        discount: 30, // Percentage
        type: "percentage",
        description: "Giảm 30% cho khách VIP",
        minOrder: 1000000
    }
];

// Utility function to format price
export const formatPrice = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
};
