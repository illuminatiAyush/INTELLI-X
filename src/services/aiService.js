const SYSTEM_PROMPT = `You are an AI assistant for IntelliX, a coaching management platform. Help students with studies, tests, attendance, and doubts in a clear and structured way.`;

export const sendMessage = async (message, history = []) => {
    try {
        const apiKey = import.meta.env.VITE_GROQ_API_KEY;
        if (!apiKey) {
            throw new Error("API Key not configured. Please set VITE_GROQ_API_KEY in your environment.");
        }

        // Format history for the API
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'ai' ? 'assistant' : 'user',
            content: msg.text
        }));

        const messages = [
            { role: "system", content: SYSTEM_PROMPT },
            ...formattedHistory,
            { role: "user", content: message }
        ];

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                messages: messages,
                model: "llama-3.1-8b-instant", // Using a default fast/free groq model, can be configured
                temperature: 0.7,
                max_tokens: 1024
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || "I couldn't generate a response.";

    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
};
