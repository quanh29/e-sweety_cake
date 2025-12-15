import { useState, useEffect } from 'react';
import { Mail, Eye, Trash2, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchWithAuth } from '../utils/api';
import { formatDate } from '../utils/format';
import Button from '../components/Button';
import PageTitle from '../components/PageTitle';
import Modal from '../components/Modal';
import styles from './AdminCommon.module.css';
import modalStyles from './ContactMessagesPage.module.css';

const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const API_URL = `${SERVER_URL}/api`;

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const limit = 10;

  useEffect(() => {
    fetchMessages();
  }, [currentPage, filters]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetchWithAuth(`${API_URL}/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.contacts || []);
        setTotal(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (message) => {
    // Mark as read if unread before opening modal
    if (message.status === 'unread') {
      const updatedMessage = { ...message, status: 'read' };
      setSelectedMessage(updatedMessage);
      setSelectedStatus('read');
      setIsModalOpen(true);
      // Update in background
      await handleUpdateStatus(message.id, 'read', true);
    } else {
      setSelectedMessage(message);
      setSelectedStatus(message.status);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedMessage(null);
    setSelectedStatus('');
    setIsModalOpen(false);
  };

  const handleUpdateStatus = async (id, status, silent = false) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const data = await response.json();
        // Update local state
        setMessages(prev => prev.map(m => 
          m.id === id ? { ...m, status, repliedAt: data.contact?.repliedAt, repliedBy: data.contact?.repliedBy } : m
        ));
        if (selectedMessage && selectedMessage.id === id) {
          setSelectedMessage(prev => ({ 
            ...prev, 
            status, 
            repliedAt: data.contact?.repliedAt, 
            repliedBy: data.contact?.repliedBy 
          }));
          setSelectedStatus(status);
        }
        if (!silent) {
          toast.success('Cập nhật trạng thái thành công!');
        }
      }
    } catch (error) {
      console.error('Update status error:', error);
      if (!silent) {
        toast.error('Lỗi khi cập nhật trạng thái!');
      }
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa tin nhắn này?')) return;

    try {
      const response = await fetchWithAuth(`${API_URL}/contacts/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== id));
        setTotal(prev => prev - 1);
        toast.success('Xóa tin nhắn thành công!');
        if (isModalOpen && selectedMessage?.id === id) {
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Delete message error:', error);
      toast.error('Lỗi khi xóa tin nhắn!');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      unread: { text: 'Chưa đọc', class: styles.statusPending },
      read: { text: 'Đã đọc', class: styles.statusConfirmed },
      replied: { text: 'Đã trả lời', class: styles.statusCompleted }
    };
    const s = statusMap[status] || statusMap.unread;
    return <span className={`${styles.statusBadge} ${s.class}`}>{s.text}</span>;
  };

  return (
    <div>
      <PageTitle title="Tin Nhắn Liên Hệ" />
      <div className={styles.pageHeader}>
        <h2>Tin nhắn liên hệ</h2>
        <p>Xem và quản lý tất cả tin nhắn từ khách hàng</p>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, nội dung..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          <select 
            value={filters.status} 
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="unread">Chưa đọc</option>
            <option value="read">Đã đọc</option>
            <option value="replied">Đã trả lời</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Nội dung</th>
                  <th>Trạng thái</th>
                  <th>Ngày gửi</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {messages.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                      Không có tin nhắn nào
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id}>
                      <td>{message.name}</td>
                      <td>{message.email}</td>
                      <td>{message.phone || '—'}</td>
                      <td>
                        <div style={{ 
                          maxWidth: '300px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap' 
                        }}>
                          {message.message}
                        </div>
                      </td>
                      <td>{getStatusBadge(message.status)}</td>
                      <td>{formatDate(message.createdAt)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <Button 
                            size="sm" 
                            variant="info"
                            onClick={() => handleViewDetails(message)}
                          >
                            <Eye size={16} style={{ marginRight: '5px' }} />
                            Xem
                          </Button>
                          <Button 
                            size="sm" 
                            variant="danger"
                            onClick={() => handleDelete(message.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Hiển thị {messages.length > 0 ? ((currentPage - 1) * limit + 1) : 0} - {Math.min(currentPage * limit, total)} của {total} kết quả
              </div>
              <div className={styles.paginationButtons}>
                <Button
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                >
                  <ChevronLeft size={16} />
                  Trước
                </Button>
                <span className={styles.pageNumber}>
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                >
                  Sau
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Chi tiết tin nhắn"
      >
        {selectedMessage && (
          <div className={modalStyles.detailsContainer}>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Tên:</span>
              <span className={modalStyles.detailValue}>{selectedMessage.name}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Email:</span>
              <span className={modalStyles.detailValue}>
                <a href={`mailto:${selectedMessage.email}`}>{selectedMessage.email}</a>
              </span>
            </div>
            {selectedMessage.phone && (
              <div className={modalStyles.detailRow}>
                <span className={modalStyles.detailLabel}>Điện thoại:</span>
                <span className={modalStyles.detailValue}>
                  <a href={`tel:${selectedMessage.phone}`}>{selectedMessage.phone}</a>
                </span>
              </div>
            )}
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Trạng thái:</span>
              <span className={modalStyles.detailValue}>{getStatusBadge(selectedMessage.status)}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Ngày gửi:</span>
              <span className={modalStyles.detailValue}>{formatDate(selectedMessage.createdAt)}</span>
            </div>
            
            <div className={modalStyles.messageSection}>
              <h3><MessageSquare size={18} style={{ marginRight: '8px' }} />Nội dung tin nhắn:</h3>
              <div className={modalStyles.messageContent}>
                {selectedMessage.message}
              </div>
            </div>

            <div className={modalStyles.statusSection}>
              <h3>Trạng thái:</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '12px' }}>
                <select 
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="unread">Chưa đọc</option>
                  <option value="read">Đã đọc</option>
                  <option value="replied">Đã trả lời</option>
                </select>
                <Button 
                  onClick={() => handleUpdateStatus(selectedMessage.id, selectedStatus)}
                  disabled={selectedStatus === selectedMessage.status}
                >
                  Cập nhật
                </Button>
              </div>
              {selectedMessage.repliedAt && selectedMessage.status === 'replied' && (
                <div style={{ 
                  marginTop: '12px', 
                  padding: '10px', 
                  background: '#ecfdf5', 
                  borderRadius: '6px',
                  fontSize: '0.9em',
                  color: '#065f46'
                }}>
                  Đã trả lời bởi {selectedMessage.repliedBy} vào {formatDate(selectedMessage.repliedAt)}
                </div>
              )}
            </div>

            <div className={modalStyles.modalActions}>
              <Button variant="danger" onClick={() => handleDelete(selectedMessage.id)}>
                <Trash2 size={16} style={{ marginRight: '5px' }} />
                Xóa tin nhắn
              </Button>
              <Button variant="secondary" onClick={handleCloseModal}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactMessagesPage;
