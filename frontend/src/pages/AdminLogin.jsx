import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AdminLogin.module.css';
import { toast } from 'react-hot-toast';
import { useAdmin } from '../context/AdminContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // remove inline error state; we use toast for feedback
  const [loading, setLoading] = useState(false);
  const [lockUntil, setLockUntil] = useState(() => {
    const v = localStorage.getItem('loginLockUntil');
    if (!v) return null;
    const t = parseInt(v, 10);
    if (isNaN(t) || t <= Date.now()) {
      // expired already - clean up immediately
      try { localStorage.removeItem('loginLockUntil'); } catch (e) { /* ignore */ }
      return null;
    }
    return t;
  });
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const abortRef = useRef(null);
  const { logout, refetchData } = useAdmin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // if locked, ignore submits
    if (lockUntil && Date.now() < lockUntil) return;
    setLoading(true);

    try {
      // First, logout any existing session to clear old refresh tokens
      await logout();

      const serverUrl = import.meta.env.VITE_SERVER_URL || '';
      const response = await axios.post(
        `${serverUrl}/api/auth/login`,
        { username, password },
        { withCredentials: true }
      );

      // Expecting { accessToken, isAdmin } and backend sets HttpOnly refresh token cookie
      const { accessToken, isAdmin } = response.data || {};
      if (accessToken) {
        sessionStorage.setItem('accessToken', accessToken);
      }
      if (isAdmin) {
        sessionStorage.setItem('isAdmin', 'true');
      }
      toast.success('Đăng nhập thành công');
      
      // Refetch data for the new user
      await refetchData();
      
      navigate('/admin/manage');
    } catch (err) {
      // Show specific message for invalid credentials, otherwise show generic
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message;
      if (status === 401 || serverMsg === 'Invalid credentials') {
        const msg = 'Tài khoản hoặc mật khẩu không đúng';
        toast.error(msg);
      } else if (status === 429) {
        // lock for 10 minutes
        const lockMs = 0.1 * 60 * 1000;
        const until = Date.now() + lockMs;
        localStorage.setItem('loginLockUntil', String(until));
        setLockUntil(until);
        toast.error('Bạn nhập sai thông tin quá nhiều. Vui lòng thử lại sau 10 phút.');
      } else {
        const msg = serverMsg || err.message || 'Đã xảy ra lỗi';
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // countdown timer for lock state
  useEffect(() => {
    let timer = null;
    function tick() {
      if (!lockUntil) {
        setCountdown(0);
        return;
      }
      const left = Math.max(0, Math.ceil((lockUntil - Date.now()) / 1000));
      setCountdown(left);
      if (left <= 0) {
        setLockUntil(null);
        localStorage.removeItem('loginLockUntil');
      }
    }
    tick();
    if (lockUntil) timer = setInterval(tick, 1000);
    return () => { if (timer) clearInterval(timer); };
  }, [lockUntil]);

  const isLocked = Boolean(lockUntil && Date.now() < lockUntil);
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>
  {/* error messages are shown via toast only */}
        <label>Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.btn} disabled={loading || isLocked}>
          {isLocked ? `Thử lại sau ${formatTime(countdown)}` : (loading ? 'Đang đăng nhập...' : 'Đăng nhập')}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;
