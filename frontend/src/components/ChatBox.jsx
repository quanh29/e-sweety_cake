import { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageCircle, X, Send } from 'lucide-react';
import styles from './ChatBox.module.css';

const ChatBox = () => {
  const {
    isOpen,
    showGreeting,
    customerName,
    hasSetName,
    messages,
    isLoading,
    openChat,
    closeChat,
    dismissGreeting,
    setName,
    sendMessage
  } = useChat();

  const [nameInput, setNameInput] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (nameInput.trim()) {
      setName(nameInput.trim());
      setNameInput('');
    }
  };

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      sendMessage(messageInput.trim());
      setMessageInput('');
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <div className={styles.chatButtonContainer}>
          {showGreeting && (
            <div className={styles.greetingBubble}>
              <button 
                className={styles.greetingClose}
                onClick={dismissGreeting}
                aria-label="Đóng lời chào"
              >
                <X size={16} />
              </button>
              <p>Bạn cần hỗ trợ gì?</p>
            </div>
          )}
          <button
            className={styles.chatButton}
            onClick={openChat}
            aria-label="Mở chat"
          >
            <MessageCircle size={28} />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <img src="/logo.png" alt="E-Sweetie" className={styles.headerLogo} />
              <div>
                <h3>E-Sweetie Bake</h3>
                <span className={styles.onlineStatus}>Đang hoạt động</span>
              </div>
            </div>
            <button
              className={styles.closeButton}
              onClick={closeChat}
              aria-label="Đóng chat"
            >
              <X size={24} />
            </button>
          </div>

          {/* Messages Area */}
          <div className={styles.messagesArea}>
            {!hasSetName ? (
              <div className={styles.namePrompt}>
                <img src="/logo.png" alt="E-Sweetie" className={styles.promptLogo} />
                <h4>Chào mừng bạn đến với E-Sweetie Bake!</h4>
                <p>Vui lòng cho chúng tôi biết tên của bạn để bắt đầu trò chuyện</p>
                <form onSubmit={handleNameSubmit} className={styles.nameForm}>
                  <input
                    type="text"
                    placeholder="Nhập tên của bạn..."
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className={styles.nameInput}
                    autoFocus
                    required
                  />
                  <button type="submit" className={styles.nameSubmitBtn}>
                    Bắt đầu chat
                  </button>
                </form>
              </div>
            ) : (
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`${styles.message} ${
                      message.sender === 'user' ? styles.userMessage : styles.botMessage
                    }`}
                  >
                    {message.sender === 'bot' && (
                      <img src="/logo.png" alt="Bot" className={styles.messageAvatar} />
                    )}
                    <div className={styles.messageContent}>
                      <p>{message.text}</p>
                      <span className={styles.messageTime}>
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {hasSetName && (
            <form onSubmit={handleMessageSubmit} className={styles.inputArea}>
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className={styles.messageInput}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={!messageInput.trim() || isLoading}
                aria-label="Gửi tin nhắn"
              >
                <Send size={20} />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBox;
