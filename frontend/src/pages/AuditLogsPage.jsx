import { useState, useEffect } from 'react';
import { Eye, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/format';
import Button from '../components/Button';
import Modal from '../components/Modal';
import PageTitle from '../components/PageTitle';
import styles from './AdminCommon.module.css';
import modalStyles from '../components/Modal.module.css';
import { fetchWithAuth } from '../utils/api';

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    resource_type: '',
    action: '',
    username: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const limit = 10;

  useEffect(() => {
    fetchLogs();
  }, [currentPage, filters]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(filters.resource_type && { resource_type: filters.resource_type }),
        ...(filters.action && { action: filters.action }),
        ...(filters.username && { username: filters.username })
      });

      const response = await fetchWithAuth(`/audit-logs?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (log) => {
    setSelectedLog(log);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedLog(null);
    setIsModalOpen(false);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const getResourceTypeBadge = (type) => {
    const typeMap = {
      order: { text: 'Đơn hàng', class: styles.badgeBlue },
      product: { text: 'Sản phẩm', class: styles.badgeGreen },
      user: { text: 'Người dùng', class: styles.badgePurple },
      voucher: { text: 'Voucher', class: styles.badgeOrange },
      import: { text: 'Nhập hàng', class: styles.badgeCyan },
      contact: { text: 'Tin nhắn liên hệ', class: styles.badgeBlue }
    };
    const badge = typeMap[type] || { text: type, class: styles.badgeGray };
    return <span className={`${styles.badge} ${badge.class}`}>{badge.text}</span>;
  };

  const getActionBadge = (action) => {
    const actionMap = {
      create: { text: 'Tạo mới', class: styles.statusConfirmed },
      update: { text: 'Cập nhật', class: styles.statusPending },
      delete: { text: 'Xóa', class: styles.statusCancelled }
    };
    const badge = actionMap[action] || { text: action, class: styles.badgeGray };
    return <span className={`${styles.statusBadge} ${badge.class}`}>{badge.text}</span>;
  };

  const renderDataDiff = (oldData, newData) => {
    if (!oldData && !newData) return <p>Không có dữ liệu</p>;

    return (
      <div className={styles.dataDiff}>
        {oldData && (
          <div className={styles.dataColumn}>
            <h4>Dữ liệu cũ:</h4>
            <pre className={styles.jsonData}>{JSON.stringify(oldData, null, 2)}</pre>
          </div>
        )}
        {newData && (
          <div className={styles.dataColumn}>
            <h4>{oldData ? 'Dữ liệu mới:' : 'Dữ liệu:'}</h4>
            <pre className={styles.jsonData}>{JSON.stringify(newData, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <PageTitle title="Lịch Sử Hoạt Động" />
      <div className={styles.pageHeader}>
        <h2>Lịch sử hoạt động</h2>
        <p>Xem tất cả các thay đổi trên hệ thống</p>
      </div>

      <div className={styles.contentCard}>
        {/* Filters */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng..."
            value={filters.username}
            onChange={(e) => handleFilterChange('username', e.target.value)}
          />
          <select 
            value={filters.resource_type} 
            onChange={(e) => handleFilterChange('resource_type', e.target.value)}
          >
            <option value="">Tất cả tài nguyên</option>
            <option value="order">Đơn hàng</option>
            <option value="product">Sản phẩm</option>
            <option value="user">Người dùng</option>
            <option value="voucher">Voucher</option>
            <option value="import">Nhập hàng</option>
            <option value="contact">Tin nhắn liên hệ</option>
          </select>
          <select 
            value={filters.action} 
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="">Tất cả hành động</option>
            <option value="create">Tạo mới</option>
            <option value="update">Cập nhật</option>
            <option value="delete">Xóa</option>
          </select>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</p>
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tài nguyên</th>
                  <th>Hành động</th>
                  <th>Người thực hiện</th>
                  <th>Vai trò</th>
                  <th>Thời gian</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td>{getResourceTypeBadge(log.resource_type)}</td>
                      <td>{getActionBadge(log.action)}</td>
                      <td>{log.username}</td>
                      <td>
                        <span className={`${styles.badge} ${log.role === 'admin' ? styles.badgePurple : styles.badgeGray}`}>
                          {log.role}
                        </span>
                      </td>
                      <td>{formatDate(log.timestamp)}</td>
                      <td>
                        <Button 
                          size="sm" 
                          onClick={() => handleViewDetails(log)}
                        >
                          <Eye size={16} style={{ marginRight: '5px' }} />
                          Xem
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Hiển thị {logs.length > 0 ? ((currentPage - 1) * limit + 1) : 0} - {Math.min(currentPage * limit, total)} của {total} kết quả
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

      {/* Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Chi tiết hoạt động"
      >
        {selectedLog && (
          <div className={modalStyles.detailsContainer}>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>ID:</span>
              <span className={modalStyles.detailValue}>{selectedLog.id}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>User ID:</span>
              <span className={modalStyles.detailValue}>{selectedLog.user_id || 'N/A'}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Người dùng:</span>
              <span className={modalStyles.detailValue}>{selectedLog.username}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Vai trò:</span>
              <span className={modalStyles.detailValue}>{selectedLog.role}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Hành động:</span>
              <span className={modalStyles.detailValue}>{getActionBadge(selectedLog.action)}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Tài nguyên:</span>
              <span className={modalStyles.detailValue}>{getResourceTypeBadge(selectedLog.resource_type)}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>ID tài nguyên:</span>
              <span className={modalStyles.detailValue}>{selectedLog.resource_id}</span>
            </div>
            <div className={modalStyles.detailRow}>
              <span className={modalStyles.detailLabel}>Thời gian:</span>
              <span className={modalStyles.detailValue}>{formatDate(selectedLog.timestamp)}</span>
            </div>
            {selectedLog.ip_address && (
              <div className={modalStyles.detailRow}>
                <span className={modalStyles.detailLabel}>IP Address:</span>
                <span className={modalStyles.detailValue}>{selectedLog.ip_address}</span>
              </div>
            )}
            
            <div className={modalStyles.dataDiffSection}>
              <h3>Dữ liệu thay đổi:</h3>
              {renderDataDiff(selectedLog.old_data, selectedLog.new_data)}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogsPage;
