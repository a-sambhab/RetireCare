import React, { useState } from 'react';
import Markdown from 'react-markdown';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = () => {
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);

  const handleUserInputChange = (event) => {
    setUserInput(event.target.value);
  };

  const handleSendMessage = () => {
    if (userInput === '') {
      return;
    }

    const userMessage = {
      author: 'User',
      message: userInput,
    };

    setChatHistory([...chatHistory, userMessage]);

    setUserInput('');
    handleResponse(userInput);
  };

  const handleResponse = async(userInput) => {
    let prompt;
    if(chatHistory.length>=2){
        prompt = `This was your previous reply ${chatHistory[chatHistory.length-1].message}. ${userInput}`
    }
    else {
        prompt = userInput
    }
    const response = await axios.post("http://localhost:5000/getPlan",{"prompt": prompt})
    console.log(response)
    const bardResponse = {
        author: 'Bard',
        message: response.data.plan,
      };
      const userMessage = {
        author: 'User',
        message: userInput,
      };
    setChatHistory([...chatHistory, userMessage, bardResponse]);
  }

  return (
    <div className='chat-container'>
        
    <div className="chat-interface">
      <div className="chat-history">
        {chatHistory.map((message) => (
            <div className={`chat-message ${message.author}`}>
            <Markdown>{message.message}</Markdown>
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input className='chat-input-input' type="text" value={userInput} onChange={handleUserInputChange} />
        <button className='chat-input-button' onClick={handleSendMessage}>Send</button>
      </div>
    </div>
    </div>
  );
};

export default ChatInterface;
