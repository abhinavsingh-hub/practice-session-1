import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { marked } from 'marked';

function App() {
  const [text, setText] = useState("");

  const getParsedHTML = () => {
    return { __html: marked.parse(text) };
  };

  const HF_TOKEN = 'VITE_HF_TOKEN_PLACEHOLDER';
  async function HF() {
    console.log("Hello Bacho!!")
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: document.getElementById("ques").value,
            },
          ],
          model: "meta-llama/Llama-3.1-8B-Instruct:novita",
        }),
      })
    const result = await response.json();
    setText(result.choices[0].message.content);
    // const result = await response.json();
    // return result;
  }

  return (
    <>
      <h1>My first react Chat-bot</h1>
      <input id="ques" type="text" placeholder='Ask me anything' />
      <button onClick={HF}>Send</button>
      <h3>Your content will appear here</h3>
      <div
        className="markdown-body"
        dangerouslySetInnerHTML={getParsedHTML()}
      />
    </>
  )
}

export default App
