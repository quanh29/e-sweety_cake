import styles from './ProductCardSkeleton.module.css';

const ProductCardSkeleton = () => {
    return (
        <div className={styles.skeletonCard}>
            <div className={styles.skeletonImage}></div>
            <div className={styles.separator}>
                <div className={styles.separatorLine}></div>
                <div className={styles.separatorDot}></div>
                <div className={styles.separatorLine}></div>
            </div>
            <div className={styles.skeletonContent}>
                <div className={styles.skeletonTitle}></div>
                <div className={styles.skeletonDescription}></div>
                <div className={styles.skeletonDescription} style={{ width: '60%' }}></div>
                <div className={styles.skeletonPrice}></div>
                <div className={styles.skeletonButton}></div>
            </div>
        </div>
    );
};

export default ProductCardSkeleton;
