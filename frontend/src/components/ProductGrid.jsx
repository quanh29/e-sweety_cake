import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import styles from './ProductGrid.module.css';
import { publicAPI } from '../utils/api';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const data = await publicAPI.getProducts();
                
                const formattedProducts = data.map(p => ({
                    id: p.prod_id,
                    name: p.prod_name,
                    description: p.prod_description,
                    price: parseFloat(p.price),
                    stock: parseInt(p.stock, 10),
                    image: p.picture_url ? `${SERVER_URL}${p.picture_url}` : 'https://via.placeholder.com/150'
                }));

                setProducts(formattedProducts);
                setError(null);
            } catch (err) {
                setError(err.message);
                console.error("Fetch products error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <section className={styles.products} id="products">
                <div className={styles.container}>
                    <h2 className={styles.sectionTitle}>Sản Phẩm Của Chúng Tôi</h2>
                    <div className={styles.productGrid}>
                        {[...Array(8)].map((_, index) => (
                            <ProductCardSkeleton key={index} />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return <p>Error: {error}</p>;
    }

    return (
        <section className={styles.products} id="products">
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Sản Phẩm Của Chúng Tôi</h2>
                <div className={styles.productGrid}>
                    {products.map((product, index) => (
                        <div key={product.id} className={styles.productItem} style={{ animationDelay: `${index * 0.1}s` }}>
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
