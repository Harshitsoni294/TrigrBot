import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import ChatBot from './components/ChatBot';
import TestView from './components/TestView';
import './App.css';

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Check if we're on the test view page
    const urlParams = new URLSearchParams(window.location.search);
    // Support both the legacy `data` param and the new short-id `id` param
    if (urlParams.get('view') === 'test' && (urlParams.has('data') || urlParams.has('id'))) {
      setCurrentView('test');
    }
  }, []);

  const handleOpenChat = () => {
    setIsChatOpen(true);
  };

  const handleCloseChat = () => {
    setIsChatOpen(false);
  };

  // If we're viewing a test, show only the test view
  if (currentView === 'test') {
    return <TestView />;
  }

  return (
    <div className="relative">
      <LandingPage onOpenChat={handleOpenChat} />
      <ChatBot isOpen={isChatOpen} onClose={handleCloseChat} />
      {!isChatOpen && (
        <button
          type="button"
          onClick={handleOpenChat}
          aria-label="Open AI Test Assistant"
          className="fixed bottom-6 right-6 z-[10000] h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-[0_12px_32px_rgba(59,130,246,0.45)] transition-all grid place-items-center focus:outline-none focus:ring-4 focus:ring-blue-300/60"
          style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h8M8 14h5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default App;
