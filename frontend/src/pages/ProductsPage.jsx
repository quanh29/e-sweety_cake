import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';

const ProductsPage = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product = null) => {
    setEditingProduct(product);
    setSelectedImage(null);
    setImagePreview(product?.image || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingProduct(null);
    setSelectedImage(null);
    setImagePreview('');
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const productData = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: parseInt(formData.get('price')) || 0,
      stock: parseInt(formData.get('stock')) || 0,
      imageFile: selectedImage, // Pass the file object
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      deleteProduct(id);
    }
  };

  return (
    <div>
      <PageTitle title="Quản Lý Sản Phẩm" />
      <div className={styles.pageHeader}>
        <h2>Quản lý sản phẩm</h2>
        <p>Quản lý danh sách sản phẩm bánh ngọt</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button onClick={() => handleOpenModal()}>Thêm sản phẩm</Button>
        </div>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Mô tả</th>
              <th>Tồn kho</th>
              <th>Giá bán</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                  Chưa có sản phẩm nào
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.productImage}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.description}</td>
                  <td>{product.stock}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <Button size="sm" variant="warning" onClick={() => handleOpenModal(product)}>
                        Sửa
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(product.id)}>
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
        title={editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
      >
        <form onSubmit={handleSubmit}>
          <div className={modalStyles.formGroup}>
            <label>Tên sản phẩm</label>
            <input type="text" name="name" defaultValue={editingProduct?.name} required />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Mô tả</label>
            <textarea 
              name="description" 
              defaultValue={editingProduct?.description} 
              rows={5}
              style={{ resize: 'vertical' }}
            />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Hình ảnh sản phẩm</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: '10px' }}
            />
            {imagePreview && (
              <div style={{ marginTop: '10px' }}>
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ 
                    maxWidth: '200px', 
                    maxHeight: '200px', 
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #e5e7eb'
                  }} 
                />
              </div>
            )}
          </div>
          <div className={modalStyles.formGroup}>
            <label>Số lượng tồn kho</label>
            <input type="number" name="stock" defaultValue={editingProduct?.stock} required min="0" />
          </div>
          <div className={modalStyles.formGroup}>
            <label>Giá bán (VNĐ)</label>
            <input type="number" name="price" defaultValue={editingProduct?.price} required min="0" />
          </div>
          <div className={modalStyles.formActions}>
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button type="submit">{editingProduct ? 'Cập nhật' : 'Thêm'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
