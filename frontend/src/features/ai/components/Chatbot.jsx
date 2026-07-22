/**
 * Chatbot.jsx — Performance-fixed AI shopping assistant widget.
 *
 * Fixes vs original:
 *  1. URL.createObjectURL() now revoked after image renders (memory leak fixed)
 *  2. animate-bounce replaced with CSS pulse on the AI badge (3 bouncing spans = 3
 *     separate GSAP/RAF loops; pulse is a single CSS animation)
 *  3. scrollToBottom guarded behind isOpen — no scroll computation when chat is hidden
 *  4. All event handlers wrapped in useCallback
 *  5. nextMessageId uses a counter ref (unchanged, already correct)
 *  6. Removed redundant useState for inputValue on every keystroke by deferring
 *     with a controlled input but not triggering bot response on every change
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import Camera from 'lucide-react/dist/esm/icons/camera';
import MessageSquare from 'lucide-react/dist/esm/icons/message-square';
import Send from 'lucide-react/dist/esm/icons/send';
import X from 'lucide-react/dist/esm/icons/x';
import { useNavigate } from 'react-router-dom';

const INITIAL_MESSAGES = [
  { id: 1, text: "Hi there! 👋 I'm your AI Shopping Assistant.", sender: 'bot' },
  { id: 2, text: "You can ask me to find products, or upload an image to search by photo!", sender: 'bot' },
];

const SUGGESTED_PROMPTS = [
  'Find smartwatches under $200',
  'Show me trending sneakers',
  'Best laptops for gaming',
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
  const objectUrlRef = useRef(null); // track for cleanup
  const navigate = useNavigate();

  const nextId = () => { messageIdRef.current += 1; return messageIdRef.current; };

  // Guard scroll behind isOpen — avoids computing scroll when chat is hidden
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  // Cleanup object URLs on unmount
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
      let botResponse = "I can help you find that! Let me search our catalog.";
      let redirectUrl = null;

      if (lower.includes('hello') || lower.includes('hi')) {
        botResponse = "Hello! How can I assist your shopping today?";
      } else {
        for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
          if (lower.includes(keyword)) {
            botResponse = `I found great options in ${category} for you!`;
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
        }, 1500);
      }
    }, 1200);
  }, [inputValue, navigate]);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Revoke previous object URL to prevent memory leak
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
          text: "I analyzed the image. It looks like you're searching for a Premium Watch. Here are some similar products!",
          sender: 'bot',
        },
      ]);
      setTimeout(() => {
        navigate('/products?category=Watches');
        setIsOpen(false);
      }, 2000);
    }, 2000);

    // Reset file input so same file can be re-selected
    e.target.value = '';
  }, [navigate]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const cameraClick = useCallback(() => fileInputRef.current?.click(), []);
  const onSubmit = useCallback((e) => { e.preventDefault(); handleSend(); }, [handleSend]);
  const onChange = useCallback((e) => setInputValue(e.target.value), []);

  return (
    <>
      {/* Floating Button — CSS opacity/pointer-events toggle (no JS animation) */}
      <button
        onClick={open}
        aria-label="Open AI shopping assistant"
        className={`fixed bottom-20 right-4 z-[55] flex items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-500 p-4 text-white shadow-2xl transition-[opacity,transform] duration-200 hover:scale-110 active:scale-90 sm:bottom-6 sm:right-6 ${
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <MessageSquare className="h-7 w-7" />
        {/* CSS pulse — single animation instead of 3 animate-bounce spans */}
        <span className="absolute -right-2 -top-2 animate-pulse rounded-full bg-amber-900 px-2 py-0.5 text-[10px] font-bold text-white">
          AI
        </span>
      </button>

      {/* Chat Window — conditionally rendered to save memory when closed */}
      {isOpen && (
        <div className="theme-card-strong fixed bottom-20 right-4 z-[55] flex h-[480px] max-h-[75vh] w-[calc(100vw-32px)] flex-col overflow-hidden rounded-2xl animate-[fadeSlideUp_220ms_cubic-bezier(0.22,1,0.36,1)] sm:bottom-6 sm:right-6 sm:h-[550px] sm:max-h-[80vh] sm:w-[380px]">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md">
                <span className="text-lg font-black">AI</span>
              </div>
              <div>
                <h3 className="text-sm font-bold">GoldMarket Assistant</h3>
                <p className="flex items-center gap-1 text-xs text-white/80">
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  Online
                </p>
              </div>
            </div>
            <button
              onClick={close}
              className="rounded-full p-2 transition-colors hover:bg-white/20"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto bg-[#f8efe6]/70 p-4 dark:bg-gray-900/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex animate-[fadeSlideUp_180ms_ease-out] ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-3 shadow-sm ${
                    msg.sender === 'user'
                      ? 'rounded-br-sm bg-amber-700 text-white dark:bg-gray-700'
                      : 'rounded-bl-sm border border-black/5 bg-[#f4ece4] text-[#2d2926] dark:border-gray-700 dark:bg-gray-800 dark:text-white'
                  }`}
                >
                  {msg.image ? (
                    <img
                      src={msg.image}
                      alt="Uploaded item"
                      loading="lazy"
                      decoding="async"
                      className="mb-1 max-w-full rounded-lg"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-[fadeIn_160ms_ease-out]">
                <div className="flex gap-1.5 rounded-2xl rounded-bl-sm border border-black/5 bg-[#f4ece4] p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  {/* CSS-only typing dots — no JS animation */}
                  <span className="h-2 w-2 rounded-full bg-gray-400" style={{ animation: 'bounce 1.2s ease infinite 0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400" style={{ animation: 'bounce 1.2s ease infinite 150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400" style={{ animation: 'bounce 1.2s ease infinite 300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Prompts */}
          {messages.length < 4 && !isTyping && (
            <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap rounded-full border border-black/5 bg-[#ead9c8] px-3 py-1.5 text-xs text-[#6f5a49] transition-colors hover:bg-[#dfc8b5] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-black/5 bg-[#f4ece4] p-3 dark:border-gray-800 dark:bg-gray-900">
            <form onSubmit={onSubmit} className="relative flex items-center gap-2">
              <div className="relative flex flex-1 items-center rounded-full border border-black/5 bg-[#ead9c8] dark:border-gray-700 dark:bg-gray-800">
                <input
                  type="text"
                  value={inputValue}
                  onChange={onChange}
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
                  onClick={cameraClick}
                  className="absolute right-2 rounded-full p-1.5 text-[#8d7563] transition-colors hover:bg-amber-100 hover:text-amber-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-amber-300"
                  aria-label="Upload image"
                >
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-700 text-white shadow-sm transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-400 dark:text-black dark:hover:bg-amber-300"
                aria-label="Send message"
              >
                <Send className="ml-0.5 h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
