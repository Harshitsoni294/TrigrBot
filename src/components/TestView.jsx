import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Use environment variable for API base URL (for independent backend deployment)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

const TestView = () => {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  import { useState, useEffect } from 'react';
  import { motion } from 'framer-motion';

  // Use environment variable for API base URL (for independent backend deployment)
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

  const TestView = () => {
    const [testData, setTestData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const dataParam = urlParams.get('data');
      const idParam = urlParams.get('id');

      async function fetchById(id) {
        try {
          import React, { useState, useEffect } from 'react';
          import { motion } from 'framer-motion';
          import { CheckCircle } from 'lucide-react';

          // Use environment variable for API base URL (for independent backend deployment)
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

          // Helper: pick first non-empty HTML-like field from question object
          function pickQuestionHtml(question) {
            if (!question || typeof question !== 'object') return '';
            const candidates = ['question', 'q', 'question_text', 'body', 'solutions', 'description', 'content', 'text'];
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

            if (testData && (testData.__parseError || testData.__noData)) {
              return (
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
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
              <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <style>{`
                  .test-content img { max-width: 100%; height: auto !important; display: block; margin: 8px 0; border-radius: 4px; }
                  .test-content p { margin: 0; line-height: 1.5; }
                  .test-content span { display: inline; }
                `}</style>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', padding: '32px', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)' }}>
                  <div style={{ textAlign: 'center', marginBottom: '32px', borderBottom: '2px solid #e2e8f0', paddingBottom: '20px' }}>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>{(testData.subject && testData.subject) || testData.subjectId || 'Test'} Test Questions</h1>
                    <p style={{ color: '#64748b', fontSize: '16px' }}>{testData.questions.length} questions with answers</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {testData.questions.map((question, index) => {
                      const html = pickQuestionHtml(question);

                      return (
                        <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.04 }} style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <div style={{ position: 'relative' }}>
                            <div className="test-content" style={{ fontSize: '18px', fontWeight: '600', color: '#334155', marginBottom: '8px', lineHeight: '1.5' }}>
                              <span style={{ marginRight: 8 }}>{index + 1}.</span>
                              {html ? (<span dangerouslySetInnerHTML={{ __html: html }} />) : null}
                            </div>

                            <div style={{ textAlign: 'right', fontSize: '12px', color: '#475569', fontFamily: 'monospace', marginBottom: '12px', wordBreak: 'break-all' }} title={question._id || ''}>{question._id || ''}</div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {['A', 'B', 'C', 'D'].map((letter, optIndex) => {
                              const optionKey = `opt${optIndex + 1}`;
                              const optionVal = question[optionKey];
                              const optionHtml = optionVal !== undefined && optionVal !== null ? String(optionVal).trim() : '';
                              const isCorrect = question.ans && String(question.ans).toLowerCase() === letter.toLowerCase();

                              return (
                                <div key={letter} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: isCorrect ? '#dcfce7' : 'white', border: isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}>
                                  <span style={{ fontWeight: '600', marginRight: '8px', color: isCorrect ? '#15803d' : '#64748b' }}>{letter}.</span>
                                  {optionHtml ? (<span className="test-content" style={{ color: isCorrect ? '#15803d' : '#334155', flex: 1 }} dangerouslySetInnerHTML={{ __html: optionHtml }} />) : (<span style={{ color: isCorrect ? '#15803d' : '#334155', flex: 1 }} />)}
                                  {isCorrect && (<span style={{ marginLeft: 'auto', color: '#15803d', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>✓ Correct Answer</span>)}
                                </div>
                              );
                            })}
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
      <style>{`
        .test-content img {
          max-width: 100%;
          height: auto !important;
          display: block;
          margin: 8px 0;
          border-radius: 4px;
        }
        .test-content p {
          margin: 0;
          line-height: 1.5;
        }
        .test-content p img {
          display: block;
          margin: 8px 0;
        }
      `}</style>
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
          {testData.questions.map((question, index) => {
            if (index === 0) {
              console.log('First question structure:', question);
            }

            // Derive HTML content to render for this question (handle image-only entries)
            let htmlContent = '';
            const tryString = (v) => (typeof v === 'string' && v.trim() !== '') ? v : null;
            if (tryString(question && question.question)) {
              htmlContent = question.question;
            } else if (question && question.raw) {
              const raw = question.raw;
              const fallbackKeys = ['question','q','question_text','body','desc','description','content','text','solutions','solution'];
              for (const k of fallbackKeys) {
                const val = tryString(raw[k]);
                if (val) { htmlContent = val; break; }
              }
            }

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: '#334155', marginBottom: '8px', lineHeight: 1.5 }}>
                    <span style={{ marginRight: 8, fontWeight: 700 }}>{index + 1}.</span>
                    {htmlContent ? (
                      <div style={{ display: 'inline-block' }} className="test-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    ) : null}
                  </div>

                  <div style={{ textAlign: 'right', fontSize: 12, color: '#475569', fontFamily: 'monospace', marginBottom: 12, wordBreak: 'break-all' }} title={question._id || ''}>
                    {question._id || ''}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {['A','B','C','D'].map((letter, optIndex) => {
                    const optionKey = `opt${optIndex+1}`;
                    const optionText = question[optionKey];
                    const isCorrect = question.ans && String(question.ans).toLowerCase() === letter.toLowerCase();

                    return (
                      <div key={letter} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', background: isCorrect ? '#dcfce7' : 'white', border: isCorrect ? '2px solid #22c55e' : '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}>
                        <div style={{ fontWeight: 600, marginRight: 8, color: isCorrect ? '#15803d' : '#64748b' }}>{letter}.</div>
                        {optionText ? (
                          <div className="test-content" style={{ color: isCorrect ? '#15803d' : '#334155', flex: 1 }} dangerouslySetInnerHTML={{ __html: optionText }} />
                        ) : (
                          <div style={{ color: isCorrect ? '#15803d' : '#334155', flex: 1 }}> </div>
                        )}
                        {isCorrect && (
                          <div style={{ marginLeft: 'auto', color: '#15803d', fontSize: 12, fontWeight: 600 }}>✓ Correct Answer</div>
                        )}
                      </div>
                    );
                  })}
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