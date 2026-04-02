export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { prompt, model } = req.body;
    const token = process.env.VITE_HF_TOKEN;

    if (!token) {
        return res.status(500).json({ error: 'HF Token not configured on server' });
    }

    try {
        const response = await fetch(
            "https://router.huggingface.co/nscale/v1/images/generations",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({
                    response_format: "b64_json",
                    prompt,
                    model,
                }),
            }
        );

        const result = await response.json();

        if (!response.ok) {
            return res.status(response.status).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error('Serverless Image Error:', error);
        return res.status(500).json({ error: 'Failed to proxy image request to Hugging Face' });
    }
}
