import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Sparkles, Image as ImageIcon, Loader2, Send, Globe, Moon, Type, MessageSquareText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const App = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState(null);
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('image'); // 'image' or 'text'

    // Scroll animations for background blobs
    const { scrollYProgress } = useScroll();
    const blobX = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const blobY = useTransform(scrollYProgress, [0, 1], [0, -100]);
    const blob2X = useTransform(scrollYProgress, [0, 1], [0, -200]);
    const blob2Y = useTransform(scrollYProgress, [0, 1], [0, 100]);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setError(null);
        setImage(null);
        setTextContent('');

        try {
            if (mode === 'image') {
                // Using serverless proxy to avoid CORS
                const response = await fetch("/api/image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        prompt: prompt,
                        model: "stabilityai/stable-diffusion-xl-base-1.0",
                    }),
                });

                const result = await response.json();
                console.log("Image Proxy Result:", result);

                if (!response.ok) {
                    throw new Error(result.error || result.message || 'Failed to generate image.');
                }

                if (result.images && result.images[0]?.b64_json) {
                    setImage(`data:image/png;base64,${result.images[0].b64_json}`);
                } else if (result[0]?.b64_json) {
                    setImage(`data:image/png;base64,${result[0].b64_json}`);
                } else {
                    const b64 = result.b64_json || (result.data && result.data[0]?.b64_json);
                    if (b64) setImage(`data:image/png;base64,${b64}`);
                    else throw new Error('Unexpected image API response format.');
                }
            } else {
                // Using serverless proxy to avoid CORS
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt: prompt }),
                });

                const result = await response.json();
                console.log("Chat Proxy Result:", result);

                if (!response.ok) {
                    throw new Error(result.error?.message || result.error || 'Failed to generate text.');
                }

                if (result.choices && result.choices[0]?.message?.content) {
                    setTextContent(result.choices[0].message.content);
                } else {
                    throw new Error('Unexpected text API response format.');
                }
            }
        } catch (err) {
            console.error("Generation Error:", err);
            setError(err.message || 'An error occurred during generation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-container">
            {/* Background Blobs */}
            <motion.div className="blob blob-blue" style={{ x: blobX, y: blobY }} />
            <motion.div className="blob blob-orange" style={{ x: blob2X, y: blob2Y }} />

            {/* Header */}
            <header className="header">
                <div className="logo">
                    <Sparkles size={24} />
                    <span>AI Multi-Gen</span>
                </div>
                <nav className="nav-links">
                    <span>Features</span>
                    <span>Stacks</span>
                    <span style={{ color: '#3b82f6', fontWeight: 600 }}>★ Premium</span>
                </nav>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Moon size={20} style={{ cursor: 'pointer', color: '#a1a1aa' }} />
                    <Globe size={20} style={{ cursor: 'pointer', color: '#a1a1aa' }} />
                    <button className="btn-premium">Premium</button>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    AI <span>Multi-Modal</span> Generator
                </motion.h1>
            </section>

            {/* Main Generator App */}
            <div className="generator-card" style={{ maxWidth: '800px' }}>

                {/* Output Section */}
                <div className="image-display" style={{ minHeight: '300px', marginBottom: '2rem' }}>
                    <AnimatePresence mode="wait">
                        {image ? (
                            <motion.img
                                key="image"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                src={image}
                                alt="Generated"
                            />
                        ) : textContent ? (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="markdown-content"
                            >
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {textContent}
                                </ReactMarkdown>
                            </motion.div>
                        ) : (
                            <motion.div key="placeholder" className="placeholder">
                                {loading ? (
                                    <div className="loading-spinner" />
                                ) : (
                                    <>
                                        {mode === 'image' ? <ImageIcon size={48} strokeWidth={1} /> : <MessageSquareText size={48} strokeWidth={1} />}
                                        <span>Generated {mode === 'image' ? 'image' : 'text'} will appear here</span>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Input & Mode Section */}
                <div className="input-section" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                        <button
                            className={`mode-btn ${mode === 'image' ? 'active' : ''}`}
                            onClick={() => setMode('image')}
                        >
                            <ImageIcon size={18} /> Image
                        </button>
                        <button
                            className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
                            onClick={() => setMode('text')}
                        >
                            <Type size={18} /> Text
                        </button>
                    </div>

                    <div className="input-container">
                        <input
                            type="text"
                            placeholder={mode === 'image' ? "Describe the image you want..." : "Ask anything to Trinity AI..."}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            className="btn-generate"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="loading-spinner" size={20} /> : <Send size={20} />}
                            {loading ? 'Thinking...' : 'Generate'}
                        </button>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.9rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                            {error}
                        </div>
                    )}
                </div>
            </div>

            <footer style={{ marginTop: '5rem', color: '#a1a1aa', fontSize: '0.8rem', paddingBottom: '2rem' }}>
                © 2024 AI Multi-Gen. Built with Antigravity.
            </footer>

            {/* Additional Styles for Toggle */}
            <style>{`
        .mode-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #a1a1aa;
          padding: 0.6rem 1.2rem;
          border-radius: 100px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          transition: all 0.2s;
        }
        .mode-btn.active {
          background: #3b82f6;
          color: white;
          border-color: #3b82f6;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
      `}</style>
        </div>
    );
};

export default App;
