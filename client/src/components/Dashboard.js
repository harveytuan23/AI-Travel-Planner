import React, { useState, useRef, useEffect } from 'react';
import './Dashboard.css';
import Map from './Map';
import axios from 'axios';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    if (inputText.trim() === '' && files.length === 0) return;
    
    setIsLoading(true);

    const newMessage = {
      id: Date.now(),
      text: inputText,
      files: files,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([...messages, newMessage]);

    try {
      console.log('Sending chat request with prompt:', inputText);
      const response = await axios.post('http://localhost:3001/chat', {
        prompt: inputText
      });
      
      console.log('Received API response:', response.data);
      
      const aiReply = {
        id: Date.now() + 1,
        text: response.data,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prevMessages => [...prevMessages, aiReply]);
    } catch (error) {
      console.error('Error calling chat API:', error);
      
      const errorReply = {
        id: Date.now() + 1,
        text: `Sorry, I couldn't process your message. Error: ${error.message}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prevMessages => [...prevMessages, errorReply]);
    } finally {
      setInputText('');
      setFiles([]);
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    
    const fileObjects = selectedFiles.map(file => ({
      name: file.name,
      type: file.type,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : null,
      size: (file.size / 1024).toFixed(2) + ' KB',
      file: file
    }));
    
    setFiles([...files, ...fileObjects]);
  };
  
  const removeFile = (index) => {
    const newFiles = [...files];
    
    if (newFiles[index].preview) {
      URL.revokeObjectURL(newFiles[index].preview);
    }
    
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Travel Planer</h1>
        <div className="user-info">
          <span>{localStorage.getItem('username') || 'User'}</span>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <div className="dashboard-content">
        <div className="map-section">
          <Map />
        </div>
        
        <div className="chat-container">
          <div className="messages-container">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  <p>{message.text}</p>
                  {message.files && message.files.map((file, index) => (
                    <div key={index} className="message-file">
                      {file.preview ? (
                        <img src={file.preview} alt={file.name} />
                      ) : (
                        <div className="file-info">
                          <span className="file-icon">📄</span>
                          <span className="file-name">{file.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <span className="timestamp">{message.timestamp}</span>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          <form className="chat-input-form" onSubmit={handleTextSubmit}>
            <div className="file-input-container">
              <label htmlFor="file-upload" className="file-upload-label">
                📎
              </label>
              <input 
                type="file" 
                id="file-upload" 
                multiple
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*,.pdf"
              />
            </div>
            
            {files.length > 0 && (
              <div className="selected-files">
                {files.map((file, index) => (
                  <div key={index} className="selected-file">
                    <span>{file.name}</span>
                    <button 
                      type="button" 
                      onClick={() => removeFile(index)}
                      className="remove-file-button"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="input-button-container">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Add your Plan..."
                className="chat-text-input"
                disabled={isLoading}
              />
              
              <button 
                type="submit" 
                className="send-button"
                disabled={isLoading || (inputText.trim() === '' && files.length === 0)}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 