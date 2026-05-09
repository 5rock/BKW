import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_MESSAGES = [
  { id: 1, text: "Hi there! 👋 I'm your AI Shopping Assistant.", sender: 'bot' },
  { id: 2, text: "You can ask me to find products, or upload an image to search by photo!", sender: 'bot' }
];

const SUGGESTED_PROMPTS = [
  "Find smartwatches under $200",
  "Show me trending sneakers",
  "Best laptops for gaming"
];

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const newMsg = { id: Date.now(), text, sender: 'user' };
    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI thinking and response
    setTimeout(() => {
      setIsTyping(false);
      let botResponse = "I can help you find that! Let me search our catalog.";
      let redirectUrl = null;

      const lowerText = text.toLowerCase();
      if (lowerText.includes('watch') || lowerText.includes('smartwatch')) {
        botResponse = "I found some great smartwatches for you!";
        redirectUrl = '/products?category=Watches';
      } else if (lowerText.includes('shoe') || lowerText.includes('sneaker')) {
        botResponse = "Check out these trending sneakers!";
        redirectUrl = '/products?category=Sneakers';
      } else if (lowerText.includes('hello') || lowerText.includes('hi')) {
        botResponse = "Hello! How can I assist your shopping today?";
      }

      setMessages(prev => [...prev, { id: Date.now(), text: botResponse, sender: 'bot' }]);
      
      if (redirectUrl) {
        setTimeout(() => {
          navigate(redirectUrl);
          setIsOpen(false);
        }, 1500);
      }
    }, 1500);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setMessages(prev => [...prev, { id: Date.now(), image: imageUrl, sender: 'user' }]);
    setIsTyping(true);

    // Simulate AI image recognition
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: "I analyzed the image. It looks like you're searching for a Premium Watch. Here are some similar products!", 
          sender: 'bot' 
        }
      ]);
      
      setTimeout(() => {
        navigate('/products?category=Watches');
        setIsOpen(false);
      }, 2000);

    }, 2500);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-50 transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} bg-gradient-to-r from-brand-yellow to-brand-red text-white flex items-center justify-center`}
      >
        <MessageSquare className="h-7 w-7" />
        <span className="absolute -top-2 -right-2 bg-text-light text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-bounce">AI</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 sm:w-[380px] w-[calc(100vw-48px)] h-[550px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-yellow to-brand-red flex items-center justify-between shadow-md text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="font-black text-lg">AI</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">MarketX Assistant</h3>
                  <p className="text-xs text-white/80 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-text-light dark:bg-gray-700 text-white rounded-br-sm' 
                      : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-text-light dark:text-text-dark rounded-bl-sm'
                  }`}>
                    {msg.image ? (
                      <img src={msg.image} alt="User upload" className="rounded-lg max-w-full h-auto mb-1" />
                    ) : (
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-sm p-4 flex gap-1 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompts */}
            {messages.length < 4 && !isTyping && (
              <div className="px-4 pb-2 flex overflow-x-auto gap-2 no-scrollbar">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="whitespace-nowrap text-xs bg-gray-100 dark:bg-gray-800 text-text-muted-light dark:text-text-muted-dark px-3 py-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 relative"
              >
                <div className="flex-1 relative flex items-center bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask AI or upload photo..."
                    className="flex-1 bg-transparent py-2.5 pl-4 pr-10 text-sm text-text-light dark:text-text-dark focus:outline-none"
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload}
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute right-2 p-1.5 text-gray-400 hover:text-brand-yellow hover:bg-yellow-50 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 rounded-full bg-text-light dark:bg-brand-yellow text-white dark:text-text-light flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black dark:hover:bg-yellow-400 transition-colors shadow-sm shrink-0"
                >
                  <Send className="h-4 w-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
