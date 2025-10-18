import styles from './Hero.module.css';

const Hero = () => {
    const scrollToProducts = (e) => {
        e.preventDefault();
        const element = document.getElementById('products');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <section className={styles.hero} id="home">
            <div className={styles.heroContent}>
                <h2>Bánh Ngọt Tươi Mỗi Ngày</h2>
                <p>Được làm từ những nguyên liệu tự nhiên và tươi ngon nhất</p>
                <a href="#products" className={styles.btn} onClick={scrollToProducts}>
                    Xem sản phẩm
                </a>
            </div>
        </section>
    );
};

export default Hero;
