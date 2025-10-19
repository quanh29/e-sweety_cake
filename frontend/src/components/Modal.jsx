import { useEffect } from 'react';
import styles from './Modal.module.css';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Do not close modal on backdrop click. Provide explicit close button instead.
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close dialog">×</button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
