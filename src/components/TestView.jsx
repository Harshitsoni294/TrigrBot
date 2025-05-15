import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Use environment variable for API base URL (for independent backend deployment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Helper: pick first non-empty HTML-like field from question object
function pickQuestionHtml(question) {
  if (!question || typeof question !== 'object') return '';
  const candidates = [
    'question',
    'q',
    'question_text',
    'body',
    'solutions',
    'description',
    'content',
    'text'
  ];
  for (const key of candidates) {
    const val = question[key];
    if (val !== undefined && val !== null) {
      const str = String(val).trim();
      if (str !== '') return str;
    }
  }
  return '';
}

const TestView = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    // Apply fixed background to document body so the gradient stays stationary
    const prevBodyBackground = document.body.style.background || '';
    const prevBodyBackgroundAttachment = document.body.style.backgroundAttachment || '';
    const prevBodyMargin = document.body.style.margin || '';
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.margin = '0';
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');
    const idParam = urlParams.get('id');

    async function fetchById(id) {
      try {
        setLoading(true);
        const resp = await fetch(`${API_BASE_URL}/fetch-test?id=${encodeURIComponent(id)}`);
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          setFetchError(err.error || resp.statusText || 'Failed to fetch test');
          setTestData({ __noData: true });
          setLoading(false);
          return;
        }
        const body = await resp.json();
        setTestData(body.data);
        setLoading(false);
      } catch (err) {
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
        let parsed = null;
        try {
          parsed = JSON.parse(dataParam);
        } catch (err1) {
          try {
            parsed = JSON.parse(decodeURIComponent(dataParam));
          } catch (err2) {
            setTestData({ __parseError: true, raw: dataParam });
            setLoading(false);
            return;
          }
        }
        setTestData(parsed);
        setLoading(false);
        return;
      }

      setTestData({ __noData: true });
      setLoading(false);
    })();

    return () => {
      // restore body styles
      document.body.style.background = prevBodyBackground;
      document.body.style.backgroundAttachment = prevBodyBackgroundAttachment;
      document.body.style.margin = prevBodyMargin;
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
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

  if (testData && (testData.__parseError || testData.__noData)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
        <div style={{ maxWidth: 760, padding: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>Unable to load test data</h2>
          <p style={{ color: '#e2e8f0' }}>The test data provided in the URL could not be parsed or no id was provided.</p>
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

  if (!testData || !testData.questions || !Array.isArray(testData.questions) || testData.questions.length === 0) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
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
    // Background fills viewport (stationary); the white card is a normal block so the whole page scrolls
    <div style={{
      minHeight: '100vh',
      padding: '40px 20px',
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      backgroundAttachment: 'fixed',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <style>{`
        .test-content img { max-width: 100%; height: auto !important; display: block; margin: 8px 0; border-radius: 4px; }
        .test-content p { margin: 0; line-height: 1.5; }
        .test-content span { display: inline; }

        .tv-card { max-width: 900px; margin: 24px auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
      `}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="tv-card">
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
        Test Questions
          </h1>
          <p style={{ color: '#64748b', fontSize: '16px' }}>
            {testData.questions.length} questions with answers
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {testData.questions.map((question, index) => {
            // Use dangerous HTML for both text and image questions
            const html = pickQuestionHtml(question);

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div className="test-content" style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '8px', lineHeight: '1.5' }}>
                    <span style={{ marginRight: 8 }}>{index + 1}.</span>
                    {/* Always use dangerouslySetInnerHTML so images in question render */}
                    {html ? (<span dangerouslySetInnerHTML={{ __html: html }} />) : null}
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569', fontFamily: 'monospace', marginBottom: '12px', wordBreak: 'break-all' }} title={question._id || ''}>
                    {question._id || ''}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {
                    (() => {
                      const optionKeys = ['opt1', 'opt2', 'opt3', 'opt4'];
                      const letters = ['A', 'B', 'C', 'D'];
                      const options = optionKeys.map((k, i) => ({ key: k, letter: letters[i], raw: question[k] })).filter(o => o.raw !== undefined && o.raw !== null && String(o.raw).trim() !== '');

                      if (options.length === 0) return null;

                      return options.map(opt => {
                        const html = String(opt.raw).trim();
                        const isCorrect = question.ans && String(question.ans).toLowerCase() === opt.letter.toLowerCase();
                        return (
                          <div key={opt.key} style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            background: isCorrect ? '#dcfce7' : 'white',
                            border: isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0',
                            borderRadius: '8px',
                            fontSize: '14px'
                          }}>
                            <span style={{ fontWeight: '600', marginRight: '8px', color: isCorrect ? '#15803d' : '#64748b' }}>{opt.letter}.</span>
                            <span className="test-content" style={{ color: isCorrect ? '#15803d' : '#334155', flex: 1 }} dangerouslySetInnerHTML={{ __html: html }} />
                            {isCorrect && (
                              <span style={{ marginLeft: 'auto', color: '#15803d', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                                ✓ Correct Answer
                              </span>
                            )}
                          </div>
                        );
                      });
                    })()
                  }
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default TestView;
