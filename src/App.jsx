import { useState, useEffect } from 'react';
import ChatBot from './components/ChatBot';
import TestView from './components/TestView';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    // Check if we're on the test view page
    const urlParams = new URLSearchParams(window.location.search);
    // Support both the legacy `data` param and the new short-id `id` param
    if (urlParams.get('view') === 'test' && (urlParams.has('data') || urlParams.has('id'))) {
      setCurrentView('test');
    }
  }, []);

  // If we're viewing a test, show only the test view
  if (currentView === 'test') {
    return <TestView />;
  }

  // Show ChatBot as the main landing page
  return <ChatBot />;
}

export default App;
