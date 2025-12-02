import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const VouchersPage = () => {
  const { vouchers, addVoucher, toggleVoucherStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchSearch = voucher.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !typeFilter || voucher.type === typeFilter;
    return matchSearch && matchType;
  });

  const getVoucherStatus = (voucher) => {    
    // Check if voucher is expired
    if (voucher.endDate) {
      const endDate = new Date(voucher.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (endDate < today) {
        return { text: 'Hết hạn', color: '#721c24', bgColor: '#f8d7da', canToggle: false };
      }
    }
    
    // Check if voucher has no remaining quantity
    if (voucher.quantity - (voucher.used || 0) <= 0) {
      return { text: 'Hết lượt dùng', color: '#721c24', bgColor: '#f8d7da', canToggle: false };
    }
    
    // Check if voucher is active
    if (voucher.isActive) {
      return { text: 'Đang hoạt động', color: '#155724', bgColor: '#d4edda', canToggle: true };
    } else {
      return { text: 'Vô hiệu hóa', color: '#721c24', bgColor: '#f8d7da', canToggle: true };
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const startDateValue = formData.get('startDate');
    const endDateValue = formData.get('endDate');

    // Validate dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDateValue) {
      const startDate = new Date(startDateValue);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < today) {
        alert('Ngày bắt đầu không được là ngày trong quá khứ');
        return;
      }
    }

    if (endDateValue) {
      const endDate = new Date(endDateValue);
      endDate.setHours(0, 0, 0, 0);
      if (endDate < today) {
        alert('Ngày kết thúc không được là ngày trong quá khứ');
        return;
      }
      const startDate = new Date(startDateValue || new Date());
      startDate.setHours(0, 0, 0, 0);
      if (endDate < startDate) {
        alert('Ngày kết thúc phải sau ngày bắt đầu');
        return;
      }
    }

    const voucherData = {
      code: formData.get('code').trim().toUpperCase(),
      type: formData.get('type'),
      value: parseFloat(formData.get('value')),
      quantity: parseInt(formData.get('quantity')),
      startDate: startDateValue ? new Date(startDateValue) : new Date(),
      endDate: endDateValue ? new Date(endDateValue) : null
    };

    addVoucher(voucherData);
    handleCloseModal();
  };

  const handleToggleStatus = (code) => {
    toggleVoucherStatus(code);
  };

  return (
    <div>
      <PageTitle title="Quản Lý Voucher" />
      <div className={styles.pageHeader}>
        <h2>Quản lý Voucher</h2>
        <p>Quản lý mã giảm giá và khuyến mãi</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm mã voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="percentage">Phần trăm</option>
            <option value="fixed">Số tiền cố định</option>
          </select>
          <Button onClick={() => handleOpenModal()}>Thêm voucher</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Số lượng</th>
              <th>Đã dùng</th>
              <th>Hạn sử dụng</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có voucher nào
                </td>
              </tr>
            ) : (
              filteredVouchers.map((voucher) => {
                const status = getVoucherStatus(voucher);
                return (
                  <tr key={voucher.id}>
                    <td><strong>{voucher.code}</strong></td>
                    <td>{voucher.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                    <td>{voucher.type === 'percentage' ? `${voucher.value}%` : `${voucher.value.toLocaleString()}đ`}</td>
                    <td>{voucher.quantity}</td>
                    <td>{voucher.used || 0}</td>
                    <td>{voucher.endDate ? formatDate(voucher.endDate) : 'Không giới hạn'}</td>
                    <td>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        fontSize: '0.85em',
                        backgroundColor: status.bgColor,
                        color: status.color
                      }}>
                        {status.text}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        {status.canToggle && (
                          <Button 
                            size="sm" 
                            variant={voucher.isActive ? 'danger' : 'success'} 
                            onClick={() => handleToggleStatus(voucher.code)}
                          >
                            {voucher.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Thêm voucher mới"
      >
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Mã voucher</label>
            <input type="text" name="code" required />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Loại giảm giá</label>
            <select name="type" defaultValue="percentage">
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VNĐ)</option>
            </select>
          </div>
          <div className={modalStyles.formGroup}>
            <label>Giá trị</label>
            <input type="number" name="value" required min="0" />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Số lượng</label>
            <input type="number" name="quantity" required min="1" />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              min={new Date().toISOString().split('T')[0]}
              defaultValue={new Date().toISOString().split('T')[0]}
            />
            <small style={{ color: '#666', fontSize: '0.85em' }}>Để trống để sử dụng ngày hiện tại</small>
          </div>
          <div className={modalStyles.formGroup}>
            <label>Ngày kết thúc (tùy chọn)</label>
            <input
              type="date"
              name="endDate"
              min={new Date().toISOString().split('T')[0]}
            />
            <small style={{ color: '#666', fontSize: '0.85em' }}>Để trống nếu không giới hạn thời gian</small>
          </div>
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">Thêm</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VouchersPage;
