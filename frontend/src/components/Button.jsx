import styles from './Button.module.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const variantClass = {
    primary: styles.btnPrimary,
    success: styles.btnSuccess,
    warning: styles.btnWarning,
    danger: styles.btnDanger,
    secondary: styles.btnSecondary
  }[variant] || styles.btnPrimary;

  const sizeClass = size === 'sm' ? styles.btnSm : '';

  return (
    <button
      type={type}
      className={`${styles.btn} ${variantClass} ${sizeClass}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
