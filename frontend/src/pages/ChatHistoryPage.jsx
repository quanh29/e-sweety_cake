import { useState, useEffect } from 'react';
import { chatAPI } from '../utils/api';
import { formatDate } from '../utils/format';
import PageTitle from '../components/PageTitle';
import Button from '../components/Button';
import Modal from '../components/Modal';
import styles from './AdminCommon.module.css';
import { MessageCircle, Trash2, Eye, Mail, User } from 'lucide-react';

const ChatHistoryPage = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chatAPI.getConversations();
      setConversations(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Không thể tải lịch sử chat');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = async (conversation) => {
    try {
      const data = await chatAPI.getConversationMessages(conversation.id);
      setSelectedConversation(data.conversation);
      setMessages(data.messages);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error('Error fetching messages:', err);
      alert('Không thể tải tin nhắn');
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cuộc hội thoại này?')) return;

    try {
      await chatAPI.deleteConversation(conversationId);
      setConversations(conversations.filter(conv => conv.id !== conversationId));
      alert('Đã xóa cuộc hội thoại');
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Không thể xóa cuộc hội thoại');
    }
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedConversation(null);
    setMessages([]);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.customerEmail && conv.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <PageTitle title="Lịch Sử Chat" />
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <PageTitle title="Lịch Sử Chat" />
      
      <div className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>
            <MessageCircle size={32} />
            Lịch Sử Chat
          </h1>
          <p className={styles.pageSubtitle}>
            Quản lý lịch sử trò chuyện với khách hàng
          </p>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.filterSection}>
        <input
          type="text"
          placeholder="Tìm kiếm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MessageCircle size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{conversations.length}</div>
            <div className={styles.statLabel}>Tổng cuộc hội thoại</div>
          </div>
        </div>
      </div>

      {filteredConversations.length === 0 ? (
        <div className={styles.emptyState}>
          <MessageCircle size={64} />
          <p>Chưa có cuộc hội thoại nào</p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Khách hàng</th>
                <th>Email</th>
                <th>Tin nhắn cuối</th>
                <th>Thời gian</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredConversations.map((conversation) => (
                <tr key={conversation.id}>
                  <td>
                    <div className={styles.customerInfo}>
                      <User size={18} />
                      <span>{conversation.customerName}</span>
                    </div>
                  </td>
                  <td>
                    {conversation.customerEmail ? (
                      <div className={styles.emailInfo}>
                        <Mail size={16} />
                        <span>{conversation.customerEmail}</span>
                      </div>
                    ) : (
                      <span style={{ color: '#999', fontStyle: 'italic' }}>Không có</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.lastMessage}>
                      {conversation.lastMessage.length > 50
                        ? conversation.lastMessage.substring(0, 50) + '...'
                        : conversation.lastMessage}
                    </div>
                  </td>
                  <td>{formatDate(conversation.lastMessageTime)}</td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewButton}
                        onClick={() => handleViewConversation(conversation)}
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className={styles.deleteButton}
                        onClick={() => handleDeleteConversation(conversation.id)}
                        title="Xóa"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Messages Modal */}
      {isViewModalOpen && selectedConversation && (
        <Modal isOpen={isViewModalOpen} onClose={closeViewModal} title="Chi tiết cuộc hội thoại">
          <div className={styles.conversationDetail}>
            <div className={styles.conversationHeader}>
              <div className={styles.conversationInfo}>
                <div className={styles.infoRow}>
                  <User size={18} />
                  <strong>Khách hàng:</strong> {selectedConversation.customerName}
                </div>
                {selectedConversation.customerEmail && (
                  <div className={styles.infoRow}>
                    <Mail size={18} />
                    <strong>Email:</strong> {selectedConversation.customerEmail}
                  </div>
                )}
                <div className={styles.infoRow}>
                  <MessageCircle size={18} />
                  <strong>Bắt đầu:</strong> {formatDate(selectedConversation.createdAt)}
                </div>
              </div>
            </div>

            <div className={styles.messagesContainer}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.messageItem} ${
                    message.isReply ? styles.replyMessage : styles.customerMessage
                  }`}
                >
                  <div className={styles.messageSender}>
                    {message.isReply ? (
                      <>
                        <MessageCircle size={16} />
                        <span>{message.sender === 'chatbot' ? 'Chatbot' : message.sender}</span>
                      </>
                    ) : (
                      <>
                        <User size={16} />
                        <span>{message.sender}</span>
                      </>
                    )}
                  </div>
                  <div className={styles.messageContent}>{message.content}</div>
                  <div className={styles.messageTime}>{formatDate(message.createdAt)}</div>
                </div>
              ))}
            </div>

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={closeViewModal}>
                Đóng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChatHistoryPage;
