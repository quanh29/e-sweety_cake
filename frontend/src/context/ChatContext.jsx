import { createContext, useContext, useState } from 'react';
import { chatAPI } from '../utils/api';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [customerName, setCustomerName] = useState(() => {
    const saved = localStorage.getItem('chatCustomerName');
    return saved || '';
  });
  const [conversationId, setConversationId] = useState(() => {
    const saved = localStorage.getItem('chatConversationId');
    return saved || null;
  });
  const [hasSetName, setHasSetName] = useState(() => {
    const saved = localStorage.getItem('chatHasSetName');
    return saved === 'true';
  });
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const openChat = () => {
    setIsOpen(true);
    setShowGreeting(false);
  };

  const closeChat = () => {
    setIsOpen(false);
  };

  const dismissGreeting = () => {
    setShowGreeting(false);
  };

  const setName = (name) => {
    setCustomerName(name);
    setHasSetName(true);
    localStorage.setItem('chatCustomerName', name);
    localStorage.setItem('chatHasSetName', 'true');
    // Add welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: `Xin chào ${name}! Chúng tôi có thể giúp gì cho bạn?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
    localStorage.setItem('chatMessages', JSON.stringify([welcomeMessage]));
  };

  const sendMessage = async (text) => {
    const newMessage = {
      id: Date.now(),
      text,
      sender: 'user',
      timestamp: new Date()
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    localStorage.setItem('chatMessages', JSON.stringify(updatedMessages));
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(customerName, text, conversationId);
      
      // Save conversationId from response
      if (response.conversationId && !conversationId) {
        setConversationId(response.conversationId);
        localStorage.setItem('chatConversationId', response.conversationId);
      }
      
      const botResponse = {
        id: Date.now() + 1,
        text: response.reply,
        sender: 'bot',
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, botResponse];
      setMessages(finalMessages);
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
    } catch (error) {
      console.error('Error sending message:', error);
      const errorResponse = {
        id: Date.now() + 1,
        text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, errorResponse];
      setMessages(finalMessages);
      localStorage.setItem('chatMessages', JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
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
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
