'use client';

import { forwardRef } from 'react';
import { Message, Suggestion } from '../types';
import { UserIcon, BotIcon } from './icons';

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    suggestions: Suggestion[];
    onSuggestionClick: (text: string) => void;
}

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
    ({ messages, isLoading, suggestions, onSuggestionClick }, ref) => {
        return (
            <div className="messages-container">
                <div className="messages-inner">
                    {messages.length === 0 ? (
                        <WelcomeScreen
                            suggestions={suggestions}
                            onSuggestionClick={onSuggestionClick}
                        />
                    ) : (
                        messages.map((message, index) => (
                            <MessageRow key={index} message={message} />
                        ))
                    )}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <ThinkingIndicator />
                    )}

                    <div ref={ref} />
                </div>
            </div>
        );
    }
);

MessageList.displayName = 'MessageList';

function WelcomeScreen({
    suggestions,
    onSuggestionClick,
}: {
    suggestions: Suggestion[];
    onSuggestionClick: (text: string) => void;
}) {
    return (
        <div className="welcome-screen">
            <div className="welcome-logo">
                <BotIcon />
            </div>
            <h1 className="welcome-title">How can I help you today?</h1>
            <p className="welcome-subtitle">
                Start a conversation with your local Ollama AI. Select a model and ask anything.
            </p>
            <div className="suggestions-grid">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        className="suggestion-card"
                        onClick={() => onSuggestionClick(s.desc)}
                    >
                        <div className="suggestion-title">{s.title}</div>
                        <div className="suggestion-desc">{s.desc}</div>
                    </button>
                ))}
            </div>
        </div>
    );
}

function MessageRow({ message }: { message: Message }) {
    return (
        <div className={`message-row ${message.role}`}>
            <div className={`message-avatar ${message.role}`}>
                {message.role === 'user' ? <UserIcon /> : <BotIcon />}
            </div>
            <div className="message-content">
                {message.images && message.images.length > 0 && (
                    <div className="message-images">
                        {message.images.map((img, imgIndex) => (
                            <img
                                key={imgIndex}
                                src={img}
                                alt={`Uploaded ${imgIndex + 1}`}
                                className="message-image"
                            />
                        ))}
                    </div>
                )}
                {message.content}
            </div>
        </div>
    );
}

function ThinkingIndicator() {
    return (
        <div className="message-row assistant">
            <div className="message-avatar assistant">
                <BotIcon />
            </div>
            <div className="message-content">
                <div className="thinking-dots">
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                    <span className="thinking-dot" />
                </div>
            </div>
        </div>
    );
}

export default MessageList;
