import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data';
import { publicAPI } from '../utils/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageTitle from '../components/PageTitle';
import ProductCard from '../components/ProductCard';
import styles from './ProductDetail.module.css';
import { X, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showZoom, setShowZoom] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        
        // Check if id exists
        if (!id) {
          console.error('Product ID is undefined');
          navigate('/');
          return;
        }

        const data = await publicAPI.getProduct(id);
        
        // Format product data
        const formattedProduct = {
          id: data.prod_id,
          name: data.prod_name,
          description: data.prod_description,
          price: parseFloat(data.price),
          stock: parseInt(data.stock, 10),
          image: data.picture_url ? `${SERVER_URL}${data.picture_url}` : 'https://via.placeholder.com/400',
          category: data.category,
          weight: data.weight,
          ingredients: data.ingredients
        };
        
        setProduct(formattedProduct);

        // Fetch all products for related section
        const allProducts = await publicAPI.getProducts();
        
        // Format related products
        const formattedRelatedProducts = allProducts
          .filter(p => p.prod_id !== id)
          .slice(0, 6)
          .map(p => ({
            id: p.prod_id,
            name: p.prod_name,
            description: p.prod_description,
            price: parseFloat(p.price),
            stock: parseInt(p.stock, 10),
            image: p.picture_url ? `${SERVER_URL}${p.picture_url}` : 'https://via.placeholder.com/150'
          }));
        
        setRelatedProducts(formattedRelatedProducts);
      } catch (error) {
        console.error('Error fetching product:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
    window.scrollTo(0, 0);
  }, [id, navigate]);

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % Math.ceil(relatedProducts.length / 3));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + Math.ceil(relatedProducts.length / 3)) % Math.ceil(relatedProducts.length / 3));
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải sản phẩm...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className={styles.productDetailPage}>
      <PageTitle title={product.name} />
      <Header />

      <div className={styles.container}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <span onClick={() => navigate('/')} className={styles.breadcrumbLink}>Trang chủ</span>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{product.name}</span>
        </div>

        {/* Product Detail Section */}
        <div className={styles.productDetail}>
          <div className={styles.productImageSection}>
            <div 
              className={styles.productImageContainer}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img src={product.image} alt={product.name} className={styles.productImage} />
              
              {/* Magnifier Preview */}
              {/* {showZoom && (
                <div 
                  className={styles.magnifier}
                  style={{
                    backgroundImage: `url(${product.image})`,
                    backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                  }}
                />
              )} */}
            </div>
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.productPrice}>{formatPrice(product.price)}</div>
            
            <div className={styles.productActions}>
              <button className={styles.addToCartBtn} onClick={handleAddToCart}>
                <ShoppingCart size={20} />
                Thêm vào giỏ hàng
              </button>
            </div>

            {product.details && (
              <div className={styles.productDetails}>
                <h3>Chi tiết sản phẩm</h3>
                <div className={styles.detailsGrid}>
                  {product.category && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Danh mục:</span>
                      <span className={styles.detailValue}>{product.category}</span>
                    </div>
                  )}
                  {product.weight && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Khối lượng:</span>
                      <span className={styles.detailValue}>{product.weight}</span>
                    </div>
                  )}
                  {product.ingredients && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Thành phần:</span>
                      <span className={styles.detailValue}>{product.ingredients}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className={styles.productNotes}>
              <h4>Lưu ý:</h4>
              <ul>
                <li>Sản phẩm được làm thủ công từ nguyên liệu tươi ngon</li>
                <li>Bảo quản trong tủ lạnh, sử dụng trong vòng 2-3 ngày</li>
                <li>Liên hệ để đặt bánh theo yêu cầu riêng</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className={styles.descriptionSection}>
          <h2 className={styles.descriptionTitle}>Mô tả sản phẩm</h2>
          <div className={styles.descriptionContent}>
            <p style={{ whiteSpace: 'pre-wrap' }}>{product.description}</p>
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className={styles.relatedSection}>
            <h2 className={styles.relatedTitle}>Sản phẩm khác</h2>
            <div className={styles.carouselContainer}>
              <button 
                className={`${styles.carouselBtn} ${styles.prevBtn}`} 
                onClick={prevSlide}
                disabled={relatedProducts.length <= 3}
              >
                <ChevronLeft size={24} />
              </button>
              
              <div className={styles.carouselWrapper}>
                <div 
                  className={styles.carouselTrack}
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {relatedProducts.map((relatedProduct) => (
                    <div 
                      key={relatedProduct.id} 
                      className={styles.carouselItem}
                    >
                      <ProductCard product={relatedProduct} />
                    </div>
                  ))}
                </div>
              </div>

              <button 
                className={`${styles.carouselBtn} ${styles.nextBtn}`} 
                onClick={nextSlide}
                disabled={relatedProducts.length <= 3}
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;
