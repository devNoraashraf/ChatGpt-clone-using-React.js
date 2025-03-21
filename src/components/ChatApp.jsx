import React, { useState } from 'react';
import axios from 'axios';

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
  const API_URL = 'https://api.openai.com/v1/chat/completions';

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput('');
    setError('');

    try {
      const response = await axios.post(API_URL, {
        model: "gpt-4o-mini",
        messages: newMessages,
        temperature: 0.7,
      }, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      const reply = response.data.choices[0].message.content;
      setMessages([...newMessages, { role: 'assistant', content: reply }]);
    } catch (err) {
      if (err.response?.status === 429) {
        setError('⚠️ تم إرسال طلبات كثيرة بسرعة! استنى شوية وحاول تاني.');
      } else {
        setError('❌ حصل خطأ: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#343541] font-sans">
      {/* Header */}
      <div className="w-full py-4 px-6 bg-[#202123] text-white text-center text-lg font-medium border-b border-[#2c2c30]">
        ChatGPT Clone
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`rounded-xl px-5 py-3 max-w-[80%] leading-relaxed text-base shadow-sm transition-all ${
                msg.role === 'user'
                  ? 'bg-[#0b93f6] text-white'
                  : 'bg-[#444654] text-white'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-xl px-5 py-3 max-w-[80%] bg-[#444654] text-white leading-relaxed shadow-sm">
              Bot is typing...
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <div className="text-red-500 text-center mb-2">{error}</div>}

      {/* Input */}
      <div className="w-full bg-[#343541] p-4 border-t border-[#2c2c30] sticky bottom-0">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Send a message..."
            className="flex-grow px-4 py-3 rounded-lg bg-[#40414F] text-white focus:outline-none focus:ring-2 focus:ring-[#19C37D] placeholder:text-[#9ca3af] transition-all"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            className="px-4 py-3 bg-[#19C37D] hover:bg-[#16a074] text-white rounded-lg disabled:opacity-50 transition-all"
            disabled={loading}
          >
            {loading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
