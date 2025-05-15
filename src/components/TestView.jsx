import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// Use environment-aware API URL
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:4000';

const TestView = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [renderError, setRenderError] = useState(null);

  useEffect(() => {
    // Get test data from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    const idParam = urlParams.get('id');

    console.log('TestView loading with params:', { dataParam, idParam });

    async function fetchById(id) {
      try {
        setLoading(true);
        console.log('Fetching test data for id:', id);
        const resp = await fetch(`${API_BASE_URL}/fetch-test?id=${encodeURIComponent(id)}`);
        console.log('Fetch response status:', resp.status);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          console.error('Fetch failed:', err);
          setFetchError(err.error || resp.statusText || 'Failed to fetch test');
          setTestData({ __noData: true });
          setLoading(false);
          return;
        }
        const body = await resp.json();
        console.log('Fetched data:', body);
        // body: { data: <payload> }
        setTestData(body.data);
        setLoading(false);
      } catch (err) {
        console.error('fetch-test failed', err);
        setFetchError(err && err.message ? err.message : String(err));
        setTestData({ __noData: true });
        setLoading(false);
      }
    }

    (async () => {
      if (idParam) {
        await fetchById(idParam);
        return;
      }

      if (dataParam) {
        // Try parsing a few ways: direct JSON.parse, then decodeURIComponent(JSON)
        let parsed = null;
        try {
          parsed = JSON.parse(dataParam);
        } catch (err1) {
          try {
            parsed = JSON.parse(decodeURIComponent(dataParam));
          } catch (err2) {
            console.error('Error parsing test data (tried raw and decodeURIComponent):', err1, err2);
            // Keep testData null so the UI can show a helpful message instead of redirecting silently
            setTestData({ __parseError: true, raw: dataParam });
            setLoading(false);
            return;
          }
        }

        setTestData(parsed);
        setLoading(false);
        return;
      }

      // No data - set a parseError so UI can show a friendly message
      setTestData({ __noData: true });
      setLoading(false);
    })();
  }, []);



  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>Loading Test...</h1>
          <p>Please wait while we load your test data.</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ maxWidth: 760, padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Unable to fetch test data</h2>
          <p style={{ color: '#e2e8f0' }}>{fetchError}</p>
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: 'white', background: '#667eea', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>Return home</a>
          </div>
        </div>
      </div>
    );
  }

  // Handle parsing errors with helpful UI
  if (testData && (testData.__parseError || testData.__noData)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ maxWidth: 760, padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Unable to load test data</h2>
          <p style={{ color: '#e2e8f0' }}>The test data provided in the URL could not be parsed. This can happen if the data was truncated or double-encoded.</p>
          {testData.__parseError && (
            <details style={{ color: '#cbd5e1', marginTop: 12 }}>
              <summary>Show raw data</summary>
              <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' }}>{testData.raw}</pre>
            </details>
          )}
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: 'white', background: '#667eea', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>Return home</a>
          </div>
        </div>
      </div>
    );
  }

  // Check if questions array exists and has items
  if (!testData || !testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ maxWidth: 760, padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12, textAlign: 'center' }}>
          <h2 style={{ marginTop: 0 }}>No Questions Found</h2>
          <p style={{ color: '#e2e8f0' }}>The test data does not contain any questions.</p>
          <div style={{ marginTop: 16 }}>
            <a href="/" style={{ color: 'white', background: '#667eea', padding: '8px 12px', borderRadius: 8, textDecoration: 'none' }}>Return home</a>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '20px'
        }}>
            <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1e293b',
            marginBottom: '8px'
          }}>
            {(testData.subject && testData.subject) || testData.subjectId || 'Test'} Test Questions
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            {testData.questions.length} questions with answers
          </p>
        </div>

        {/* Questions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {testData.questions.map((question, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: '#f8fafc',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div style={{ position: 'relative' }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#334155',
                  marginBottom: '8px',
                  lineHeight: '1.5'
                }}>
                  <span>{index + 1}. </span>
                  <span>{question.question || 'Question text missing'}</span>
                </h3>

                {/* Full question ID shown below the question, right-aligned and wrapping so it's always visible */}
                <div style={{
                  textAlign: 'right',
                  fontSize: '12px',
                  color: '#475569',
                  fontFamily: 'monospace',
                  marginBottom: '12px',
                  wordBreak: 'break-all'
                }} title={question._id || ''}>
                  {question._id || ''}
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                  const optionKey = `opt${optIndex + 1}`; // opt1, opt2, opt3, opt4
                  const isCorrect = question.ans && question.ans.toLowerCase() === letter.toLowerCase();
                  const optionText = question[optionKey];
                  
                  return (
                    <div
                      key={letter}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '12px 16px',
                        background: isCorrect ? '#dcfce7' : 'white',
                        border: isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px'
                      }}
                    >
                      <span style={{
                        fontWeight: '600',
                        marginRight: '8px',
                        color: isCorrect ? '#15803d' : '#64748b'
                      }}>
                        {letter}.
                      </span>
                      <span 
                        style={{
                          color: isCorrect ? '#15803d' : '#334155'
                        }}
                      >
                        {optionText}
                      </span>
                      {isCorrect && (
                        <span style={{
                          marginLeft: 'auto',
                          color: '#15803d',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          ✓ Correct Answer
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TestView;