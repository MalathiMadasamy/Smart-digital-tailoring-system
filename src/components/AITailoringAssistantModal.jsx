import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useCustomer } from '../context/CustomerContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { processAITailoringQuery, detectLanguage } from '../services/aiAssistantService.js';

export function AITailoringAssistantModal({ isOpen, onClose, onOpenHumanChat, onNavigateTab }) {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { orders = [], profile = {}, savedDesigns = [], embroideryWorks = [] } = useCustomer();

  const [minimized, setMinimized] = useState(!isOpen);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [detectedLang, setDetectedLang] = useState('tanglish');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Web Speech API - Speech Recognition (Voice Input 🎙️)
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = detectedLang === 'ta' ? 'ta-IN' : 'en-IN';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      setInputText(transcript);
      if (transcript.trim()) {
        const lang = detectLanguage(transcript);
        setDetectedLang(lang);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Web Speech API - Speech Synthesis (Voiceover 🔊)
  const speakText = (msgId, text) => {
    if (!('speechSynthesis' in window)) {
      alert('Voice synthesis is not supported in your browser.');
      return;
    }

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean markdown border and formatting characters for smooth voice playback
    const cleanText = text
      .replace(/[*#┌└│├─]/g, '')
      .replace(/₹/g, 'Rupees ')
      .replace(/ORD-\d+/gi, (m) => m.split('-').join(' '))
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const lang = detectLanguage(cleanText);

    if (lang === 'ta') {
      utterance.lang = 'ta-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'ta') {
      const taVoice = voices.find(v => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (taVoice) utterance.voice = taVoice;
    } else {
      const enVoice = voices.find(v => v.lang.includes('en-IN') || v.name.toLowerCase().includes('india') || v.lang.includes('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Identify logged in customer details
  const customerData = useMemo(() => {
    return {
      id: user?.id || user?.email || 'cust-01',
      name: user?.name || profile?.name || 'Malathi Lakshmi',
      email: user?.email || 'malathi@gmail.com',
    };
  }, [user, profile]);

  // Identify active order for current customer
  const activeOrder = useMemo(() => {
    if (!orders || orders.length === 0) return null;
    return orders.find((o) => !['Delivered', 'COMPLETED', 'Cancelled'].includes(o.status)) || orders[0];
  }, [orders]);

  // Sync state when modal open prop changes
  useEffect(() => {
    if (isOpen !== undefined) {
      setMinimized(!isOpen);
    }
  }, [isOpen]);

  // Scroll to bottom of chat on new messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  // Initial welcome message with dynamic customer identification summary
  useEffect(() => {
    if (messages.length === 0) {
      const orderId = activeOrder?.id || activeOrder?.orderId || 'ORD-9021';
      const dressType = activeOrder?.dressType || activeOrder?.subcategory || activeOrder?.category || 'Designer Blouse';
      const material = activeOrder?.customerMaterial || activeOrder?.material || 'Customer Own Fabric';
      const tailorName = activeOrder?.tailorName || activeOrder?.assignedTailor || 'Master Rajesh';
      const embroideryType = activeOrder?.embroideryType || activeOrder?.embroidery || 'Aari Work';
      const designerName = activeOrder?.embroideryDesigner || 'Lakshmi Aari Studio';
      const totalAmount = activeOrder?.totalAmount || activeOrder?.price || 3250;
      const paidAmount = activeOrder?.paidAmount || 1500;
      const remainingAmount = activeOrder?.remainingAmount !== undefined ? activeOrder.remainingAmount : (totalAmount - paidAmount);
      const deliveryDate = activeOrder?.deliveryDate || activeOrder?.dueDate || '25 September 2026';

      const welcomeSummary = `Welcome ${customerData.name} 👋\n\nI found your current tailoring order (#${orderId}):\n\n• **Dress**: ${dressType}\n• **Material**: ${material}\n• **Assigned Tailor**: ${tailorName}\n• **Embroidery**: ${embroideryType}\n• **Embroidery Designer**: ${designerName}\n• **Payment**: ₹${paidAmount.toLocaleString()} paid / ₹${remainingAmount.toLocaleString()} remaining\n• **Expected Delivery**: ${deliveryDate}\n\nAsk me anything in **English**, **Tanglish**, or **Tamil (தமிழ்)**!`;

      setMessages([
        {
          id: 'welcome-1',
          sender: 'ai',
          text: welcomeSummary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [customerData, activeOrder, messages.length]);

  // Helper to render bold text and strip raw markdown asterisks **
  const renderFormattedText = (text) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const clean = part.slice(2, -2);
        return <strong key={i} style={{ fontWeight: '800' }}>{clean}</strong>;
      }
      return part;
    });
  };

  // Update detected language live as user types
  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    if (text.trim()) {
      setDetectedLang(detectLanguage(text));
    }
  };

  // Process question submit
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isThinking) return;

    setInputText('');
    const userLang = detectLanguage(query);
    setDetectedLang(userLang);

    // Add user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      // Process question using aiAssistantService
      const res = await processAITailoringQuery({
        question: query,
        role: user?.role || 'customer',
        customerData,
        activeOrder,
        allOrders: orders,
        languageOverride: userLang,
      });

      const aiMsg = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: res.answer,
        intent: res.intent,
        actionButton: res.actionButton,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Automatically speak the response aloud using Web SpeechSynthesis
      if (res && res.answer) {
        setTimeout(() => {
          speakText(aiMsg.id, res.answer);
        }, 200);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Sorry, I had trouble reading your order info right now. Please try again or click Chat with Tailor below.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Quick Action Buttons Handler
  const handleQuickQuestion = (qText) => {
    handleSendMessage(qText);
  };

  // Handle action buttons inside AI responses (e.g. Chat with Tailor, Navigate Tab)
  const handleActionButtonClick = (btn) => {
    if (!btn) return;
    if (btn.action === 'OPEN_TAILOR_CHAT' && onOpenHumanChat) {
      onOpenHumanChat();
      if (onClose) onClose();
      setMinimized(true);
      return;
    }
    if (btn.tab && onNavigateTab) {
      onNavigateTab(btn.tab);
      if (onClose) onClose();
      setMinimized(true);
    }
  };

  if (minimized) {
    return (
      <button
        type="button"
        className="ai-floating-trigger-btn"
        onClick={() => {
          setMinimized(false);
          setTimeout(() => inputRef.current?.focus(), 150);
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #d81b60, #880e4f)',
          color: '#ffffff',
          border: 'none',
          padding: '12px 20px',
          borderRadius: '30px',
          fontSize: '14px',
          fontWeight: '800',
          cursor: 'pointer',
          boxShadow: '0 8px 25px rgba(216, 27, 96, 0.45)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
      >
        <span style={{ fontSize: '18px' }}>✨</span>
        <span>Ask DigiTailor AI</span>
        <span
          style={{
            background: 'rgba(255, 255, 255, 0.25)',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 7px',
            borderRadius: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
          }}
        >
          {detectedLang}
        </span>
      </button>
    );
  }

  return (
    <div
      className="ai-modal-panel-overlay"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: '420px',
        maxWidth: 'calc(100vw - 32px)',
        height: '620px',
        maxHeight: 'calc(100vh - 48px)',
        zIndex: 99999,
        background: isDark ? '#1a121d' : '#ffffff',
        color: isDark ? '#f7f2f6' : '#1e1520',
        borderRadius: '24px',
        border: isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 1. CHAT PANEL HEADER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #880e4f 0%, #ad1457 100%)',
          color: '#ffffff',
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#ffffff',
              color: '#880e4f',
              display: 'grid',
              placeItems: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            ✨
          </div>
          <div>
            <div style={{ fontWeight: '900', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              DigiTailor AI
              <span
                style={{
                  background: 'rgba(255, 255, 255, 0.25)',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                }}
              >
                {detectedLang === 'ta' ? 'தமிழ் (Tamil)' : detectedLang === 'tanglish' ? 'Tanglish' : 'English'}
              </span>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.9 }}>Your Personal Tailoring Assistant</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setMinimized(true)}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="Minimize"
          >
            _
          </button>
          <button
            type="button"
            onClick={() => {
              setMinimized(true);
              if (onClose) onClose();
            }}
            style={{
              border: 'none',
              background: 'rgba(255,255,255,0.2)',
              color: '#fff',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 2. MODE TOGGLE BAR: [Ask AI Assistant] | [Chat with Tailor] */}
      <div
        style={{
          display: 'flex',
          background: isDark ? '#261b29' : '#fce4ec',
          padding: '6px 12px',
          gap: '8px',
          borderBottom: isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0',
        }}
      >
        <button
          type="button"
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '10px',
            border: 'none',
            background: '#880e4f',
            color: '#fff',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'default',
          }}
        >
          ✨ Ask AI Assistant
        </button>
        <button
          type="button"
          onClick={() => {
            if (onOpenHumanChat) onOpenHumanChat();
            setMinimized(true);
          }}
          style={{
            flex: 1,
            padding: '7px 10px',
            borderRadius: '10px',
            border: isDark ? '1px solid #3d2b3c' : '1px solid #ad1457',
            background: 'transparent',
            color: isDark ? '#ffb6c1' : '#ad1457',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          💬 Chat with Tailor
        </button>
      </div>

      {/* 3. CHAT MESSAGES CONTAINER */}
      <div
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div
              style={{
                padding: '12px 14px',
                borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.sender === 'user' ? 'linear-gradient(135deg, #d81b60, #880e4f)' : (isDark ? '#261b29' : '#f8e7eb'),
                color: msg.sender === 'user' ? '#ffffff' : (isDark ? '#f7f2f6' : '#2b1426'),
                fontSize: '13px',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                border: msg.sender === 'user' ? 'none' : (isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0'),
              }}
            >
              {renderFormattedText(msg.text)}

              {/* Read Aloud Voiceover button for AI messages */}
              {msg.sender === 'ai' && (
                <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => speakText(msg.id, msg.text)}
                    style={{
                      background: speakingMsgId === msg.id ? '#ad1457' : (isDark ? '#3d2b3c' : '#ffffff'),
                      color: speakingMsgId === msg.id ? '#ffffff' : (isDark ? '#ffb6c1' : '#ad1457'),
                      border: isDark ? '1px solid #5a3d58' : '1px solid #f8bbd0',
                      borderRadius: '12px',
                      padding: '3px 10px',
                      fontSize: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    }}
                    title="Listen to AI voiceover (Tamil/English)"
                  >
                    {speakingMsgId === msg.id ? '🔊 Speaking...' : '🔊 Read Aloud'}
                  </button>
                </div>
              )}

              {/* Action Button inside AI Response */}
              {msg.actionButton && (
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px dashed rgba(136, 14, 79, 0.2)' }}>
                  <button
                    type="button"
                    onClick={() => handleActionButtonClick(msg.actionButton)}
                    style={{
                      background: '#ad1457',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontWeight: '800',
                      fontSize: '12px',
                      cursor: 'pointer',
                      boxShadow: '0 3px 10px rgba(173, 20, 87, 0.3)',
                    }}
                  >
                    {msg.actionButton.label}
                  </button>
                </div>
              )}
            </div>
            <span style={{ fontSize: '10px', color: isDark ? '#a0909f' : '#888', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isThinking && (
          <div style={{ alignSelf: 'flex-start', background: isDark ? '#261b29' : '#f8e7eb', padding: '10px 14px', borderRadius: '16px', fontSize: '12px', color: '#ad1457', fontWeight: 'bold' }}>
            ✨ AI is reading your live order details...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. SMART QUICK QUESTIONS CHIPS */}
      <div
        style={{
          padding: '8px 12px',
          background: isDark ? '#1e1722' : '#fdf8fc',
          borderTop: isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        <button type="button" onClick={() => handleQuickQuestion('Who am I?')} className="ai-chip-btn">👤 My Details</button>
        <button type="button" onClick={() => handleQuickQuestion('What unstitched fabric details were logged?')} className="ai-chip-btn">🧶 Unstitched Fabric</button>
        <button type="button" onClick={() => handleQuickQuestion('What am I getting stitched?')} className="ai-chip-btn">🧵 My Dress</button>
        <button type="button" onClick={() => handleQuickQuestion('Monthly income evlo?')} className="ai-chip-btn">💰 Monthly Income</button>
        <button type="button" onClick={() => handleQuickQuestion('Evlo order poiruku?')} className="ai-chip-btn">📦 Total Orders</button>
        <button type="button" onClick={() => handleQuickQuestion('Enna type of dresses stitch pannirukaga?')} className="ai-chip-btn">👗 Dress Types</button>
        <button type="button" onClick={() => handleQuickQuestion('Who is stitching my blouse?')} className="ai-chip-btn">✂️ My Tailor</button>
        <button type="button" onClick={() => handleQuickQuestion('What is my payment amount and remaining balance?')} className="ai-chip-btn">💳 Payment</button>
        <button type="button" onClick={() => handleQuickQuestion('When will my dress be ready for delivery?')} className="ai-chip-btn">🚚 Delivery</button>
      </div>

      {/* 5. INPUT FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        style={{
          padding: '12px 14px',
          background: isDark ? '#261b29' : '#ffffff',
          borderTop: isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}
      >
        {/* Microphone Voice Input Button */}
        <button
          type="button"
          onClick={toggleListening}
          style={{
            background: isListening ? '#d32f2f' : (isDark ? '#3d2b3c' : '#f8bbd0'),
            color: isListening ? '#ffffff' : (isDark ? '#ffb6c1' : '#880e4f'),
            border: 'none',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            display: 'grid',
            placeItems: 'center',
            boxShadow: isListening ? '0 0 14px rgba(211, 47, 47, 0.85)' : 'none',
            transition: 'all 0.2s ease',
          }}
          title={isListening ? "Listening... Click to stop" : "Voice input (Speak in Tamil/English)"}
        >
          {isListening ? '🔴' : '🎙️'}
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder={isListening ? "🎙️ Listening to your voice..." : "Ask in English, Tamil, or Tanglish..."}
          value={inputText}
          onChange={handleInputChange}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '20px',
            border: isListening ? '2px solid #d32f2f' : (isDark ? '1px solid #3d2b3c' : '1px solid #f8bbd0'),
            fontSize: '13px',
            background: isDark ? '#1e1722' : '#fcf8fa',
            color: isDark ? '#ffffff' : '#1e1520',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isThinking}
          style={{
            background: 'linear-gradient(135deg, #d81b60, #880e4f)',
            color: '#ffffff',
            border: 'none',
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            display: 'grid',
            placeItems: 'center',
            opacity: !inputText.trim() || isThinking ? 0.6 : 1,
          }}
        >
          ➔
        </button>
      </form>
    </div>
  );
}
