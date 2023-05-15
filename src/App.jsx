import { useState } from 'react'
import './App.css'
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

// Define your OpenAI API key
const API_KEY = "ADD_KEY_HERE";

// Define a system message for PlayByGPT
const systemMessage = {
  "role": "system",
  "content": "Explain things like you're a professional sports analyst and you are trying to provide accurate information to your client."
}

function App() {
  // Initialize state variables for messages and typing indicator
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm PlayByGPT! Ask me anything!",
      sentTime: "just now",
      sender: "PlayByGPT"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Handle sending a message
  const handleSend = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user"
    };

    const newMessages = [...messages, newMessage];

    setMessages(newMessages);

    // Show typing indicator and process the message with PlayByGPT
    setIsTyping(true);
    await processMessageToPlayByGPT(newMessages);
  };

  // Process the message with PlayByGPT using the OpenAI API
  async function processMessageToPlayByGPT(chatMessages) {
    // Format messages for PlayByGPT API
    // Each message should be an object with 'role' (user or assistant) and 'content'
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "PlayByGPT") {
        role = "assistant";
      } else {
        role = "user";
      }
      return { role: role, content: messageObject.message }
    });

    // Create the API request body with the model and messages
    // Add the system message at the beginning to define PlayByGPT's behavior
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }

    // Send the API request to OpenAI
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
    }).then((data) => {
      return data.json();
    }).then((data) => {
      // Update the messages with the response from PlayByGPT
      setMessages([...chatMessages, {
        message: data.choices[0].message.content,
        sender: "PlayByGPT"
      }]);
      setIsTyping(false);
    });
  }

  return (
    <div className="App">
      <div style={{ position:"relative", height: "800px", width: "700px"  }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="PlayByGPT is typing" /> : null}
            >
              {messages.map((message, i) => {
                console.log(message)
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Type message here" onSend={handleSend} />        
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default App