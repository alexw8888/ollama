'use client';

import { Model, Message } from '../types';
import { PlusIcon, ChatIcon } from './icons';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onNewChat: () => void;
    messages: Message[];
    models: Model[];
    selectedModel: string;
    onModelChange: (model: string) => void;
}

export default function Sidebar({
    isOpen,
    onClose,
    onNewChat,
    messages,
    models,
    selectedModel,
    onModelChange,
}: SidebarProps) {
    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
                <div className="sidebar-header">
                    <button className="new-chat-btn" onClick={onNewChat}>
                        <PlusIcon />
                        New chat
                    </button>
                </div>

                <div className="sidebar-content">
                    {messages.length > 0 && (
                        <div className="conversation-item active">
                            <ChatIcon />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {messages[0]?.content.slice(0, 30) || 'New conversation'}...
                            </span>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="model-selector-container">
                        <span className="model-selector-label">Model</span>
                        <select
                            className="model-selector"
                            value={selectedModel}
                            onChange={(e) => onModelChange(e.target.value)}
                            disabled={models.length === 0}
                        >
                            {models.length === 0 ? (
                                <option>No models available</option>
                            ) : (
                                models.map((model) => (
                                    <option key={model.name} value={model.name}>
                                        {model.name}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>
            </aside>
        </>
    );
}
