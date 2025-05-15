const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

let GoogleGenerativeAI;
try {
  const { GoogleGenerativeAI: GoogleAI } = require('@google/generative-ai');
  GoogleGenerativeAI = GoogleAI;
} catch (e) {
  GoogleGenerativeAI = null;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const testStorage = new Map(); 
const TEST_TTL_MS = 1000 * 60 * 60; 
const TEST_STORE_FILE = path.resolve(__dirname, '.test_store.json');

function saveTestStorageToDisk() {
  try {
    const obj = {};
    for (const [k, v] of testStorage.entries()) {
      try {
        obj[k] = { data: v.data, createdAt: v.createdAt };
      } catch (e) {}
    }
    require('fs').writeFileSync(TEST_STORE_FILE, JSON.stringify(obj));
  } catch (e) {
    console.warn('Failed to save test storage to disk', e && e.message ? e.message : e);
  }
}

function loadTestStorageFromDisk() {
  try {
    const fs = require('fs');
    if (!fs.existsSync(TEST_STORE_FILE)) return;
    const raw = fs.readFileSync(TEST_STORE_FILE, 'utf8');
    if (!raw) return;
    const obj = JSON.parse(raw);
    const now = Date.now();
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (v && v.createdAt && (now - v.createdAt) <= TEST_TTL_MS) {
        testStorage.set(k, { data: v.data, createdAt: v.createdAt });
      }
    }
  } catch (e) {
    console.warn('Failed to load test storage from disk', e && e.message ? e.message : e);
  }
}

function makeShortId(len = 8) {
  const crypto = require('crypto');
  return crypto.randomBytes(Math.ceil(len * 0.75)).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, len);
}


setInterval(() => {
  const now = Date.now();
  for (const [k, v] of testStorage.entries()) {
    if (now - v.createdAt > TEST_TTL_MS) testStorage.delete(k);
  }
  
  saveTestStorageToDisk();
}, 1000 * 60 * 5);


loadTestStorageFromDisk();

