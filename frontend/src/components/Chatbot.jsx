import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera } from 'lucide-react';
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
  const messageIdRef = useRef(10);
  const navigate = useNavigate();

  const nextMessageId = () => {
    messageIdRef.current += 1;
    return messageIdRef.current;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    const newMsg = { id: nextMessageId(), text, sender: 'user' };
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

      setMessages(prev => [...prev, { id: nextMessageId(), text: botResponse, sender: 'bot' }]);
      
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
    setMessages(prev => [...prev, { id: nextMessageId(), image: imageUrl, sender: 'user' }]);
    setIsTyping(true);

    // Simulate AI image recognition
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [
        ...prev, 
        { 
          id: nextMessageId(), 
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
        className={`fixed bottom-20 right-4 sm:bottom-6 sm:right-6 p-4 rounded-full shadow-2xl z-[55] transition-all ${isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'} bg-gradient-to-r from-amber-400 to-orange-500 text-white flex items-center justify-center`}
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
            className="theme-card-strong fixed bottom-20 right-4 z-[55] flex h-[480px] max-h-[75vh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl sm:bottom-6 sm:right-6 sm:h-[550px] sm:max-h-[80vh] sm:w-[380px]"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-brand-yellow to-brand-red flex items-center justify-between shadow-md text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <span className="font-black text-lg">AI</span>
                </div>
                <div>
                  <h3 className="font-bold text-sm">GoldMarket Assistant</h3>
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
            <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8efe6]/70 p-4 dark:bg-gray-900/50">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-amber-700 text-white dark:bg-gray-700 rounded-br-sm' 
                      : 'border border-black/5 bg-[#f4ece4] text-[#2d2926] dark:border-gray-700 dark:bg-gray-800 dark:text-white rounded-bl-sm'
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
                  <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-black/5 bg-[#f4ece4] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
                    className="whitespace-nowrap rounded-full border border-black/5 bg-[#ead9c8] px-3 py-1.5 text-xs text-[#6f5a49] transition-colors hover:bg-[#dfc8b5] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="border-t border-black/5 bg-[#f4ece4] p-3 dark:border-gray-800 dark:bg-gray-900">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 relative"
              >
                <div className="relative flex flex-1 items-center rounded-full border border-black/5 bg-[#ead9c8] dark:border-gray-700 dark:bg-gray-800">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask AI or upload photo..."
                    className="flex-1 bg-transparent py-2.5 pl-4 pr-10 text-sm text-[#2d2926] outline-none placeholder:text-[#8d7563] dark:text-white dark:placeholder:text-white/35"
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
                    className="absolute right-2 rounded-full p-1.5 text-[#8d7563] transition-colors hover:bg-amber-100 hover:text-amber-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-300"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white shadow-sm transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-brand-yellow dark:text-text-light dark:hover:bg-yellow-400"
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
