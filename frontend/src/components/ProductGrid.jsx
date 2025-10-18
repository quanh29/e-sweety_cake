import { products } from '../data';
import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

const ProductGrid = () => {
    return (
        <section className={styles.products} id="products">
            <div className={styles.container}>
                <h2 className={styles.sectionTitle}>Sản Phẩm Của Chúng Tôi</h2>
                <div className={styles.productGrid}>
                    {products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductGrid;
