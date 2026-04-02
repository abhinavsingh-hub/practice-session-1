export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt } = req.body;
    const token = process.env.VITE_HF_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'HF Token not configured on server' });
    }

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/arcee-ai/Trinity-Large-Thinking/v1/chat/completions",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    messages: [{ role: "user", content: prompt }],
                    model: "arcee-ai/Trinity-Large-Thinking:featherless-ai",
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Serverless Error:', error);
        return res.status(500).json({ error: 'Failed to proxy request to Hugging Face' });
    }
}
