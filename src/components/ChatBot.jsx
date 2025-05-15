import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Zap, Eye } from 'lucide-react';

// Use environment variable for API base URL (for independent backend deployment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const ChatBot = ({ isOpen, onClose }) => {
  // Add responsive styles at component level
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (min-width: 768px) {
        .chatbot-container {
          width: 50vw !important;
          height: 95vh !important;
          max-height: none !important;
        }
      }
      @media (max-width: 767px) {
        .chatbot-container {
          height: 90vh !important;
          max-height: calc(100vh - 40px) !important;
          border-radius: 16px !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm your AI Test Assistant. I'm here to help you create comprehensive tests tailored to your needs. What subject or topic would you like to focus on today?",
      sender: 'bot',
      timestamp: new Date(Date.now()),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', onKeyDown);
      const { overflow } = document.body.style;
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKeyDown);
        document.body.style.overflow = overflow;
      };
    }
  }, [isOpen, onClose]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Always send to backend for intelligent parsing
    try {
      const resp = await fetch(`${API_BASE_URL}/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        const botResponse = {
          id: Date.now() + 1,
          text: err.chatbotReply || `Sorry, I couldn't process your request: ${err.error || resp.statusText}`,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        return;
      }

      const body = await resp.json();

      // Check if this is a conversational response (no test data)
      const questions = body.testData?.questions || body.questions || [];
      const hasValidTest = Array.isArray(questions) && questions.length > 0;

      // If no valid test was generated, just show the chatbot reply
      if (!hasValidTest) {
        const botResponse = {
          id: Date.now() + 1,
          text: body.chatbotReply || "I'm here to help you create tests. Please tell me what subject and how many questions you'd like.",
          sender: 'bot',
          timestamp: new Date(),
          // No test data, so no View Test / Copy buttons
        };
        setMessages(prev => [...prev, botResponse]);
        setIsTyping(false);
        return;
      }

      // Valid test generated - prepare test data
      let testDataFromServer = body.testData;

  // Compose testData object
  const totalCount = questions.length;

      // Normalize questionsByPlan entries
      const normalizePlan = (plan) => {
        if (!plan) return null;
        const count = plan.count || plan.questionCount || plan.question_count || 0;
        return {
          subjectId: plan.subjectId || plan.subject || null,
          topicId: plan.topicId || plan.topic || null,
          count,
          questions: Array.isArray(plan.questions) ? plan.questions : []
        };
      };

      const normalizedQuestionsByPlan = Array.isArray(body.questionsByPlan)
        ? body.questionsByPlan.map(normalizePlan)
        : null;

      const botText = (typeof body.chatbotReply === 'string' && body.chatbotReply.trim())
        ? body.chatbotReply
        : `✅ Test Generated Successfully!\n\n📊 Generated ${totalCount} questions for your test.`;

      const botResponse = {
        id: Date.now() + 1,
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
        hasTestData: true,
        testData: {
          // Use normalized testData from server when available, otherwise synthesize
          ...(testDataFromServer ? testDataFromServer : {
            subjectId: body.subjectId || null,
            questionCount: totalCount,
            questions: questions,
            testPlan: body.testPlan || null,
            questionsByPlan: normalizedQuestionsByPlan || null
          })
        }
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

    } catch (err) {
      console.error('Error:', err);
      const botResponse = {
        id: Date.now() + 1,
        text: `Error generating test: ${err.message || err}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40"
            style={{ 
              position: 'fixed', 
              inset: 0, 
              background: 'rgba(15, 23, 42, 0.4)', 
              backdropFilter: 'blur(8px)',
              zIndex: 9998 
            }}
            onClick={onClose}
          />

          {/* Premium Chatbot Container - Responsive: full width on mobile, 50vw on desktop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300
            }}
            className="chatbot-container"
            style={{ 
              position: 'fixed', 
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '92vw',
              maxWidth: '900px',
              height: '85vh',
              maxHeight: 'calc(100vh - 100px)',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '20px',
              boxShadow: '0 25px 80px -15px rgba(102, 126, 234, 0.6), 0 0 0 1px rgba(255,255,255,0.1)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              padding: '2px'
            }}
          >
            <div style={{ 
              background: '#ffffff', 
              borderRadius: '22px', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
              {/* Premium Header with Gradient - Responsive padding */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: 'clamp(16px, 4vw, 24px) clamp(16px, 4vw, 24px) clamp(14px, 3vw, 20px)',
                borderRadius: '22px 22px 0 0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Animated background pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.1,
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
                  backgroundSize: '50px 50px'
                }}></div>

                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-3">                
                    <div>
                      <h2 style={{ color: 'white', fontSize: 'clamp(16px, 4vw, 18px)', fontWeight: '700', marginBottom: '2px' }}>
                        AI Test Assistant
                      </h2>
                      
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 0.2s'
                    }}
                    aria-label="Close chat"
                  >
                    <X className="w-5 h-5" style={{ color: 'white' }} />
                  </motion.button>
                </div>
              </div>

              {/* Chat Messages Area with Premium Styling - Responsive padding */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                padding: 'clamp(12px, 3vw, 24px)',
                background: 'linear-gradient(to bottom, #fafafa 0%, #ffffff 100%)'
              }}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        flexDirection: message.sender === 'user' ? 'row-reverse' : 'row'
                      }}
                    >
                      {/* Avatar - Responsive size */}
                      <div style={{ flexShrink: 0, width: 'clamp(28px, 6vw, 36px)', height: 'clamp(28px, 6vw, 36px)' }}>
                        {message.sender === 'bot' ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                          }}>
                            <p style={{ fontSize: 'clamp(14px, 3vw, 16px)', margin: 0 }}>🤖</p>
                          </div>
                        ) : (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.3)',
                            fontSize: 'clamp(14px, 3vw, 16px)',
                            fontWeight: '600',
                            color: 'white'
                          }}>
                            👤
                          </div>
                        )}
                      </div>

                      {/* Premium Message Bubble - Responsive */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        maxWidth: 'min(85%, 75%)',
                        alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
                      }}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          style={{
                            borderRadius: message.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            padding: 'clamp(10px, 2.5vw, 14px) clamp(12px, 3vw, 18px)',
                            background: message.sender === 'user' 
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : '#ffffff',
                            color: message.sender === 'user' ? 'white' : '#1e293b',
                            boxShadow: message.sender === 'user'
                              ? '0 4px 16px rgba(102, 126, 234, 0.3)'
                              : '0 2px 12px rgba(0, 0, 0, 0.08)',
                            border: message.sender === 'bot' ? '1px solid #f1f5f9' : 'none',
                            position: 'relative'
                          }}
                        >
                          <p style={{ 
                            fontSize: 'clamp(13px, 3vw, 14px)', 
                            lineHeight: '1.6',
                            margin: 0,
                            fontWeight: message.sender === 'user' ? '500' : '400',
                            wordBreak: 'break-word'
                          }}>
                            {message.text}
                          </p>
                          
                          {/* View Test Button - Responsive */}
                          {message.hasTestData && (
                            <div style={{ display: 'flex', gap: 'clamp(6px, 2vw, 8px)', marginTop: 'clamp(8px, 2vw, 12px)', flexWrap: 'wrap' }}>
                              <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                                onClick={async () => {
                                try {
                                  // Build an ultra-compact payload for large tests
                                  // Strip HTML tags and decode HTML entities
                                  const stripHtml = (html) => {
                                    if (!html) return '';
                                    // Create a temporary element to decode HTML entities
                                    const temp = document.createElement('div');
                                    temp.innerHTML = String(html).replace(/<[^>]*>/g, '');
                                    return (temp.textContent || temp.innerText || '').trim();
                                  };

                                  const td = message.testData || {};
                                  // For shareable link we need to preserve original HTML (images, formatting).
                                  // Store the HTML fields (question, opt1..opt4) so TestView can render them later.
                                  const compact = {
                                    testPlan: td.testPlan || null,
                                    questionCount: td.questionCount || (Array.isArray(td.questions) ? td.questions.length : 0),
                                    createdAt: td.createdAt || Date.now(),
                                    questions: Array.isArray(td.questions) ? td.questions.map(q => ({
                                      _id: q._id || q.id || null,
                                      // Preserve HTML so TestView can render images and formatting
                                      question: q.question || q.questionText || q.question_html || '',
                                      opt1: q.opt1 || q.option1 || '',
                                      opt2: q.opt2 || q.option2 || '',
                                      opt3: q.opt3 || q.option3 || '',
                                      opt4: q.opt4 || q.option4 || '',
                                      ans: q.ans || q.answer || '',
                                      correct: q.correct || ''
                                    })) : []
                                  };

                                  // POST the compact payload to the server which returns a short id
                                  const resp = await fetch(`${API_BASE_URL}/store-test`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify(compact)
                                  });
                                  if (!resp.ok) {
                                    const err = await resp.json().catch(() => ({}));
                                    alert('Unable to create shareable link: ' + (err.error || resp.statusText));
                                    return;
                                  }
                                  const body = await resp.json();
                                  const openUrl = `${window.location.origin}${body.url}`;
                                  window.open(openUrl, '_blank');
                                } catch (err) {
                                  console.error('store-test failed', err);
                                  alert('Unable to create shareable link. Please try again.');
                                }
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'clamp(4px, 2vw, 8px)',
                                padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 16px)',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: 'clamp(12px, 3vw, 13px)',
                                fontWeight: '500',
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              <Eye style={{ width: 'clamp(14px, 3vw, 16px)', height: 'clamp(14px, 3vw, 16px)' }} />
                              View Test
                              </motion.button>

                              {/* Copy button: copies questions+options+answers to clipboard */}
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={async () => {
                                  try {
                                    const qlist = message.testData && Array.isArray(message.testData.questions) ? message.testData.questions : [];
                                    if (!qlist.length) {
                                      alert('No questions available to copy.');
                                      return;
                                    }

                                    // Helper: strip HTML tags and decode entities
                                    function stripHtml(html) {
                                      if (!html) return '';
                                      const temp = document.createElement('div');
                                      temp.innerHTML = String(html);
                                      return (temp.textContent || temp.innerText || '').trim();
                                    }

                                    // Build rich HTML payload preserving original HTML (so images & formatting remain)
                                    let htmlParts = ['<div style="font-family: system-ui, -apple-system, sans-serif; color: #111827;">'];
                                    qlist.forEach((q, idx) => {
                                      const qhtml = q.question || q.questionText || q.question_html || '';
                                      htmlParts.push('<div style="margin-bottom:14px;">');
                                      htmlParts.push(`<div style="margin-bottom:6px;">[Q] ${qhtml}</div>`);
                                      const opts = ['opt1','opt2','opt3','opt4'].map(k => q[k]).filter(Boolean);
                                      if (opts.length) {
                                        opts.forEach((o, oi) => {
                                          const letter = ['a','b','c','d'][oi] || String.fromCharCode(97 + oi);
                                          htmlParts.push(`<div style="margin-bottom:2px;">(${letter}) ${o}</div>`);
                                        });
                                      }
                                      if (q.ans) {
                                        const ansLetter = String(q.ans).toLowerCase().trim();
                                        htmlParts.push(`<div style="margin-top:6px;">correct: (${ansLetter})</div>`);
                                      }
                                      htmlParts.push('</div>');
                                    });
                                    htmlParts.push('</div>');
                                    let finalHtml = htmlParts.join('');

                                    // Helper: embed external images as data URLs so pasting into Docs/Word retains images
                                    async function embedImagesInHtml(html) {
                                      try {
                                        const parser = new DOMParser();
                                        const doc = parser.parseFromString(html, 'text/html');
                                        const imgs = Array.from(doc.images || []);
                                        for (const img of imgs) {
                                          const src = img.getAttribute('src');
                                          if (!src || src.startsWith('data:')) continue;
                                          try {
                                            const resp = await fetch(src);
                                            if (!resp.ok) continue;
                                            const blob = await resp.blob();
                                            // convert blob -> dataURL
                                            const dataUrl = await new Promise((res, rej) => {
                                              const reader = new FileReader();
                                              reader.onload = () => res(reader.result);
                                              reader.onerror = rej;
                                              reader.readAsDataURL(blob);
                                            });
                                            img.setAttribute('src', dataUrl);
                                          } catch (imgErr) {
                                            // ignore image embed failures but continue
                                            console.warn('image embed failed for', src, imgErr);
                                          }
                                        }
                                        return doc.body.innerHTML;
                                      } catch (e) {
                                        return html;
                                      }
                                    }

                                    finalHtml = await embedImagesInHtml(finalHtml);

                                    // Plain-text fallback
                                    const tmp = document.createElement('div');
                                    tmp.innerHTML = finalHtml;
                                    const plainText = (tmp.textContent || tmp.innerText || '').trim();

                                    // Try modern clipboard API with HTML support
                                    if (navigator.clipboard && navigator.clipboard.write) {
                                      try {
                                        const blobHtml = new Blob([finalHtml], { type: 'text/html' });
                                        const blobText = new Blob([plainText], { type: 'text/plain' });
                                        const clipboardItem = new window.ClipboardItem({
                                          'text/html': blobHtml,
                                          'text/plain': blobText
                                        });
                                        await navigator.clipboard.write([clipboardItem]);
                                        alert('Questions (with formatting) copied to clipboard — paste into Google Docs or Word.');
                                        return;
                                      } catch (apiErr) {
                                        console.warn('clipboard.write with HTML failed, falling back', apiErr);
                                        // continue to fallback below
                                      }
                                    }

                                    // Fallback: use execCommand on a hidden element (copies rich HTML in many browsers)
                                    try {
                                      const container = document.createElement('div');
                                      container.style.position = 'fixed';
                                      container.style.left = '-9999px';
                                      container.style.opacity = '0';
                                      container.innerHTML = finalHtml;
                                      document.body.appendChild(container);
                                      const range = document.createRange();
                                      range.selectNodeContents(container);
                                      const sel = window.getSelection();
                                      sel.removeAllRanges();
                                      sel.addRange(range);
                                      document.execCommand('copy');
                                      sel.removeAllRanges();
                                      document.body.removeChild(container);
                                      alert('Questions copied to clipboard (rich HTML).');
                                      return;
                                    } catch (execErr) {
                                      console.warn('execCommand copy fallback failed', execErr);
                                    }

                                    // Last resort: plain text copy
                                    try {
                                      if (navigator.clipboard && navigator.clipboard.writeText) {
                                        await navigator.clipboard.writeText(plainText);
                                      } else {
                                        const ta = document.createElement('textarea');
                                        ta.value = plainText;
                                        document.body.appendChild(ta);
                                        ta.select();
                                        document.execCommand('copy');
                                        document.body.removeChild(ta);
                                      }
                                      alert('Questions copied as plain text to clipboard.');
                                    } catch (finalErr) {
                                      console.error('final copy attempt failed', finalErr);
                                      alert('Unable to copy to clipboard. Your browser may block clipboard access.');
                                    }
                                  } catch (err) {
                                    console.error('copy failed', err);
                                    alert('Unable to copy to clipboard');
                                  }
                                }}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 'clamp(4px, 2vw, 8px)',
                                  padding: 'clamp(6px, 2vw, 8px) clamp(10px, 3vw, 12px)',
                                  background: '#ffffff',
                                  color: '#1e293b',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '12px',
                                  fontSize: 'clamp(12px, 3vw, 13px)',
                                  fontWeight: '500',
                                  cursor: 'pointer',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                Copy
                              </motion.button>
                            </div>
                          )}
                        </motion.div>
                        
                        <p style={{ 
                          fontSize: '11px', 
                          color: '#94a3b8',
                          marginTop: '6px',
                          paddingLeft: message.sender === 'user' ? '0' : '8px',
                          paddingRight: message.sender === 'user' ? '8px' : '0',
                          fontWeight: '500'
                        }}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {/* Premium Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{ display: 'flex', gap: '12px' }}
                    >
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                      }}>
                        <p>🤖</p>
                      </div>
                      
                      <div style={{
                        background: 'white',
                        borderRadius: '20px 20px 20px 4px',
                        padding: '16px 20px',
                        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
                        border: '1px solid #f1f5f9'
                      }}>
                        <div className="flex gap-1.5">
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea' }}
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#764ba2' }}
                          />
                          <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                            style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea' }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Premium Input Area - Responsive padding */}
              <div style={{
                padding: 'clamp(14px, 3vw, 20px) clamp(16px, 4vw, 24px)',
                background: 'linear-gradient(to top, #fafafa 0%, #ffffff 100%)',
                borderTop: '1px solid #f1f5f9'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'white',
                  borderRadius: '16px',
                  padding: '6px',
                  boxShadow: '0 2px 16px rgba(0, 0, 0, 0.06)',
                  border: '1.5px solid #e2e8f0'
                }}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    style={{
                      flex: 1,
                      padding: 'clamp(10px, 2.5vw, 12px) clamp(12px, 3vw, 16px)',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      fontSize: 'clamp(13px, 3vw, 14px)',
                      color: '#1e293b',
                      fontWeight: '400'
                    }}
                  />
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                    style={{
                      width: 'clamp(40px, 9vw, 44px)',
                      height: 'clamp(40px, 9vw, 44px)',
                      borderRadius: 'clamp(10px, 2.5vw, 12px)',
                      background: inputValue.trim() 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: 'none',
                      cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: inputValue.trim() ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                      transition: 'all 0.2s'
                    }}
                    aria-label="Send message"
                  >
                    <Send 
                      style={{ 
                        color: inputValue.trim() ? 'white' : '#94a3b8',
                        width: 'clamp(18px, 4vw, 20px)',
                        height: 'clamp(18px, 4vw, 20px)'
                      }} 
                    />
                  </motion.button>
                </div>

                {/* Premium Footer Tag */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginTop: '12px'
                  }}
                >
                  
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChatBot;