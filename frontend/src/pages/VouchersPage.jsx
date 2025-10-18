import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const VouchersPage = () => {
  const { vouchers, addVoucher, updateVoucher, deleteVoucher } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchSearch = voucher.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = !typeFilter || voucher.type === typeFilter;
    return matchSearch && matchType;
  });

  const handleOpenModal = (voucher = null) => {
    setEditingVoucher(voucher);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingVoucher(null);
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const voucherData = {
      code: formData.get('code').trim().toUpperCase(),
      type: formData.get('type'),
      value: parseFloat(formData.get('value')),
      quantity: parseInt(formData.get('quantity')),
      startDate: new Date(formData.get('startDate')),
      endDate: new Date(formData.get('endDate')),
      description: formData.get('description')
    };

    if (editingVoucher) {
      updateVoucher(editingVoucher.id, voucherData);
    } else {
      addVoucher(voucherData);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa voucher này?')) {
      deleteVoucher(id);
    }
  };

  return (
    <div>
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
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có voucher nào
                </td>
              </tr>
            ) : (
              filteredVouchers.map((voucher) => (
                <tr key={voucher.id}>
                  <td><strong>{voucher.code}</strong></td>
                  <td>{voucher.type === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</td>
                  <td>{voucher.type === 'percentage' ? `${voucher.value}%` : `${voucher.value.toLocaleString()}đ`}</td>
                  <td>{voucher.quantity}</td>
                  <td>{voucher.used || 0}</td>
                  <td>{formatDate(voucher.endDate)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button size="sm" variant="warning" onClick={() => handleOpenModal(voucher)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(voucher.id)}>
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingVoucher ? 'Sửa voucher' : 'Thêm voucher mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Mã voucher</label>
            <input type="text" name="code" defaultValue={editingVoucher?.code} required />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Loại giảm giá</label>
            <select name="type" defaultValue={editingVoucher?.type || 'percentage'}>
              <option value="percentage">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (VNĐ)</option>
            </select>
          </div>
          <div className={modalStyles.formGroup}>
            <label>Giá trị</label>
            <input type="number" name="value" defaultValue={editingVoucher?.value} required min="0" />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Số lượng</label>
            <input type="number" name="quantity" defaultValue={editingVoucher?.quantity} required min="1" />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Ngày bắt đầu</label>
            <input
              type="date"
              name="startDate"
              defaultValue={editingVoucher?.startDate ? new Date(editingVoucher.startDate).toISOString().split('T')[0] : ''}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Ngày kết thúc</label>
            <input
              type="date"
              name="endDate"
              defaultValue={editingVoucher?.endDate ? new Date(editingVoucher.endDate).toISOString().split('T')[0] : ''}
              required
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Mô tả</label>
            <textarea name="description" defaultValue={editingVoucher?.description} />
          </div>
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">{editingVoucher ? 'Cập nhật' : 'Thêm'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VouchersPage;
