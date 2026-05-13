import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ChatService from '../services/ChatService';
import '../styles/Chatbot.css';

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hi! 👋 I\'m your task assistant. Ask me about your tasks, team members, deadlines, or project status!' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const appData = useApp();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Add user message
    const newUserMessage = {
      id: messages.length + 1,
      type: 'user',
      text: userMessage
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Simulate slight delay for more natural interaction
    setTimeout(() => {
      const botResponse = ChatService.chat(userMessage, appData);
      const newBotMessage = {
        id: messages.length + 2,
        type: 'bot',
        text: botResponse
      };
      setMessages(prev => [...prev, newBotMessage]);
      setIsLoading(false);
    }, 300);
  };

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    setTimeout(() => {
      const form = document.querySelector('.chatbot-input-form');
      if (form) form.dispatchEvent(new Event('submit', { bubbles: true }));
    }, 0);
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        className="chatbot-button"
        onClick={() => setIsOpen(!isOpen)}
        title="Open task assistant"
        aria-label="Open task assistant"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h3>Task Assistant</h3>
            <button
              className="close-button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message message-${msg.type}`}>
                {msg.type === 'bot' && <span className="bot-avatar">🤖</span>}
                <div className="message-content">
                  {msg.text.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {line}
                      {idx < msg.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message message-bot">
                <span className="bot-avatar">🤖</span>
                <div className="message-content loading">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="chatbot-quick-questions">
              <button onClick={() => handleQuickQuestion('How many tasks do we have?')}>
                📊 Task Count
              </button>
              <button onClick={() => handleQuickQuestion('Show me overdue tasks')}>
                ⚠️ Overdue Tasks
              </button>
              <button onClick={() => handleQuickQuestion('How many team members?')}>
                👥 Team Size
              </button>
              <button onClick={() => handleQuickQuestion('Tasks due soon?')}>
                📅 Due Soon
              </button>
            </div>
          )}

          {/* Input Form */}
          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me about tasks, deadlines, team..."
              disabled={isLoading}
              autoFocus
            />
            <button type="submit" disabled={isLoading || !inputValue.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}

export default Chatbot;
