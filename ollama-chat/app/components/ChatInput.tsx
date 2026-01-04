'use client';

import { useRef, useEffect } from 'react';
import { AttachIcon, SendIcon, CloseIcon } from './icons';

interface ChatInputProps {
    input: string;
    onInputChange: (value: string) => void;
    uploadedImages: string[];
    onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
    onSend: () => void;
    isLoading: boolean;
    hasSelectedModel: boolean;
}

export default function ChatInput({
    input,
    onInputChange,
    uploadedImages,
    onImageUpload,
    onRemoveImage,
    onSend,
    isLoading,
    hasSelectedModel,
}: ChatInputProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
        }
    }, [input]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    const canSend = !isLoading && (input.trim() || uploadedImages.length > 0) && hasSelectedModel;

    return (
        <div className="input-container">
            <div className="input-wrapper">
                {uploadedImages.length > 0 && (
                    <div className="image-preview">
                        {uploadedImages.map((img, index) => (
                            <div key={index} className="image-preview-item">
                                <img src={img} alt={`Preview ${index + 1}`} />
                                <button
                                    onClick={() => onRemoveImage(index)}
                                    className="image-remove-btn"
                                    type="button"
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="input-box">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={onImageUpload}
                        style={{ display: 'none' }}
                    />

                    <button
                        className="attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        type="button"
                        title="Attach images"
                    >
                        <AttachIcon />
                    </button>

                    <textarea
                        ref={textareaRef}
                        className="message-input"
                        value={input}
                        onChange={(e) => onInputChange(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Message Ollama..."
                        rows={1}
                        disabled={isLoading || !hasSelectedModel}
                    />

                    <button
                        className="send-btn"
                        onClick={onSend}
                        disabled={!canSend}
                        type="button"
                    >
                        <SendIcon />
                    </button>
                </div>

                <p className="footer-note">
                    Ollama can make mistakes. Consider checking important information.
                </p>
            </div>
        </div>
    );
}
