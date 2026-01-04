'use client';

import { useState } from 'react';
import { useChat } from './hooks/useChat';
import { SUGGESTIONS } from './constants';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { MenuIcon, PlusIcon } from './components/icons';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const {
    messages,
    input,
    setInput,
    isLoading,
    models,
    selectedModel,
    setSelectedModel,
    error,
    uploadedImages,
    messagesEndRef,
    handleImageUpload,
    removeImage,
    sendMessage,
    handleNewChat,
  } = useChat();

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  return (
    <div className="app-container">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        messages={messages}
        models={models}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="chat-header">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <MenuIcon />
          </button>
          {!sidebarOpen && (
            <button className="header-new-chat" onClick={handleNewChat} title="New chat">
              <PlusIcon />
            </button>
          )}
        </header>

        {/* Error Banner */}
        {error && <div className="error-banner">{error}</div>}

        {/* Messages */}
        <MessageList
          ref={messagesEndRef}
          messages={messages}
          isLoading={isLoading}
          suggestions={SUGGESTIONS}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Input Area */}
        <ChatInput
          input={input}
          onInputChange={setInput}
          uploadedImages={uploadedImages}
          onImageUpload={handleImageUpload}
          onRemoveImage={removeImage}
          onSend={sendMessage}
          isLoading={isLoading}
          hasSelectedModel={!!selectedModel}
        />
      </main>
    </div>
  );
}