app.post('/store-test', (req, res) => {
  try {
    const payload = req.body;
    if (!payload) return res.status(400).json({ error: 'Missing JSON body' });
    const id = makeShortId(10);
    testStorage.set(id, { data: payload, createdAt: Date.now() });
  try { saveTestStorageToDisk(); } catch (e) {  }

    console.log(`[store-test] Created test with id: ${id}, URL: /?view=test&id=${id}`);
    console.log(`[store-test] Payload has ${payload.questions ? payload.questions.length : 0} questions`);
    return res.json({ id, url: `/?view=test&id=${id}` });
  } catch (err) {
    console.error('store-test error', err);
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});


app.get('/fetch-test', (req, res) => {
  try {
    const id = req.query.id;
    if (!id) return res.status(400).json({ error: 'id query param required' });
    const rec = testStorage.get(id);
    if (!rec) {
      console.log(`[fetch-test] ID not found: ${id}. Available IDs: ${Array.from(testStorage.keys()).join(', ')}`);
      return res.status(404).json({ error: 'not found or expired' });
    }
    console.log(`[fetch-test] Found test with id: ${id}, has ${rec.data && rec.data.questions ? rec.data.questions.length : 0} questions`);
    return res.json({ data: rec.data });
  } catch (err) {
    console.error('fetch-test error', err);
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI missing in .env');
}

async function connectDb() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
}

const fs = require('fs');

async function buildAvailableContent() {
  // Ensure DB connected
  await connectDb();
  const db = mongoose.connection.db;
  let subjects = [];
  let topics = [];
  try {
    subjects = await db.collection('subjects').find().toArray();
  } catch (e) {
    console.warn('Could not read subjects from DB', e && e.message ? e.message : e);
  }
  try {
    topics = await db.collection('topics').find().toArray();
  } catch (e) {
    console.warn('Could not read topics from DB', e && e.message ? e.message : e);
  }

  const localSubjectsPath = path.resolve(__dirname, 'onlinetestpanel.subjects.json');
  const localTopicsPath = path.resolve(__dirname, 'onlinetestpanel.topics.json');
  let fileSubjects = [];
  let fileTopics = [];
  try {
    if (fs.existsSync(localSubjectsPath)) {
      const raw = fs.readFileSync(localSubjectsPath, 'utf8');
      fileSubjects = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read local subjects file:', e && e.message ? e.message : e);
  }
  try {
    if (fs.existsSync(localTopicsPath)) {
      const raw = fs.readFileSync(localTopicsPath, 'utf8');
      fileTopics = JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to read local topics file:', e && e.message ? e.message : e);
  }

  function normSubject(s) {
    let id = s._id && s._id.$oid ? s._id.$oid : s._id;
    if (id && id.toString) id = id.toString();
    const name = s.title || s.name || s.label || s.subjectName || s.subject || '(no-name)';
    return { id, name, raw: s };
  }

  function normTopic(t) {
    let id = t._id && t._id.$oid ? t._id.$oid : t._id;
    if (id && id.toString) id = id.toString();
    let subject_id = t.subject_id && t.subject_id.$oid ? t.subject_id.$oid : t.subject_id;
    if (subject_id && subject_id.toString) subject_id = subject_id.toString();
    const name = t.topic || t.title || t.name || '(no-name)';
    return { id, subject_id, name, raw: t };
  }

  const combinedSubjectsMap = new Map();
  subjects.forEach(s => {
    const sid = s._id && s._id.toString ? s._id.toString() : s._id;
    combinedSubjectsMap.set(sid, { id: sid, name: s.title || s.name || '(no-name)', raw: s });
  });
  fileSubjects.forEach(s => {
    const n = normSubject(s);
    if (n.id) combinedSubjectsMap.set(n.id, { id: n.id, name: n.name, raw: s });
  });

  const combinedTopics = [];
  topics.forEach(t => {
    const tid = t._id && t._id.toString ? t._id.toString() : t._id;
    let subject_id = t.subject_id && t.subject_id.toString ? t.subject_id.toString() : t.subject_id;
    combinedTopics.push({ id: tid, subject_id, name: t.topic || t.title || t.name || '(no-name)', raw: t });
  });
  fileTopics.forEach(t => {
    const n = normTopic(t);
    combinedTopics.push({ id: n.id, subject_id: n.subject_id, name: n.name, raw: t });
  });

  const topicsBySubject = new Map();
  combinedTopics.forEach(t => {
    if (!t.subject_id) return;
    if (!topicsBySubject.has(t.subject_id)) topicsBySubject.set(t.subject_id, []);
    const arr = topicsBySubject.get(t.subject_id);
    if (!arr.find(x => x.id === t.id)) arr.push({ id: t.id, name: t.name });
  });

  const minimalSubjects = [];
  for (const [sid, s] of combinedSubjectsMap.entries()) {
    const tlist = topicsBySubject.get(sid) || [];
    minimalSubjects.push({ id: sid, name: s.name, topics: tlist });
  }

  return { subjects: minimalSubjects };
}
async function loadSubjects() {
  await connectDb();
  const db = mongoose.connection.db;
  const subjects = await db.collection('subjects').find().toArray();
  return subjects;
}

async function fetchQuestions(subjectId, n) {
  await connectDb();
  const db = mongoose.connection.db;
  const collection = db.collection('questions');

  let querySubjectId = subjectId;
  if (mongoose.Types.ObjectId.isValid(subjectId)) {
    querySubjectId = new mongoose.Types.ObjectId(subjectId);
  }

  const query = { subject: querySubjectId };

  
  const total = await collection.countDocuments(query);
  if (!total) return [];
  const sampleSize = Math.min(n, total);
  const docs = await collection.aggregate([
    { $match: query },
    { $sample: { size: sampleSize } }
  ]).toArray();
  return docs;
}

async function fetchQuestionsByPlan(subjectId, n, topicId = null) {
  await connectDb();
  const db = mongoose.connection.db;
  const collection = db.collection('questions');

  let querySubjectId = subjectId;
  if (mongoose.Types.ObjectId.isValid(subjectId)) querySubjectId = new mongoose.Types.ObjectId(subjectId);

  const baseQuery = { subject: querySubjectId };

  let finalQuery = baseQuery;
  if (topicId !== null && typeof topicId !== 'undefined') {
    if (topicId !== null) {
      let tId = topicId;
      if (mongoose.Types.ObjectId.isValid(topicId)) tId = new mongoose.Types.ObjectId(topicId);
      finalQuery = {
        $and: [
          baseQuery,
          { $or: [ { topic: tId }, { topic_id: tId }, { topics: tId }, { topic: topicId }, { topic_id: topicId }, { topics: topicId } ] }
        ]
      };
    }
  }

  const total = await collection.countDocuments(finalQuery);
  if (!total) return [];
  const sampleSize = Math.min(n, total);
  const docs = await collection.aggregate([
    { $match: finalQuery },
    { $sample: { size: sampleSize } }
  ]).toArray();
  return docs;
}


app.post('/generate-test', async (req, res) => {
  const { message } = req.body || {};
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message required (string)' });
  }

  try {
    const availableContent = await buildAvailableContent();

  let parserText = null;
  let parsedPlan = null;
  let usedParser = null;

    if (process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `You are an advanced Test Request Parsing AI. You will be given two inputs:
1) USER_MESSAGE
2) AVAILABLE_CONTENT (subjects with id,name and topics with id,name only).

Your job: RETURN ONLY A SINGLE JSON OBJECT (no surrounding text) that contains two keys: testPlan (array) and chatbotReply (string).

CRITICAL RULES - YOU MUST NEVER FAIL:
1) ALWAYS return a valid testPlan, even if the user's request is vague or doesn't specify subjects
2) If user says "any subjects" or doesn't specify subjects, YOU MUST choose appropriate subjects from AVAILABLE_CONTENT yourself
3) NEVER leave subjectId or subjectName empty/null/blank - always fill them with valid values from AVAILABLE_CONTENT
4) Map user mentions to subjects/topics from AVAILABLE_CONTENT (match by name, case-insensitive)
5) Use topicId:null and topicName:null when user wants any topic from a subject or when subject has no topics
6) Default to 10 questions per subject/topic when no count specified
7) If user gives total count and specific topic counts, compute remainder for general questions (topicId:null)
8) The chatbotReply should be natural, friendly, and describe what test you're creating
9) Always use valid subjectId and names from AVAILABLE_CONTENT only

AVAILABLE_CONTENT:
${JSON.stringify(availableContent)}

USER_MESSAGE:
${message}

Return EXACT JSON now with format: {"testPlan":[{"subjectId":"...","subjectName":"...","topicId":null or "...","topicName":null or "...","count":number}],"chatbotReply":"..."}`;


        const result = await model.generateContent(prompt);
        
        try {
          parserText = await Promise.resolve(typeof result.response.text === 'function' ? result.response.text() : (result.response && result.response.toString ? result.response.toString() : String(result)));
        } catch (e) {
          parserText = String(result && result.response ? result.response : result);
        }

        console.log('DEBUG: parserText (start):', String(parserText || '').slice(0,400).replace(/\n/g,' '));

        let candidate = null;
        const fenceMatch = String(parserText || '').match(/```(?:json)?\s*([\s\S]*?)```/i);
        if (fenceMatch && fenceMatch[1]) {
          candidate = fenceMatch[1];
        }

        if (!candidate) {
          const m = String(parserText || '').match(/\{[\s\S]*\}/);
          if (m) candidate = m[0];
        }

        if (!candidate) candidate = String(parserText || '');

        let cleanedCandidate = candidate.replace(/```json/g, '').replace(/```/g, '');
        cleanedCandidate = cleanedCandidate.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'").replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
        cleanedCandidate = cleanedCandidate.replace(/[\x00-\x1F\x7F]+/g, '');
        cleanedCandidate = cleanedCandidate.replace(/,\s*(?=[}\]])/g, '');
        cleanedCandidate = cleanedCandidate.trim();

        console.log('DEBUG: cleanedCandidate (start):', String(cleanedCandidate || '').slice(0,400).replace(/\n/g,' '));

        const parseErrors = [];
        try {
          parsedPlan = JSON.parse(cleanedCandidate);
          usedParser = 'gemini';
        } catch (e) {
          const em = e && e.message ? e.message : String(e);
          parseErrors.push({ step: 'cleanedCandidate', message: em });
          console.warn('DEBUG: JSON.parse(cleanedCandidate) failed:', em);
          const allMatches = Array.from(String(parserText || '').matchAll(/\{[\s\S]*?\}/g)).map(m => m[0]);
          if (allMatches.length) {
            console.log('DEBUG: found', allMatches.length, '{...} blocks to try parsing');
            for (let idx = 0; idx < allMatches.length; idx++) {
              const mstr = allMatches[idx];
              let tryStr = mstr.replace(/```json/g, '').replace(/```/g, '').replace(/[\x00-\x1F\x7F]+/g, '');
              tryStr = tryStr.replace(/,\s*(?=[}\]])/g, '').trim();
              try {
                parsedPlan = JSON.parse(tryStr);
                usedParser = 'gemini';
                console.log('DEBUG: successfully parsed one {...} block at index', idx);
                break;
              } catch (err) {
                parseErrors.push({ step: `block#${idx}`, message: err && err.message ? err.message : String(err) });
              }
            }
          }
        }

      } catch (err) {
        console.warn('Gemini parsing failed, falling back to local parser:', err && err.message ? err.message : err);
      }
    }

    // If model didn't return a valid plan, optionally fall back to local parser if enabled
      if (!parsedPlan) {
        if (parserText && typeof parserText === 'string') {
          const raw = String(parserText).replace(/```[\s\S]*?```/g, ' ');
          const textLower = raw.toLowerCase();
          const heuristicPlan = [];

          // Helper to escape regex
          const escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // Find total numbers mentioned in text (look for 'total X' or 'having total X')
          const totalMatch = raw.match(/total\s*(?:of\s*)?(\d+)/i) || raw.match(/having total\s*(\d+)/i);
          const globalTotal = totalMatch ? parseInt(totalMatch[1], 10) : null;

          // For each subject present in availableContent, try to extract counts per known topics
          for (const subj of availableContent.subjects) {
            if (!subj || !subj.name) continue;
            if (!textLower.includes((subj.name || '').toLowerCase())) continue;

            let subjTotal = null;
            // look for 'subjectName ... total N'
            const subjTotalRe = new RegExp(escapeRegex(subj.name) + '.{0,60}?total\\s*(?:of\\s*)?(\\d+)', 'i');
            const sm = raw.match(subjTotalRe);
            if (sm) subjTotal = parseInt(sm[1], 10);

            const topicCounts = [];
            for (const tp of (subj.topics || [])) {
              if (!tp || !tp.name) continue;
              // look for patterns like '8 questions from testing' or 'testing ... 8 questions'
              const p1 = new RegExp('(\\\d+)\\s*(?:questions|question)\\s*(?:from|of)?\\s*' + escapeRegex(tp.name), 'i');
              const p2 = new RegExp(escapeRegex(tp.name) + '.{0,40}?(?:' + '(?:\\b)(\\\d+)(?:\\b))', 'i');
              let m = raw.match(p1);
              if (!m) m = raw.match(p2);
              if (m) {
                const c = parseInt(m[1], 10);
                if (!isNaN(c)) topicCounts.push({ topicId: tp.id, topicName: tp.name, count: c });
              }
            }

            // If we found topic counts, compute remainder based on subjTotal or globalTotal if available
            let sumTopic = topicCounts.reduce((a, b) => a + (b.count || 0), 0);
            let finalTotal = subjTotal || globalTotal || null;
            if (finalTotal !== null) {
              const remainder = finalTotal - sumTopic;
              if (remainder > 0) {
                heuristicPlan.push(...topicCounts.map(t => ({ subjectId: subj.id, subjectName: subj.name, topicId: t.topicId, topicName: t.topicName, count: t.count })));
                heuristicPlan.push({ subjectId: subj.id, subjectName: subj.name, topicId: null, topicName: null, count: remainder });
              } else if (topicCounts.length > 0) {
                heuristicPlan.push(...topicCounts.map(t => ({ subjectId: subj.id, subjectName: subj.name, topicId: t.topicId, topicName: t.topicName, count: t.count })));
              }
            } else if (topicCounts.length > 0) {
              // if only topic counts present but no total, use topic counts and don't add remainder
              heuristicPlan.push(...topicCounts.map(t => ({ subjectId: subj.id, subjectName: subj.name, topicId: t.topicId, topicName: t.topicName, count: t.count })));
            }
          }

          if (heuristicPlan.length) {
            // Use heuristic plan but preserve original chatbotReply from parserText
            let extractedReply = '';
            try {
              // Try to extract chatbotReply from the parserText JSON
              const cleanText = String(parserText || '').replace(/```json/g, '').replace(/```/g, '').trim();
              const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const tempParsed = JSON.parse(jsonMatch[0]);
                if (tempParsed.chatbotReply) extractedReply = tempParsed.chatbotReply;
              }
            } catch (e) {
              console.warn('Could not extract chatbotReply from parserText:', e.message);
            }
            
            // Only use heuristic plan if we have a valid chatbotReply from Gemini
            if (extractedReply) {
              parsedPlan = { testPlan: heuristicPlan, chatbotReply: extractedReply };
              usedParser = 'gemini-heuristic';
            }
          }
        }
      }

    if (!parsedPlan) {
      return res.status(400).json({ error: 'Could not parse test request. Try a clearer message like "Create 10 math questions"', parser_response: parserText });
    }

    // Validate and normalize testPlan entries
    const testPlan = Array.isArray(parsedPlan.testPlan) ? parsedPlan.testPlan.map((entry) => {
      const subjId = entry.subjectId || entry.subject || null;
      const subjName = entry.subjectName || entry.subject || null;
      const topicId = (typeof entry.topicId === 'undefined') ? (entry.topic || null) : entry.topicId;
      const topicName = (typeof entry.topicName === 'undefined') ? (entry.topicName || null) : entry.topicName;
      // Accept multiple possible keys from model: count, questionCount, question_count, c
      const rawCount = (typeof entry.count !== 'undefined') ? entry.count : ((typeof entry.questionCount !== 'undefined') ? entry.questionCount : ((typeof entry.question_count !== 'undefined') ? entry.question_count : (typeof entry.c !== 'undefined' ? entry.c : 0)));
      const count = parseInt(rawCount || 0, 10) || 0;
      return { subjectId: subjId, subjectName: subjName, topicId: topicId, topicName: topicName, count };
    }) : [];

  // For each plan entry, fetch questions
    const questionsByPlan = [];
    for (let i = 0; i < testPlan.length; i++) {
      const p = testPlan[i];
      const questions = await fetchQuestionsByPlan(p.subjectId, p.count, p.topicId);
      questionsByPlan.push({ planIndex: i, subjectId: p.subjectId, topicId: p.topicId, questions });
    }

  // Normalize/flatten questions into a single testData object that the frontend can consume.
  const normalizeQuestion = (doc, planMeta = {}) => {
    if (!doc) return null;
    const qid = doc._id && doc._id.toString ? doc._id.toString() : (doc._id ? String(doc._id) : null);
    const question = doc.question || doc.q || doc.question_text || doc.body || '';
    const opt1 = doc.opt1 || doc.opt_1 || doc.option1 || doc.option_1 || '';
    const opt2 = doc.opt2 || doc.opt_2 || doc.option2 || doc.option_2 || '';
    const opt3 = doc.opt3 || doc.opt_3 || doc.option3 || doc.option_3 || '';
    const opt4 = doc.opt4 || doc.opt_4 || doc.option4 || doc.option_4 || '';
    const rawAns = doc.ans || doc.answer || doc.correct_answer || '';

    // Normalize ans to letter(s) a|b|c|d when possible. If numeric (1-4) map to a-d.
    const normalizeAnsToLetter = (a) => {
      if (!a && a !== 0) return '';
      const s = String(a).trim().toLowerCase();
      const parts = s.split(/[|,;]+/).map(p => p.trim()).filter(Boolean);
      const letters = parts.map(p => {
        if (/^[1-4]$/.test(p)) return ['a','b','c','d'][parseInt(p, 10) - 1];
        if (/^[abcd]$/.test(p)) return p;
        const m = p.match(/[abcd]/);
        if (m) return m[0];
        return p;
      }).filter(Boolean);
      return letters.join('|');
    };

    const correct = normalizeAnsToLetter(rawAns);

    return {
      _id: qid,
      question: question || '',
      opt1: opt1 || '',
      opt2: opt2 || '',
      opt3: opt3 || '',
      opt4: opt4 || '',
      ans: rawAns || '',
      correct: correct || '',
      raw: doc,
      meta: planMeta
    };
  };

  const flattenedQuestions = [];
  for (const pb of questionsByPlan) {
    const planMeta = { planIndex: pb.planIndex, subjectId: pb.subjectId, topicId: pb.topicId };
    if (Array.isArray(pb.questions)) {
      for (const q of pb.questions) {
        const nq = normalizeQuestion(q, planMeta);
        if (nq) flattenedQuestions.push(nq);
      }
    }
  }

  const testData = {
    testPlan,
    questionsByPlan,
    questions: flattenedQuestions,
    questionCount: flattenedQuestions.length,
    createdAt: Date.now()
  };

  // Optionally correct grammar/tense of the chatbot reply using Gemini if enabled.
  let finalChatbotReply = (parsedPlan.chatbotReply || '').trim();
  // Enable grammar correction by setting CORRECT_REPLY=true in .env. Disabled by default to avoid extra LLM calls.
  if (process.env.CORRECT_REPLY === 'true' && process.env.GEMINI_API_KEY && GoogleGenerativeAI) {
    try {
      const genAI2 = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model2 = genAI2.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const correctionPrompt = `Correct the grammar and tense of the following single sentence to fluent, natural English. Return ONLY the corrected sentence (no explanation):\n\n"${finalChatbotReply.replace(/"/g, '\\"')}"`;
      const corrRes = await model2.generateContent(correctionPrompt);
      let corrText = null;
      try {
        corrText = await Promise.resolve(typeof corrRes.response.text === 'function' ? corrRes.response.text() : (corrRes.response && corrRes.response.toString ? corrRes.response.toString() : String(corrRes)));
      } catch (e) {
        corrText = String(corrRes && corrRes.response ? corrRes.response : corrRes);
      }
      if (corrText) {
        corrText = String(corrText).replace(/```/g, '').trim();
        if (corrText) finalChatbotReply = corrText;
      }
    } catch (e) {
      console.warn('chatbotReply correction failed:', e && e.message ? e.message : e);
    }
  }

  const responsePayload = { testPlan, questionsByPlan, testData, chatbotReply: finalChatbotReply, parser_response: parserText, usedParser };
  if (usedParser !== 'gemini') {
    responsePayload.debug = {
      cleanedCandidate: (typeof cleanedCandidate !== 'undefined' ? String(cleanedCandidate).slice(0, 2000) : null),
      parseErrors: (typeof parseErrors !== 'undefined' ? parseErrors : []),
      allMatchesFound: String(parserText || '').match(/\{[\s\S]*?\}/g) ? String(parserText || '').match(/\{[\s\S]*?\}/g).length : 0
    };
  }
  return res.json(responsePayload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

const PORT = process.env.DEV_SERVER_PORT || 4000;

// Only start listening when not in Vercel serverless environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}

// Export for Vercel serverless functions
module.exports = app;
