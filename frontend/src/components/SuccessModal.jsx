import styles from './SuccessModal.module.css';

const SuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <>
            <div className={styles.overlay} onClick={onClose}></div>
            <div className={styles.modal}>
                <div className={styles.modalContent}>
                    <div className={styles.successIcon}>
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <h3>Đặt Hàng Thành Công!</h3>
                    <p>Cảm ơn quý khách đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                    <button className={styles.btn} onClick={onClose}>Đóng</button>
                </div>
            </div>
        </>
    );
};

export default SuccessModal;
