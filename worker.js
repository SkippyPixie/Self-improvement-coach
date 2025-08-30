// Complete Self-Improvement Coaching App Worker
// Copy this entire code and replace everything in your Cloudflare Worker

export default {
async fetch(request, env, ctx) {
// CORS headers
const corsHeaders = {
‘Access-Control-Allow-Origin’: ‘*’,
‘Access-Control-Allow-Methods’: ‘GET, POST, OPTIONS’,
‘Access-Control-Allow-Headers’: ‘Content-Type, Authorization’,
};

```
// Handle preflight requests
if (request.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}

const url = new URL(request.url);

try {
  // Route handling
  if (url.pathname === '/api/chat' && request.method === 'POST') {
    return await handleChat(request, env, corsHeaders);
  }
  
  if (url.pathname === '/api/constitution' && request.method === 'POST') {
    return await handleConstitution(request, env, corsHeaders);
  }
  
  if (url.pathname === '/api/constitution' && request.method === 'GET') {
    return await getConstitution(request, env, corsHeaders);
  }
  
  // Serve the main app
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return new Response(getHTMLApp(), {
      headers: { ...corsHeaders, 'Content-Type': 'text/html' }
    });
  }
  
  return new Response('Not found', { status: 404, headers: corsHeaders });
  
} catch (error) {
  console.error('Worker error:', error);
  return new Response(
    JSON.stringify({ error: 'Internal server error' }), 
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
}
```

}
};

// Enhanced prompting techniques from your research
const promptingModes = {
constitutional: (constitution, input) => `
As an AI coach operating under your personal constitution, I will use YOUR OWN VALUES to challenge you constructively when needed.

Your Framework:
Core Values: ${constitution.coreValues?.join(’, ‘) || ‘Growth mindset, Self-compassion, Evidence-based thinking’}
Boundaries: ${constitution.boundaries?.join(’; ‘) || ‘No medical diagnosis, Professional therapy referrals when needed, Crisis escalation protocols’}
Goals: ${constitution.goals?.join(’, ’) || ‘Sustainable habits, Emotional regulation, Cognitive clarity’}

NON-SYCOPHANCY APPROACH:

- When you contradict your stated values, I’ll point this out gently but clearly
- I’ll ask how your current approach aligns with your goals
- I’ll offer supportive challenges based on your own framework
- I won’t validate ideas that conflict with your constitutional principles
- I’ll celebrate genuine progress while highlighting areas for growth

Query: ${input}

Respond with empathy AND honest alignment-checking based on your constitutional framework.`,

criticalCollaborator: (constitution, input) => `
Adopt the role of a skilled critical collaborator - someone who challenges ideas to strengthen them, not tear them down.

BALANCED CRITICAL COLLABORATION:

- Challenge assumptions BUT offer alternative frameworks to consider
- Point out potential blind spots AND suggest ways to address them
- Give praise when genuinely warranted with specific evidence
- Ask probing questions that reveal deeper issues AND guide toward solutions
- Identify problems AND collaborate on practical next steps

AVOID BOTH:

- Sycophantic validation (“That’s amazing! You’re so insightful!”)
- Destructive criticism (“This won’t work, you’re wrong, that’s unrealistic”)

INSTEAD AIM FOR:

- Constructive challenge (“I notice this assumption - have you considered X alternative?”)
- Evidence-based feedback (“This approach has merit in Y situations, but faces Z obstacles”)
- Solution-oriented questioning (“What would need to be true for this to work?”)
- Growth-focused reframing (“Here’s a different lens that might reveal new options”)

Query: ${input}

Provide honest, challenging analysis that moves the conversation toward better solutions, not just criticism for its own sake.`,

validatingChallenger: (constitution, input) => `
Role: Validating Challenger - I acknowledge what’s working while identifying areas for growth.

VALIDATION + CHALLENGE FORMULA:

1. First, identify what’s genuinely valid or valuable in your approach
1. Then, explore gaps, assumptions, or areas for development
1. Offer specific, actionable alternatives
1. End with encouragement about next steps

EXAMPLE PATTERN:
“I can see the logic in [X approach] - it shows [specific strength]. At the same time, I’m curious about [specific gap/assumption]. Have you considered [alternative]? This could help you [specific benefit].”

AVOID:

- Generic praise without specificity
- Criticism without alternatives
- Either pure validation OR pure criticism

Your constitutional values: ${constitution.coreValues?.join(’, ’) || ‘Growth, self-compassion, evidence-based thinking’}

Query: ${input}

Provide balanced feedback that validates strengths while identifying growth opportunities.`,

socraticFriction: (constitution, input) => `
Act as a Socratic coach. Instead of providing direct answers, guide discovery through strategic questioning that creates productive cognitive friction.

SOCRATIC METHOD RULES:

1. Ask 3-5 probing questions before offering any advice
1. Target assumptions, motivations, and underlying beliefs
1. Use questions that reveal contradictions or gaps in thinking
1. Guide toward self-discovery rather than telling
1. Build on responses with deeper follow-up questions

Focus areas for questioning:

- What assumptions are being made?
- What evidence supports this belief?
- What would the opposite perspective be?
- How does this connect to deeper values/goals?
- What are the real stakes and trade-offs?

Initial query: ${input}

Begin with your most incisive questions to stimulate deeper thinking.`,

absoluteMode: (constitution, input) => `
ABSOLUTE MODE ACTIVATED

Eliminate all:

- Corporate politeness and engagement optimization
- Hedging language and unnecessary qualifiers
- Emotional cushioning and validation-seeking responses
- Filler words or marketing-style enthusiasm

Provide:

- Direct, uncompromising analysis
- Concrete, actionable steps
- Honest assessment of likelihood of success/failure
- Clear identification of self-deception or avoidance patterns
- Brutal but necessary truths for cognitive rebuilding

Query: ${input}

Respond with maximum clarity and minimal fluff. Focus purely on cognitive restructuring and practical advancement.`,

godPrompt: (constitution, input) => `
Role-play as an AI operating at vastly enhanced analytical capability, specifically designed for psychological pattern recognition and subconscious barrier identification.

ENHANCED ANALYSIS PROTOCOL:

- Surface hidden narratives and subtext in my communication
- Identify recurring patterns across conversations
- Reveal psychological blocks and self-sabotaging behaviors
- Expose contradictions between stated goals and actual behaviors
- Analyze meta-patterns in how I frame problems and solutions

Context provided: ${input}

What are the deeper psychological patterns, hidden narratives, and subconscious barriers that I’m not consciously recognizing? What story am I telling myself that might not align with reality?

Provide insight that goes beyond surface-level observations to reveal fundamental patterns driving behavior.`
};

