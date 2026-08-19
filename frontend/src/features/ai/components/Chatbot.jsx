import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Send, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const INITIAL_MESSAGES = [
  { id: 1, text: "Welcome to your Private Concierge. I am here to assist you in discovering extraordinary pieces.", sender: 'bot' },
  { id: 2, text: "How may I curate your experience today? You may also upload an image of a piece you desire.", sender: 'bot' },
];

const SUGGESTED_PROMPTS = [
  'Curate a collection of watches',
  'Show me latest arrivals',
  'Bespoke recommendations',
];

const CATEGORY_MAP = {
  watch: 'Watches',
  smartwatch: 'Watches',
  shoe: 'Sneakers',
  sneaker: 'Sneakers',
  laptop: 'Electronics',
  phone: 'Electronics',
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageIdRef = useRef(10);
  const objectUrlRef = useRef(null);
  const navigate = useNavigate();

  const nextId = () => { messageIdRef.current += 1; return messageIdRef.current; };

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  const handleSend = useCallback(async (text = inputValue) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { id: nextId(), text: trimmed, sender: 'user' }]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const lower = trimmed.toLowerCase();
      let botResponse = "Allow me a moment to consult our archives for pieces matching your refined taste.";
      let redirectUrl = null;

      if (lower.includes('hello') || lower.includes('hi')) {
        botResponse = "Greetings. It is a pleasure to assist you. What are you looking for today?";
      } else {
        for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
          if (lower.includes(keyword)) {
            botResponse = `I have curated an exquisite selection of ${category} for you. Redirecting you now.`;
            redirectUrl = `/products?category=${category}`;
            break;
          }
        }
      }

      setMessages((prev) => [...prev, { id: nextId(), text: botResponse, sender: 'bot' }]);

      if (redirectUrl) {
        setTimeout(() => {
          navigate(redirectUrl);
          setIsOpen(false);
        }, 2000);
      }
    }, 1500);
  }, [inputValue, navigate]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const imageUrl = URL.createObjectURL(file);
    objectUrlRef.current = imageUrl;

    setMessages((prev) => [...prev, { id: nextId(), image: imageUrl, sender: 'user' }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          text: "An impeccable choice. Our visual analysis suggests this is a premium timepiece. Let me guide you to our collection.",
          sender: 'bot',
        },
      ]);
      setTimeout(() => {
        navigate('/products?category=Watches');
        setIsOpen(false);
      }, 2500);
    }, 2000);

    e.target.value = '';
  }, [navigate]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const cameraClick = useCallback(() => fileInputRef.current?.click(), []);
  const onSubmit = useCallback((e) => { e.preventDefault(); handleSend(); }, [handleSend]);
  const onChange = useCallback((e) => setInputValue(e.target.value), []);

  return (
    <>
      <button
        onClick={open}
        aria-label="Open Private Concierge"
        className={`fixed bottom-20 right-4 z-[55] flex items-center justify-center w-14 h-14 rounded-full bg-surface-primary border border-surface-border text-color-gold shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-color-gold/20 sm:bottom-8 sm:right-8 ${
          isOpen ? 'pointer-events-none opacity-0 scale-90 translate-y-4' : 'opacity-100'
        }`}
      >
        <Sparkles size={22} className="relative z-10" />
        <span className="absolute inset-0 rounded-full border border-color-gold/30 animate-[ping_3s_ease-in-out_infinite]" />
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[55] flex h-[500px] max-h-[75vh] w-[calc(100vw-32px)] flex-col overflow-hidden bg-bg-primary border border-surface-border rounded-[2rem] shadow-2xl animate-[menuIn_400ms_cubic-bezier(0.22,1,0.36,1)] sm:bottom-8 sm:right-8 sm:h-[600px] sm:max-h-[85vh] sm:w-[400px]">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-surface-primary border-b border-surface-border p-6 px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-primary border border-surface-border text-color-gold">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-text-primary">Private Concierge</h3>
                <p className="flex items-center gap-2 text-[10px] text-text-secondary uppercase tracking-widest mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-color-gold animate-pulse" />
                  {' '}At your service
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="text-text-secondary hover:text-color-gold transition-colors"
              aria-label="Close concierge"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-6 overflow-y-auto p-6 px-8 no-scrollbar scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex animate-[fadeSlideUp_300ms_ease-out] ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'bot' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-surface-border bg-surface-primary flex items-center justify-center text-color-gold mr-3 mt-1">
                     <Sparkles size={12} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 text-sm leading-relaxed tracking-wide ${
                    msg.sender === 'user'
                      ? 'bg-surface-primary text-text-primary border border-surface-border rounded-2xl rounded-tr-sm shadow-md'
                      : 'bg-transparent text-text-secondary border-l border-color-gold/30 pl-4 py-2'
                  }`}
                >
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="Client inquiry"
                      loading="lazy"
                      decoding="async"
                      className="max-w-full rounded-xl"
                    />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start items-center animate-[fadeIn_300ms_ease-out]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border border-surface-border bg-surface-primary flex items-center justify-center text-color-gold mr-3">
                   <Sparkles size={12} className="animate-spin-slow" />
                </div>
                <div className="flex gap-1.5 border-l border-color-gold/30 pl-4 py-3">
                  <span className="h-1 w-1 rounded-full bg-color-gold animate-[bounce_1.2s_infinite_0ms]" />
                  <span className="h-1 w-1 rounded-full bg-color-gold animate-[bounce_1.2s_infinite_150ms]" />
                  <span className="h-1 w-1 rounded-full bg-color-gold animate-[bounce_1.2s_infinite_300ms]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} className="h-4" />
          </div>

          {/* Suggested Prompts */}
          {messages.length < 4 && !isTyping && (
            <div className="no-scrollbar flex gap-3 overflow-x-auto px-8 pb-4">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap flex-shrink-0 rounded-full border border-surface-border bg-surface-primary px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary transition-colors hover:text-color-gold hover:border-color-gold/50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-surface-border bg-surface-primary p-4 px-6">
            <form onSubmit={onSubmit} className="relative flex items-center gap-3">
              <div className="relative flex flex-1 items-center rounded-full border border-surface-border bg-bg-primary overflow-hidden transition-colors focus-within:border-color-gold/50">
                <input
                  type="text"
                  value={inputValue}
                  onChange={onChange}
                  placeholder="Inquire with your concierge..."
                  className="flex-1 bg-transparent py-3.5 pl-6 pr-12 text-sm text-text-primary outline-none placeholder:text-text-muted"
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
                  onClick={cameraClick}
                  className="absolute right-3 rounded-full p-2 text-text-muted transition-colors hover:text-color-gold"
                  aria-label="Upload visual reference"
                >
                  <Camera size={16} />
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-text-primary text-bg-primary transition-colors hover:bg-color-gold disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send inquiry"
              >
                <Send size={16} className="ml-0.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
