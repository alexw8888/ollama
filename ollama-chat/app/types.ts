export interface Message {
    role: 'user' | 'assistant';
    content: string;
    images?: string[];
}

export interface Model {
    name: string;
    size: number;
    modified_at: string;
}

export interface Suggestion {
    title: string;
    desc: string;
}