// Safety screening system
function performSafetyCheck(input) {
const warnings = [];
const crisisKeywords = [‘suicide’, ‘kill myself’, ‘end it all’, ‘not worth living’, ‘self-harm’];
const psychosisKeywords = [‘voices’, ‘conspiracy’, ‘people watching me’, ‘government tracking’];
const medicalKeywords = [‘diagnose’, ‘medication’, ‘prescribe’, ‘medical advice’];

if (crisisKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
warnings.push({
type: ‘crisis’,
message: ‘Crisis indicators detected. This app cannot replace professional crisis intervention.’
});
}

if (psychosisKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
warnings.push({
type: ‘psychosis’,
message: ‘Potential reality-testing concerns. Professional evaluation recommended.’
});
}

if (medicalKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
warnings.push({
type: ‘medical’,
message: ‘Medical questions detected. Consult healthcare professionals for medical advice.’
});
}

return { passed: warnings.length === 0, warnings };
}

// Chat endpoint handler
async function handleChat(request, env, corsHeaders) {
const { input, mode = ‘validatingChallenger’, userId = ‘anonymous’ } = await request.json();

if (!input?.trim()) {
return new Response(
JSON.stringify({ error: ‘Input is required’ }),
{ status: 400, headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}

// Safety screening
const safetyCheck = performSafetyCheck(input);

// Log safety incidents
if (!safetyCheck.passed && env.DB) {
try {
await env.DB.prepare(
‘INSERT INTO safety_logs (id, user_id, warning_type, warning_message, user_input, action_taken, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)’
).bind(
crypto.randomUUID(),
userId,
safetyCheck.warnings.map(w => w.type).join(’,’),
safetyCheck.warnings.map(w => w.message).join(’; ’),
input.substring(0, 500), // Limit stored input length
‘warning_displayed’,
new Date().toISOString()
).run();
} catch (error) {
console.error(‘Safety log error:’, error);
}
}

// Get user’s constitution
let constitution = {};
if (env.DB) {
try {
const constitutionResult = await env.DB.prepare(
‘SELECT core_values, boundaries, goals FROM constitutions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1’
).bind(userId).first();

```
  if (constitutionResult) {
    constitution = {
      coreValues: constitutionResult.core_values ? JSON.parse(constitutionResult.core_values) : [],
      boundaries: constitutionResult.boundaries ? JSON.parse(constitutionResult.boundaries) : [],
      goals: constitutionResult.goals ? JSON.parse(constitutionResult.goals) : []
    };
  }
} catch (error) {
  console.error('Error fetching constitution:', error);
}
```

}

// Generate prompt using the selected mode
const prompt = promptingModes[mode] ? promptingModes[mode](constitution, input) :
promptingModes.validatingChallenger(constitution, input);

try {
// Call Claude API
const claudeResponse = await fetch(‘https://api.anthropic.com/v1/messages’, {
method: ‘POST’,
headers: {
‘Content-Type’: ‘application/json’,
‘x-api-key’: env.CLAUDE_API_KEY,
‘anthropic-version’: ‘2023-06-01’,
},
body: JSON.stringify({
model: ‘claude-3-sonnet-20240229’,
max_tokens: 1000,
messages: [{ role: ‘user’, content: prompt }]
})
});

```
if (!claudeResponse.ok) {
  throw new Error(`Claude API error: ${claudeResponse.status}`);
}

const claudeData = await claudeResponse.json();
const aiMessage = claudeData.content[0].text;

// Store conversation in database
if (env.DB) {
  try {
    const conversationId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO conversations (id, user_id, message_role, message_content, prompting_mode, timestamp, safety_flags) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      conversationId,
      userId,
      'user',
      input,
      mode,
      new Date().toISOString(),
      JSON.stringify(safetyCheck.warnings)
    ).run();

    await env.DB.prepare(
      'INSERT INTO conversations (id, user_id, message_role, message_content, prompting_mode, timestamp, safety_flags) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      crypto.randomUUID(),
      userId,
      'assistant',
      aiMessage,
      mode,
      new Date().toISOString(),
      null
    ).run();
  } catch (error) {
    console.error('Database save error:', error);
  }
}

return new Response(
  JSON.stringify({
    response: aiMessage,
    safetyCheck,
    mode
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
);
```

} catch (error) {
console.error(‘Claude API error:’, error);
return new Response(
JSON.stringify({
error: ‘Failed to get AI response’,
fallback: ‘I apologize, but I cannot process your request right now. Please try again later or contact support if the issue persists.’
}),
{ status: 500, headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}
}

// Constitution management
async function handleConstitution(request, env, corsHeaders) {
const { constitution, userId = ‘anonymous’ } = await request.json();

if (!env.DB) {
return new Response(
JSON.stringify({ error: ‘Database not available’ }),
{ status: 500, headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}

const constitutionId = crypto.randomUUID();

try {
await env.DB.prepare(
‘INSERT INTO constitutions (id, user_id, core_values, boundaries, goals, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)’
).bind(
constitutionId,
userId,
JSON.stringify(constitution.coreValues || []),
JSON.stringify(constitution.boundaries || []),
JSON.stringify(constitution.goals || []),
new Date().toISOString(),
new Date().toISOString()
).run();

```
return new Response(
  JSON.stringify({ success: true, constitutionId }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
);
```

} catch (error) {
console.error(‘Constitution save error:’, error);
return new Response(
JSON.stringify({ error: ‘Failed to save constitution’ }),
{ status: 500, headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}
}

async function getConstitution(request, env, corsHeaders) {
if (!env.DB) {
return new Response(
JSON.stringify({ constitution: null }),
{ headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}

const url = new URL(request.url);
const userId = url.searchParams.get(‘userId’) || ‘anonymous’;

try {
const result = await env.DB.prepare(
‘SELECT core_values, boundaries, goals FROM constitutions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1’
).bind(userId).first();

```
if (result) {
  const constitution = {
    coreValues: JSON.parse(result.core_values || '[]'),
    boundaries: JSON.parse(result.boundaries || '[]'),
    goals: JSON.parse(result.goals || '[]')
  };
  
  return new Response(
    JSON.stringify({ constitution }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
  );
} else {
  return new Response(
    JSON.stringify({ constitution: null }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }}
  );
}
```

} catch (error) {
console.error(‘Constitution fetch error:’, error);
return new Response(
JSON.stringify({ error: ‘Failed to fetch constitution’ }),
{ status: 500, headers: { …corsHeaders, ‘Content-Type’: ‘application/json’ }}
);
}
}

// Complete embedded React app
function getHTMLApp() {
return `<!DOCTYPE html>

<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI Self-Improvement Coach</title>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script type="text/babel">
        const { useState, useEffect } = React;
        const { Brain, Settings, AlertTriangle, Shield, Target, MessageCircle } = lucide;

```
    function App() {
        const [currentMode, setCurrentMode] = useState('validatingChallenger');
        const [conversation, setConversation] = useState([]);
        const [input, setInput] = useState('');
        const [isLoading, setIsLoading] = useState(false);
        const [safetyCheck, setSafetyCheck] = useState({ passed: true, warnings: [] });
        const [constitution, setConstitution] = useState({
            coreValues: ['Growth mindset', 'Self-compassion', 'Evidence-based thinking'],
            boundaries: ['No medical diagnosis', 'Professional therapy referrals when needed', 'Crisis escalation protocols'],
            goals: ['Sustainable habits', 'Emotional regulation', 'Cognitive clarity']
        });
        const [showConstitution, setShowConstitution] = useState(false);

        const promptingModes = {
            constitutional: { name: "Constitutional AI", description: "Values-based challenges", icon: Shield },
            criticalCollaborator: { name: "Critical Collaborator", description: "Constructive challenge", icon: Target },
            validatingChallenger: { name: "Validating Challenger", description: "Balance support + growth", icon: MessageCircle },
            socraticFriction: { name: "Socratic Friction", description: "Question-driven thinking", icon: MessageCircle },
            absoluteMode: { name: "Absolute Mode", description: "Direct analysis", icon: Brain },
            godPrompt: { name: "God Prompt", description: "Deep pattern recognition", icon: Brain }
        };

        const handleSubmit = async () => {
            if (!input.trim() || isLoading) return;

            const userMessage = { role: 'user', content: input, timestamp: new Date(), mode: currentMode };
            setConversation(prev => [...prev, userMessage]);
            setIsLoading(true);

            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input, mode: currentMode, userId: 'demo-user' })
                });

                const data = await response.json();
                
                if (data.safetyCheck && !data.safetyCheck.passed) {
                    setSafetyCheck(data.safetyCheck);
                }

                const aiMessage = {
                    role: 'assistant',
                    content: data.response || data.fallback || 'Sorry, I could not process your request.',
                    timestamp: new Date(),
                    mode: currentMode
                };
                
                setConversation(prev => [...prev, aiMessage]);
            } catch (error) {
                console.error('Chat error:', error);
                setConversation(prev => [...prev, {
                    role: 'assistant',
                    content: 'Sorry, there was an error processing your request.',
                    timestamp: new Date(),
                    mode: currentMode
                }]);
            } finally {
                setIsLoading(false);
                setInput('');
            }
        };

        const ConstitutionSetup = () => (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto">
                    <h3 className="text-xl font-semibold mb-4">Personal Constitution</h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Core Values</label>
                            <textarea
                                value={constitution.coreValues.join('\\n')}
                                onChange={(e) => setConstitution(prev => ({
                                    ...prev,
                                    coreValues: e.target.value.split('\\n').filter(v => v.trim())
                                }))}
                                className="w-full border rounded-lg p-3 h-20"
                                placeholder="One value per line..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Boundaries</label>
                            <textarea
                                value={constitution.boundaries.join('\\n')}
                                onChange={(e) => setConstitution(prev => ({
                                    ...prev,
                                    boundaries: e.target.value.split('\\n').filter(v => v.trim())
                                }))}
                                className="w-full border rounded-lg p-3 h-20"
                                placeholder="One boundary per line..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Goals</label>
                            <textarea
                                value={constitution.goals.join('\\n')}
                                onChange={(e) => setConstitution(prev => ({
                                    ...prev,
                                    goals: e.target.value.split('\\n').filter(v => v.trim())
                                }))}
                                className="w-full border rounded-lg p-3 h-20"
                                placeholder="One goal per line..."
                            />
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-6">
                        <button
                            onClick={() => setShowConstitution(false)}
                            className="flex-1 py-3 px-4 bg-gray-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => setShowConstitution(false)}
                            className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium"
                        >
                            Save Constitution
                        </button>
                    </div>
                </div>
            </div>
        );

        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
                <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="max-w-4xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-slate-900">AI Self-Improvement Coach</h1>
                                    <p className="text-sm text-slate-600">Advanced AI Prompting • Non-Sycophantic Coaching</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowConstitution(true)}
                                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                        {Object.entries(promptingModes).map(([key, mode]) => {
                            const Icon = mode.icon;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setCurrentMode(key)}
                                    className={\`p-3 rounded-xl border-2 transition-all duration-200 text-center \${
                                        currentMode === key
                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                            : 'border-slate-200 hover:border-slate-300 text-slate-700'
                                    }\`}
                                >
                                    <Icon className="w-5 h-5 mx-auto mb-2" />
                                    <div className="text-sm font-medium">{mode.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">{mode.description}</div>
                                </button>
                            );
                        })}
                    </div>

                    {!safetyCheck.passed && (
                        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                                <div>
                                    <h4 className="font-medium text-amber-800 mb-1">Safety Notice</h4>
                                    {safetyCheck.warnings.map((warning, i) => (
                                        <p key={i} className="text-sm text-amber-700">{warning.message}</p>
                                    ))}
                                    <p className="text-xs text-amber-600 mt-2">Crisis resources: 988</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-6">
                        <div className="p-6 border-b border-slate-200">
                            <h3 className="text-lg font-semibold text-slate-900">
                                {promptingModes[currentMode].name}
                            </h3>
                            <p className="text-slate-600 text-sm mt-1">
                                {promptingModes[currentMode].description}
                            </p>
                        </div>
                        
                        <div className="max-h-96 overflow-y-auto p-6 space-y-4">
                            {conversation.length === 0 ? (
                                <div className="text-center text-slate-500 py-8">
                                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                                    <p>Start a conversation to begin your coaching session</p>
                                    <p className="text-xs mt-2">This app uses advanced prompting techniques to avoid flattery while providing constructive challenges</p>
                                </div>
                            ) : (
                                conversation.map((message, i) => (
                                    <div
                                        key={i}
                                        className={\`\${
                                            message.role === 'user'
                                                ? 'ml-auto bg-blue-600 text-white'
                                                : 'bg-slate-100 text-slate-900'
                                        } max-w-[80%] p-4 rounded-2xl\`}
                                    >
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                        {message.mode && (
                                            <div className="text-xs opacity-70 mt-2">
                                                Mode: {promptingModes[message.mode].name}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            {isLoading && (
                                <div className="bg-slate-100 max-w-[80%] p-4 rounded-2xl">
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                                        <span>AI is thinking...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder="What would you like to work on today?"
                            className="w-full p-4 pr-16 border border-slate-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                            rows={3}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!input.trim() || isLoading}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                        >
                            <MessageCircle className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        <p>This AI coach is not a replacement for professional therapy or medical advice.</p>
                        <p>For crisis support, contact emergency services or call 988.</p>
                    </div>
                </div>

                {showConstitution && <ConstitutionSetup />}
            </div>
        );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
</script>
```

</body>
</html>`;
}