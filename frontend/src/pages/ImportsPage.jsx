import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency, formatDate } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import ProductDropdown from '../components/ProductDropdown';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const ImportsPage = () => {
  const { imports, products, addImport, updateImport, deleteImport } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'view', 'edit'
  const [selectedImport, setSelectedImport] = useState(null);
  const [importItems, setImportItems] = useState([{ productId: '', quantity: 1, price: 0 }]);
  const [shippingFee, setShippingFee] = useState(0);

  const filteredImports = imports.filter((imp) =>
    imp.creatorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    imp.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    setModalMode('add');
    setSelectedImport(null);
    setImportItems([{ productId: '', quantity: 1, price: 0 }]);
    setShippingFee(0);
    setIsModalOpen(true);
  };

  const handleViewImport = (imp) => {
    setModalMode('view');
    setSelectedImport(imp);
    setImportItems(imp.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })));
    setShippingFee(imp.shippingFee);
    setIsModalOpen(true);
  };

  const handleEditImport = (imp) => {
    setModalMode('edit');
    setSelectedImport(imp);
    setImportItems(imp.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity,
      price: item.price
    })));
    setShippingFee(imp.shippingFee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalMode('add');
    setSelectedImport(null);
  };

  const handleAddItem = () => {
    setImportItems([...importItems, { productId: '', quantity: 1, price: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (importItems.length > 1) {
      setImportItems(importItems.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...importItems];
    updated[index][field] = value;
    setImportItems(updated);
  };

  const calculateSubtotal = () => {
    return importItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal() + shippingFee;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all items have product selected
    if (importItems.some(item => !item.productId)) {
      alert('Vui lòng chọn sản phẩm cho tất cả các mục');
      return;
    }

    // Validate quantities and prices
    if (importItems.some(item => item.quantity <= 0 || item.price < 0)) {
      alert('Số lượng phải lớn hơn 0 và giá phải không âm');
      return;
    }

    const importData = {
      items: importItems.map(item => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      shippingFee: parseFloat(shippingFee)
    };

    try {
      if (modalMode === 'edit') {
        await updateImport(selectedImport.id, importData);
      } else {
        await addImport(importData);
      }
      handleCloseModal();
    } catch (error) {
      console.error('Import operation error:', error);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa đơn nhập hàng này? Số lượng hàng trong kho sẽ được điều chỉnh lại.')) {
      deleteImport(id);
    }
  };

  return (
    <div>
      <PageTitle title="Quản Lý Nhập Hàng" />
      <div className={styles.pageHeader}>
        <h2>Quản lý nhập hàng</h2>
        <p>Quản lý các đơn nhập hàng từ nhà cung cấp</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm theo người tạo hoặc mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={handleOpenModal}>Thêm đơn nhập hàng</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Người tạo</th>
              <th>Số sản phẩm</th>
              <th>Tổng tiền hàng</th>
              <th>Phí vận chuyển</th>
              <th>Tổng cộng</th>
              <th>Ngày nhập</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredImports.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có đơn nhập hàng nào
                </td>
              </tr>
            ) : (
              filteredImports.map((imp) => (
                <tr key={imp.id}>
                  <td>#{imp.id.slice(0, 8)}</td>
                  <td>{imp.creatorName}</td>
                  <td>{imp.items?.length || 0} sản phẩm</td>
                  <td>{formatCurrency(imp.subtotal)}</td>
                  <td>{formatCurrency(imp.shippingFee)}</td>
                  <td><strong>{formatCurrency(imp.total)}</strong></td>
                  <td>{formatDate(imp.createdAt)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button size="sm" onClick={() => handleViewImport(imp)}>
                        Xem
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => handleEditImport(imp)}>
                        Sửa
                      </Button>
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={
        modalMode === 'add' ? 'Thêm đơn nhập hàng' : 
        modalMode === 'view' ? 'Chi tiết đơn nhập hàng' : 
        'Chỉnh sửa đơn nhập hàng'
      }>
        <form onSubmit={handleSubmit}>
          {modalMode === 'view' && selectedImport && (
            <div className={modalStyles.formGroup}>
              <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <div><strong>Mã đơn:</strong> #{selectedImport.id.slice(0, 8)}</div>
                <div><strong>Người tạo:</strong> {selectedImport.creatorName}</div>
                <div><strong>Ngày tạo:</strong> {formatDate(selectedImport.createdAt)}</div>
              </div>
            </div>
          )}

          <div className={modalStyles.formGroup}>
            <label>Sản phẩm nhập</label>
            {importItems.map((item, index) => {
              const product = products.find(p => p.id === item.productId);
              return (
                <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flex: '2' }}>
                    {modalMode === 'view' ? (
                      <input
                        type="text"
                        value={product?.name || ''}
                        disabled
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <ProductDropdown
                        index={index}
                        selectedProductId={item.productId}
                        products={products}
                        orderItems={importItems}
                        onSelect={(productId) => {
                          const product = products.find(p => p.id === productId);
                          handleItemChange(index, 'productId', productId);
                          if (product) {
                            handleItemChange(index, 'price', product.price);
                          }
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: '1' }}>
                    <input
                      type="number"
                      placeholder="Số lượng"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="1"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  <div style={{ flex: '1' }}>
                    <input
                      type="number"
                      placeholder="Giá nhập"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                      min="0"
                      step="1000"
                      required
                      disabled={modalMode === 'view'}
                    />
                  </div>
                  {modalMode !== 'view' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => handleRemoveItem(index)}
                      disabled={importItems.length === 1}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              );
            })}
            {modalMode !== 'view' && (
              <Button type="button" variant="secondary" onClick={handleAddItem} style={{ marginTop: '10px' }}>
                + Thêm sản phẩm
              </Button>
            )}
          </div>

          <div className={modalStyles.formGroup}>
            <label>Phí vận chuyển (VNĐ)</label>
            <input
              type="number"
              placeholder="Phí vận chuyển"
              value={shippingFee || ''}
              onChange={(e) => setShippingFee(parseFloat(e.target.value) || 0)}
              min="0"
              step="1000"
              disabled={modalMode === 'view'}
            />
          </div>

          <div className={modalStyles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
              <div>
                <div><strong>Tổng tiền hàng:</strong> {formatCurrency(calculateSubtotal())}</div>
                <div><strong>Phí vận chuyển:</strong> {formatCurrency(shippingFee)}</div>
                <div style={{ fontSize: '1.2em', marginTop: '5px' }}>
                  <strong>Tổng cộng:</strong> {formatCurrency(calculateTotal())}
                </div>
              </div>
            </div>
          </div>

          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              {modalMode === 'view' ? 'Đóng' : 'Hủy'}
            </Button>
            {modalMode !== 'view' && (
              <Button type="submit">
                {modalMode === 'edit' ? 'Cập nhật' : 'Thêm đơn nhập'}
              </Button>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ImportsPage;
