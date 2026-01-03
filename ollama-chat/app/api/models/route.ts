import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Call Ollama API to get list of models
        const response = await fetch('http://localhost:11434/api/tags');

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to connect to Ollama. Make sure Ollama is running.' },
                { status: 500 }
            );
        }

        const data = await response.json();

        // Extract model names from the response
        const models = data.models?.map((model: any) => ({
            name: model.name,
            size: model.size,
            modified_at: model.modified_at,
        })) || [];

        return NextResponse.json({ models });
    } catch (error) {
        console.error('Models API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch models from Ollama' },
            { status: 500 }
        );
    }
}
