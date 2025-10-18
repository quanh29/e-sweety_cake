import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import styles from './Notification.module.css';

const Notification = () => {
    const { notification } = useCart();

    if (!notification) return null;

    return (
        <div className={styles.notification}>
            {notification}
        </div>
    );
};

export default Notification;
