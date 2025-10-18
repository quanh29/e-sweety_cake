import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency, formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const ImportsPage = () => {
  const { imports, products, addImport, deleteImport } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredImports = imports.filter((imp) =>
    imp.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const importData = {
      supplier: formData.get('supplier'),
      shipping: parseInt(formData.get('shipping')) || 0,
      items: [],
      subtotal: 0,
      total: 0,
      createdAt: new Date()
    };

    addImport(importData);
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa đơn nhập hàng này?')) {
      deleteImport(id);
    }
  };

  return (
    <div>
      <div className={styles.pageHeader}>
        <h2>Quản lý nhập hàng</h2>
        <p>Quản lý các đơn nhập hàng từ nhà cung cấp</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm nhà cung cấp..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleOpenModal}>Thêm đơn nhập hàng</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Nhà cung cấp</th>
              <th>Phí vận chuyển</th>
              <th>Tổng tiền</th>
              <th>Ngày nhập</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredImports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có đơn nhập hàng nào
                </td>
              </tr>
            ) : (
              filteredImports.map((imp) => (
                <tr key={imp.id}>
                  <td>#{imp.id}</td>
                  <td>{imp.supplier}</td>
                  <td>{formatCurrency(imp.shipping)}</td>
                  <td>{formatCurrency(imp.total)}</td>
                  <td>{formatDate(imp.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(imp.id)}>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Thêm đơn nhập hàng">
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Nhà cung cấp</label>
            <input type="text" name="supplier" required />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Phí vận chuyển (VNĐ)</label>
            <input type="number" name="shipping" defaultValue="0" min="0" />
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

export default ImportsPage;
