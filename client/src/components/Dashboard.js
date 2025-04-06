import React, { useState, useRef, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [files, setFiles] = useState([]);
  const messagesEndRef = useRef(null);
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (inputText.trim() === '' && files.length === 0) return;
    

    const newMessage = {
      id: Date.now(),
      text: inputText,
      files: files,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages([...messages, newMessage]);

    setInputText('');
    setFiles([]);
    
    // 模拟AI回复
    setTimeout(() => {
      const aiReply = {
        id: Date.now() + 1,
        text: `Received your message: "${inputText}"${files.length > 0 ? ` and ${files.length} files` : ''}`,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prevMessages => [...prevMessages, aiReply]);
    }, 1000);
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
    window.location.href = '/login';
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Travel Planer </h1>
        <button className="logout-button" onClick={handleLogout}>Logout</button>
      </header>
      
      <div className="chat-container">
        <div className="messages-container">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-header">
                <span className="message-sender">{message.sender === 'user' ? 'You' : 'Assistant'}</span>
                <span className="message-time">{message.timestamp}</span>
              </div>
              
              <div className="message-content">
                {message.text && <p>{message.text}</p>}
                
                {message.files && message.files.length > 0 && (
                  <div className="message-files">
                    {message.files.map((file, index) => (
                      <div key={index} className="file-item">
                        {file.preview ? (
                          <img src={file.preview} alt={file.name} className="file-preview" />
                        ) : (
                          <div className="file-icon">
                            {file.type.includes('pdf') ? '📄' : '📎'}
                          </div>
                        )}
                        <div className="file-details">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{file.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Add your..."
            className="chat-text-input"
          />
          
          <button 
            type="submit" 
            className="send-button"
            disabled={inputText.trim() === '' && files.length === 0}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Dashboard; 