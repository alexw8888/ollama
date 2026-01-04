'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, Model } from '../types';

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [models, setModels] = useState<Model[]>([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [error, setError] = useState('');
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchModels();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchModels = async () => {
        try {
            const response = await fetch('/api/models');
            const data = await response.json();
            if (data.error) {
                setError(data.error);
                return;
            }
            setModels(data.models || []);
            if (data.models && data.models.length > 0) {
                setSelectedModel(data.models[0].name);
            }
        } catch {
            setError('Failed to fetch models. Make sure Ollama is running.');
        }
    };

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith('image/')) {
                setError('Please select only image files');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setUploadedImages((prev) => [...prev, base64]);
            };
            reader.readAsDataURL(file);
        });
    }, []);

    const removeImage = useCallback((index: number) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const sendMessage = useCallback(async () => {
        if ((!input.trim() && uploadedImages.length === 0) || !selectedModel) return;

        const userMessage: Message = {
            role: 'user',
            content: input || 'What do you see in this image?',
            images: uploadedImages.length > 0 ? uploadedImages : undefined,
        };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setUploadedImages([]);
        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response from Ollama');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response body');

            let assistantMessage = '';
            const decoder = new TextDecoder();
            setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                assistantMessage += chunk;
                setMessages((prev) => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                        role: 'assistant',
                        content: assistantMessage,
                    };
                    return newMessages;
                });
            }
        } catch {
            setError('Failed to send message. Make sure Ollama is running.');
            setMessages((prev) => prev.slice(0, -1));
        } finally {
            setIsLoading(false);
        }
    }, [input, uploadedImages, selectedModel, messages]);

    const handleNewChat = useCallback(() => {
        setMessages([]);
        setInput('');
        setUploadedImages([]);
        setError('');
    }, []);

    return {
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
    };
}
