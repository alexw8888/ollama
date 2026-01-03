import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { model, messages } = await req.json();

        if (!model || !messages) {
            return NextResponse.json(
                { error: 'Model and messages are required' },
                { status: 400 }
            );
        }

        // Format messages for Ollama - strip data URL prefix from images
        const formattedMessages = messages.map((msg: { role: string; content: string; images?: string[] }) => {
            const formattedMsg: { role: string; content: string; images?: string[] } = {
                role: msg.role,
                content: msg.content,
            };

            if (msg.images && msg.images.length > 0) {
                // Ollama expects raw base64, not data URLs
                formattedMsg.images = msg.images.map((img: string) => {
                    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
                    const base64Match = img.match(/^data:image\/[^;]+;base64,(.+)$/);
                    return base64Match ? base64Match[1] : img;
                });
            }

            return formattedMsg;
        });

        // Call Ollama API
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: formattedMessages,
                stream: true,
            }),
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: 'Failed to connect to Ollama' },
                { status: 500 }
            );
        }

        // Stream the response
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // Decode and parse the chunk
                        const text = new TextDecoder().decode(value);
                        const lines = text.split('\n').filter(line => line.trim());

                        for (const line of lines) {
                            try {
                                const json = JSON.parse(line);
                                if (json.message?.content) {
                                    controller.enqueue(encoder.encode(json.message.content));
                                }
                            } catch (e) {
                                // Skip invalid JSON lines
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                } finally {
                    controller.close();
                }
            },
        });

        return new NextResponse(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
