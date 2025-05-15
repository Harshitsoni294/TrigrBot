// Simple test script for the chatbot
const message = process.argv[2] || 'create zoom test of 15 questions 8 must be from testing topic';

async function test() {
  try {
    console.log('Testing with message:', message);
    const response = await fetch('http://localhost:4000/generate-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      console.error('HTTP Error:', response.status, response.statusText);
      const err = await response.json().catch(() => ({}));
      console.error('Error details:', err);
      return;
    }

    const data = await response.json();
    console.log('\n✅ usedParser:', data.usedParser);
    console.log('✅ chatbotReply:', data.chatbotReply);
    console.log('✅ testPlan:', JSON.stringify(data.testPlan, null, 2));
    console.log('✅ Total questions:', data.questionsByPlan.reduce((a,b) => a + b.questions.length, 0));
    if (data.debug) {
      console.log('\n⚠️  DEBUG INFO:', data.debug);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
