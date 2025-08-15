(function () {
    // State Management
    let state = {
        isAuthenticated: false,
        currentUser: null,
        currentLanguage: localStorage.getItem("language") || "english",
        isDarkMode: localStorage.getItem("theme") === "dark",
        users: JSON.parse(localStorage.getItem("users")) || {},
        moodData: JSON.parse(localStorage.getItem("moodData")) || {},
        moodChart: null,
        conversationHistory: [],
        userPreferences: JSON.parse(localStorage.getItem("userPreferences")) || { customReplies: [], affirmations: [] },
        comfortLevel: 0,
        streakCount: parseInt(localStorage.getItem("streakCount")) || 0,
        lastResponseType: null,
        contextStack: [],
        sentimentHistory: [],
        isVoiceActive: false,
        lastMoodPrediction: null,
        crisisSensitivity: parseInt(localStorage.getItem("crisisSensitivity")) || 50,
        reminderFrequency: localStorage.getItem("reminderFrequency") || "none",
        achievements: JSON.parse(localStorage.getItem("achievements")) || [],
        offlineCache: JSON.parse(localStorage.getItem("offlineCache")) || { resources: [], replies: [] },
        journalEntries: JSON.parse(localStorage.getItem("journalEntries")) || {},
        gratitudeLog: JSON.parse(localStorage.getItem("gratitudeLog")) || {},
        sleepLog: JSON.parse(localStorage.getItem("sleepLog")) || {},
        goals: JSON.parse(localStorage.getItem("goals")) || [],
        stressTriggers: JSON.parse(localStorage.getItem("stressTriggers")) || [],
        emotionWheelSelection: null,
        cbtResponses: JSON.parse(localStorage.getItem("cbtResponses")) || {},
    };

    // DOM Elements
    const elements = {
        authContainer: document.getElementById("auth-container"),
        mainApp: document.getElementById("main-app"),
        loginForm: document.getElementById("login-form"),
        registerForm: document.getElementById("register-form"),
        loginBtn: document.getElementById("login-btn"),
        registerBtn: document.getElementById("register-btn"),
        logoutBtn: document.getElementById("logout-btn"),
        toggleToRegister: document.getElementById("toggle-to-register"),
        toggleToLogin: document.getElementById("toggle-to-login"),
        userInput: document.getElementById("user-input"),
        sendBtn: document.getElementById("send-btn"),
        voiceBtn: document.getElementById("voice-btn"),
        languageSelector: document.getElementById("language-selector"),
        chatContainer: document.getElementById("chat-messages"),
        quickRepliesContainer: document.getElementById("quick-replies"),
        feedbackBtn: document.getElementById("feedback-btn"),
        feedbackForm: document.getElementById("feedback-tab"),
        navItems: document.querySelectorAll(".nav-item"),
        tabContents: document.querySelectorAll(".tab-content"),
        moodButtons: document.querySelectorAll(".mood-btn"),
        themeToggle: document.getElementById("theme-toggle"),
        exportChat: document.getElementById("export-chat"),
        addCustomReply: document.getElementById("add-custom-reply"),
        sentimentStatus: document.getElementById("sentiment-status"),
        exportMood: document.getElementById("export-mood"),
        playMeditation: document.getElementById("play-meditation"),
        meditationProgress: document.getElementById("meditation-progress"),
        crisisSensitivity: document.getElementById("crisis-sensitivity"),
        reminderFrequency: document.getElementById("reminder-frequency"),
        saveSettings: document.getElementById("save-settings"),
        moodChartCanvas: document.getElementById("mood-chart"),
        resourcesGrid: document.getElementById("resources-grid"),
        emergencyResources: document.getElementById("emergency-resources"),
        actionPlan: document.getElementById("action-plan"),
        insightsGrid: document.getElementById("insights-grid"),
        feedbackText: document.getElementById("feedback-text"),
        journalPrompt: document.getElementById("journal-prompt"),
        gratitudeLog: document.getElementById("gratitude-log"),
        sleepLog: document.getElementById("sleep-log"),
        goalList: document.getElementById("goal-list"),
        stressHeatmap: document.getElementById("stress-heatmap"),
        affirmationDisplay: document.getElementById("affirmation-display"),
        emotionWheel: document.getElementById("emotion-wheel"),
        cbtExercise: document.getElementById("cbt-exercise"),
        mindfulnessGame: document.getElementById("mindfulness-game"),
        anxietyTimer: document.getElementById("anxiety-timer"),
        copingLibrary: document.getElementById("coping-library"),
    };

    // API Configuration
    const API_CONFIG = {
        // Add your API key here
        API_KEY: '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', // Your OpenRouter API key
        
        OPENAI: {
            url: 'https://openrouter.ai/api/v1/chat/completions', // Updated for OpenRouter
            model: 'openai/gpt-3.5-turbo', // OpenRouter format for GPT-3.5
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY_HERE', // Will be replaced dynamically
                'HTTP-Referer': 'http://localhost:8000', // Your app URL
                'X-Title': 'MindAidPro' // Your app name
            }
        },
        
        HUGGING_FACE: {
            url: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY_HERE'
            }
        },
        
        COHERE: {
            url: 'https://api.cohere.ai/v1/generate',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_API_KEY_HERE'
            }
        },
        
        GOOGLE_AI: {
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
            headers: {
                'Content-Type': 'application/json'
            }
        },
        
        // Set your preferred API provider here
        CURRENT_PROVIDER: 'OPENAI' // Using OpenAI (via OpenRouter)
    };

    // API Integration Functions
    async function generateAIResponse(userMessage, mood = null) {
        try {
            const provider = API_CONFIG.CURRENT_PROVIDER;
            const apiKey = API_CONFIG.API_KEY;
            
            if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
                console.log('API key not set, using fallback response');
                return getFallbackResponse(mood);
            }

            // Create a context-aware prompt for mental health support
            const systemPrompt = `You are a compassionate, empathetic mental health support assistant. Respond as a caring friend who:
            - Provides emotional support and validation
            - Offers practical coping strategies
            - Uses warm, encouraging language
            - Keeps responses concise (2-3 sentences max)
            - Avoids giving medical advice
            - Focuses on immediate comfort and practical help
            
            User's current mood: ${mood || 'not specified'}
            User says: "${userMessage}"
            
            Respond with empathy and helpful suggestions:`;

            let response;
            
            switch (provider) {
                case 'OPENAI':
                    response = await callOpenAI(systemPrompt, userMessage, apiKey);
                    break;
                case 'HUGGING_FACE':
                    response = await callHuggingFace(systemPrompt, apiKey);
                    break;
                case 'COHERE':
                    response = await callCohere(systemPrompt, userMessage, apiKey);
                    break;
                case 'GOOGLE_AI':
                    response = await callGoogleAI(systemPrompt, userMessage, apiKey);
                    break;
                default:
                    throw new Error('Unknown API provider');
            }

            return response || getFallbackResponse(mood);
            
        } catch (error) {
            console.log('AI API error, using fallback:', error);
            return getFallbackResponse(mood);
        }
    }

    async function callOpenAI(systemPrompt, userMessage, apiKey) {
        const response = await fetch(API_CONFIG.OPENAI.url, {
            method: 'POST',
            headers: {
                ...API_CONFIG.OPENAI.headers,
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: API_CONFIG.OPENAI.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userMessage }
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }

    async function callHuggingFace(systemPrompt, apiKey) {
        const response = await fetch(API_CONFIG.HUGGING_FACE.url, {
            method: 'POST',
            headers: {
                ...API_CONFIG.HUGGING_FACE.headers,
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                inputs: systemPrompt,
                parameters: {
                    max_length: 100,
                    temperature: 0.7,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.generated_text || data[0]?.generated_text || '';
    }

    async function callCohere(systemPrompt, userMessage, apiKey) {
        const response = await fetch(API_CONFIG.COHERE.url, {
            method: 'POST',
            headers: {
                ...API_CONFIG.COHERE.headers,
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'command',
                prompt: `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`,
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`Cohere API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.generations[0]?.text || '';
    }

    async function callGoogleAI(systemPrompt, userMessage, apiKey) {
        const response = await fetch(`${API_CONFIG.GOOGLE_AI.url}?key=${apiKey}`, {
            method: 'POST',
            headers: API_CONFIG.GOOGLE_AI.headers,
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\nUser: ${userMessage}`
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Google AI API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0]?.content?.parts[0]?.text || '';
    }

    function getFallbackResponse(mood) {
        const fallbacks = {
            anxiety: "I hear how anxious you're feeling—let's find some calm together. Try taking three deep breaths with me.",
            depression: "I'm sorry you're feeling low—I'm here for you. Sometimes small steps can help lift our spirits.",
            stress: "Stress can feel overwhelming. Let's break it down into smaller pieces together.",
            sleep: "Trouble sleeping is difficult. Let's work on some relaxation techniques to help you rest.",
            positive: "I love hearing your positive energy! What's been bringing you joy today?",
            neutral: "Thanks for sharing how you're feeling. I'm here to listen and support you."
        };
        
        return fallbacks[mood] || "I'm here to listen and support you. Tell me more about what's on your mind.";
    }

    // Language Data
    const languageData = {
        english: {
            initialMessages: ["How are you feeling today? 😊 Share your mood, and let’s work through it together."],
            quickReplies: [
                { text: "I’m feeling great! 😊", value: "positive" },
                { text: "I’m okay, just neutral", value: "neutral" },
                { text: "I’m feeling low 😔", value: "depression" },
                { text: "I’m anxious 😰", value: "anxiety" },
                { text: "I’m stressed 😥", value: "stress" },
                { text: "I can’t sleep 🌙", value: "sleep" },
                { text: "I need a hug 🤗", value: "need_hug" },
                { text: "Reassure me 💖", value: "reassurance" },
                { text: "Suggest mindfulness 🧘", value: "mindfulness" },
                { text: "Set a goal 🎯", value: "goalSetting" },
            ],
            crisisResponse: "I’m deeply concerned about how you’re feeling. You’re not alone—here are resources to help you right now:",
            copingStrategies: {
                anxiety: [
                    "Anxiety can feel overwhelming—let’s try a 4-7-8 breathing exercise: inhale for 4 seconds, hold for 7, exhale for 8. Ready?",
                    "Ground yourself with the 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
                    "A short walk can ease your mind. Want to step outside for 5 minutes?",
                    "Journaling can help. Try writing: 'What’s making me anxious, and what’s one thing I can control?'",
                    "Try a grounding exercise: press your feet into the floor and focus on the sensation. Shall we do it?",
                    "Let’s visualize a safe place. Imagine a calm beach or forest—what do you see?",
                ],
                depression: [
                    "I’m here for you—it’s tough to feel low. Try reaching out to a friend or loved one. Who could you connect with?",
                    "A small act of self-care, like listening to music, can help. What’s something you enjoy?",
                    "Say to yourself: ‘I am enough.’ How does that feel? Let’s talk about it.",
                    "A warm drink can be soothing. How about some herbal tea?",
                    "Try writing down one thing you’re grateful for today. Want to share it?",
                    "Let’s set a tiny goal, like making your bed. Ready to try?",
                ],
                stress: [
                    "Stress is heavy—let’s break it down. What’s the biggest source of stress right now?",
                    "Try a body scan: tense and release your shoulders, arms, and legs. Want to do it together?",
                    "Reflect on 3 small wins today, no matter how tiny. What comes to mind?",
                    "Chamomile tea can help you unwind. Shall we make some?",
                    "Let’s prioritize: what’s one thing you can tackle today?",
                    "A quick stretch can release tension. Want to try a 1-minute stretch?",
                ],
                sleep: [
                    "Let’s get you ready for rest. A short bedtime routine, like reading, can help. When do you want to sleep?",
                    "A cool room (16-20°C) is ideal for sleep. Can we make your space cozy?",
                    "Avoided caffeine this evening? It can keep you awake. Let’s check.",
                    "Calming sounds like rain can help. Want a track recommendation?",
                    "Try a progressive muscle relaxation: tense and relax each muscle group. Ready?",
                    "Let’s avoid screens 30 minutes before bed. Can we start now?",
                ],
                relationships: [
                    "Relationships can be tricky—I’m here to help. Try active listening: repeat back what they say. Want to practice?",
                    "Express feelings clearly: ‘I feel… when… because…’ Shall we try it?",
                    "Quality time, like a shared meal, can help. Can we plan something small?",
                    "What’s troubling you? Let’s approach it calmly together.",
                    "Try writing a letter to express your feelings (you don’t have to send it). Want to start?",
                    "Let’s role-play a conversation to practice communication. Ready?",
                ],
                mindfulness: [
                    "Let’s do a 1-minute mindfulness exercise: focus on your breath, noticing each inhale and exhale. Ready?",
                    "Visualize a peaceful place, like a forest or beach. What do you see?",
                    "Try a body scan: notice tension in your body and let it go. Shall we start?",
                    "Repeat this mantra: ‘I am present.’ How does it feel?",
                    "Focus on one sense: what’s one thing you hear right now?",
                    "Let’s try a mindful eating exercise with a small snack. Want to try?",
                ],
                positive: [
                    "That’s awesome to hear! What’s got you in such a great mood?",
                    "Your positivity is infectious! Want to share what’s sparking this joy?",
                    "Let’s celebrate this moment—how about setting a new goal?",
                    "What’s one thing you’re looking forward to today?",
                    "Try savoring this feeling: describe it in detail. Ready?",
                    "Let’s share this positivity—want to write a gratitude note?",
                ],
                neutral: [
                    "Sounds like things are steady. Want to explore what’s on your mind?",
                    "A neutral mood is a great starting point. What would make today even better?",
                    "Let’s try a quick mindfulness exercise to boost your energy. Ready?",
                    "What’s one small thing you’d like to accomplish today?",
                    "Try reflecting: what’s one thing going well right now?",
                    "Let’s set a tiny intention for the day. What’s yours?",
                ],
            },
            responses: {
                anxiety: "I hear how anxious you’re feeling—let’s find some calm together. Ready to try something?",
                depression: "I’m sorry you’re feeling low—I’m here. Let’s take a small step to lift your spirits.",
                stress: "Stress is tough, but we’ll tackle it together. What’s weighing on you?",
                sleep: "Trouble sleeping is hard—I’ll help you rest. What’s keeping you up?",
                relationships: "Relationships can be complex—let’s sort it out. What’s happening?",
                need_hug: "Here’s a big virtual hug! 🤗 Want to share more?",
                reassurance: "You’re stronger than you know—everything will be okay. Want to talk more?",
                coping: "Let’s try some practical strategies to help you feel better. Sound good?",
                thanks: "You’re welcome! I’m always here to help. What’s next?",
                thanksFollowUp: "Glad I could help! Want to try another strategy or just chat?",
                positive: "Love hearing your positive vibe! What’s making you feel so great?",
                neutral: "Thanks for sharing—sounds like a calm moment. What’s on your mind?",
                generic: [
                    "Thanks for sharing—I’m listening. How can I support you today?",
                    "I’m here for you. What’s on your mind right now?",
                    "Let’s focus on what matters most to you. What would help?",
                    "That sounds like a lot. How can we make things feel lighter?",
                    "I’m all ears—tell me what’s going on.",
                    "Let’s explore how you’re feeling. What’s up?",
                ],
                positiveSentiment: [
                    "Your positivity is amazing! What’s sparking this joy?",
                    "Love hearing your good vibes! What’s making you smile?",
                    "You’re radiating happiness—want to share the secret?",
                ],
                negativeSentiment: {
                    mild: "I can tell things are a bit tough. Want to share more?",
                    severe: "I’m really worried about you—it’s hard to feel this way. Let’s find support together.",
                },
                followUp: {
                    anxiety: "Did that help calm things a bit? Want to try something else?",
                    depression: "How are you feeling now? Shall we try another step?",
                    stress: "Is the stress easing? Let’s explore another idea if needed.",
                    sleep: "Feeling sleepier? Want to try another relaxation technique?",
                    relationships: "Did that help? Want to dive deeper into this?",
                    need_hug: "Did the hug help? More support if you need it!",
                    reassurance: "Feeling steadier? I’m here for more reassurance.",
                    positive: "Still feeling great? Let’s keep that energy going!",
                    neutral: "How’s it going now? Want to boost your mood?",
                    generic: "How’s it going now? Want to talk more or try something new?",
                },
                proactive: {
                    anxiety: "I’ve noticed anxiety has been tough lately. Want to try a new calming technique?",
                    depression: "You’ve been feeling low recently. Let’s find something to brighten your day.",
                    stress: "Stress has been on your mind. Shall we try a new way to relax?",
                    sleep: "Sleep’s been tricky lately. Let’s explore a new bedtime strategy.",
                    relationships: "Relationships have come up before. Want to talk about what’s going on?",
                    positive: "You’ve been in a great mood lately! Want to set a new goal?",
                    neutral: "Things have been steady—want to try something to spark joy?",
                },
                clarification: [
                    "Can you share a bit more so I can understand better?",
                    "I’m here—tell me more about what’s on your mind.",
                    "What’s weighing on you? Let’s dive deeper.",
                    "Could you explain a bit more? I’m all ears.",
                    "Let’s unpack that—tell me more about how you’re feeling.",
                ],
                journalPrompts: [
                    "What’s one thing that made you smile today?",
                    "What’s been on your mind lately? Let it all out.",
                    "Describe a moment you felt proud of yourself.",
                    "What’s one challenge you faced today, and how did you handle it?",
                    "Imagine your perfect day—what does it look like?",
                ],
                affirmations: [
                    "You are enough just as you are.",
                    "You have the strength to overcome any challenge.",
                    "Every step you take is progress.",
                    "You deserve peace and happiness.",
                    "Your feelings are valid, and you’re not alone.",
                ],
            },
        },
        hinglish: {
            initialMessages: ["Aaj aap kaisa feel kar rahe ho? 😊 Apna mood share karo, hum saath mein kaam karenge."],
            quickReplies: [
                { text: "Main bahut khush hoon! 😊", value: "positive" },
                { text: "Main theek hoon, bas neutral", value: "neutral" },
                { text: "Main sad hoon 😔", value: "depression" },
                { text: "Mujhe anxiety ho rahi hai 😰", value: "anxiety" },
                { text: "Mujhe stress hai 😥", value: "stress" },
                { text: "Neend nahi aa rahi 🌙", value: "sleep" },
                { text: "Mujhe jhappi chahiye 🤗", value: "need_hug" },
                { text: "Mujhe reassurance do 💖", value: "reassurance" },
                { text: "Mindfulness suggest karo 🧘", value: "mindfulness" },
                { text: "Mere liye goal set karo 🎯", value: "goalSetting" },
            ],
            crisisResponse: "Mujhe tension ho rahi hai ki aap aise feel kar rahe ho. Aap akela nahi ho—yahan kuch resources hai jo abhi help kar sakte hai:",
            copingStrategies: {
                anxiety: [
                    "Anxiety bahut heavy ho sakti hai—4-7-8 breathing try karo: 4 sec saans lo, 7 tak hold karo, 8 mein chhodo. Ready?",
                    "5-4-3-2-1 technique: 5 cheezein dekho, 4 chhuo, 3 suno, 2 smell karo, 1 taste karo. Shuru karein?",
                    "Thodi walk karo, mind calm hoga. 5 min bahar chalein?",
                    "Anxiety likhne se relief milti hai. ‘Mujhe kya tension hai, aur main kya control kar sakta hoon?’ likho?",
                    "Apne pair zameen pe dabao aur feel karo. Saath mein karein?",
                    "Ek safe jagah imagine karo—samundar ya jungle. Kya dikhta hai?",
                ],
                depression: [
                    "Sad feel karna tough hai—main saath hoon. Kisi dost se baat karo? Kisse connect karna chahte ho?",
                    "Chhoti si self-care, jaise gaana sunna, help karta hai. Tumhe kya pasand hai?",
                    "Bolo: ‘Main kaafi hoon.’ Kaisa laga? Ispe baat karo?",
                    "Garam chai sukoon deti hai. Herbal chai banayein?",
                    "Aaj ek chhoti si cheez likho jiske liye grateful ho. Share karo?",
                    "Ek chhota goal set karein, jaise bed banana. Try karo?",
                ],
                stress: [
                    "Stress bahut bhaari hai—ise break down karte hain. Abhi sabse bada stress kya hai?",
                    "Body scan karo: shoulders, arms, aur legs ko tense karke chhodo. Saath mein karein?",
                    "Aaj ke 3 chhote wins socho, kitne bhi small. Kya yaad aata hai?",
                    "Chamomile chai relief de sakti hai. Banayein?",
                    "Ek cheez prioritize karein jo aaj kar sakte ho. Kya hai woh?",
                    "1-minute stretch karo, tension release hogi. Try karein?",
                ],
                sleep: [
                    "Raat ke liye ready ho jao—reading jaise routine help karta hai. Kab sona hai?",
                    "16-20°C ka cool room perfect hai. Room cozy bana sakte hain?",
                    "Evening mein caffeine avoid kiya? Woh jaag sakta hai. Check karo.",
                    "Barish jaisi calming sounds help karti hai. Track suggest karun?",
                    "Muscle relaxation try karo: har muscle ko tense aur relax karo. Ready?",
                    "30 min pehle screen band karo. Ab shuru karein?",
                ],
                relationships: [
                    "Relationships thodi complicated ho sakti hai—main help karunga. Unki baat repeat karo. Practice karein?",
                    "Feelings clearly bolo: ‘Mujhe aisa lagta hai jab… because…’ Try karein?",
                    "Saath mein time, jaise khana, help karta hai. Kuch chhota plan karein?",
                    "Kya pareshan kar raha hai? Shanti se solve karein.",
                    "Ek letter likho apne feelings ke liye (bhejne ki zarurat nahi). Shuru karein?",
                    "Conversation practice karein role-play se. Ready?",
                ],
                mindfulness: [
                    "1 minute mindfulness: saans pe focus karo, har saans count karo. Ready?",
                    "Shanti wali jagah socho, like jungle ya beach. Kya dikhta hai?",
                    "Body scan karo: body mein tension dekho aur chhodo. Shuru karein?",
                    "Mantra bolo: ‘Main abhi yahan hoon.’ Kaisa lagta hai?",
                    "Ek sense pe focus karo: abhi kya sun rahe ho?",
                    "Chhote snack ke saath mindful eating try karo. Shuru karein?",
                ],
                positive: [
                    "Wah, yeh toh awesome hai! Kis cheez ne mood itna acha kiya?",
                    "Tumhari positivity mast hai! Is khushi ka raaz kya hai?",
                    "Is moment ko celebrate karein—naya goal set karein?",
                    "Aaj kya cheez excite kar rahi hai?",
                    "Is feeling ko detail mein describe karo. Ready?",
                    "Yeh positivity share karein—gratitude note likhein?",
                ],
                neutral: [
                    "Sab steady lag raha hai. Kya dimag mein chal raha hai?",
                    "Neutral mood achha starting point hai. Aaj kya behtar kar sakta hai?",
                    "Ek quick mindfulness exercise karein energy boost ke liye. Ready?",
                    "Aaj ek chhoti si cheez kya accomplish karna chahte ho?",
                    "Socho: abhi kya cheez achhi chal rahi hai?",
                    "Aaj ka ek chhota intention set karein. Kya hai?",
                ],
            },
            responses: {
                anxiety: "Sun raha hoon, anxiety feel ho rahi hai—calm pane ke liye kuch karein. Shuru karein?",
                depression: "Sad hona tough hai—main saath hoon. Mood thoda lift karein, ek chhota step le kya?",
                stress: "Stress heavy hai, par hum saath mein tackle karenge. Kya baat karna chahte ho?",
                sleep: "Neend nahi aana tough hai—main help karunga. Kya jag raha hai?",
                relationships: "Relationships thodi si ulajh sakti hai—sort karte hain. Kya hua?",
                need_hug: "Yeh lo ek badi si virtual jhappi! 🤗 Aur kya share karna hai?",
                reassurance: "Tum soch se bhi zyada strong ho—sab thik hoga. Aur baat karein?",
                coping: "Kuch practical cheezein try karein jo better feel ho. Theek hai?",
                thanks: "Welcome! Main hamesha yahan hoon. Agla kya?",
                thanksFollowUp: "Khushi hai ki help hui. Aur koi strategy ya just baat?",
                positive: "Tumhara positive vibe sunke maza aaya! Kya khush kar raha hai?",
                neutral: "Share karne ke liye thanks—calm moment hai. Kya soch rahe ho?",
                generic: [
                    "Share karne ke liye thanks—main sun raha hoon. Aaj kaise help karun?",
                    "Main tumhaare liye hoon. Abhi kya soch rahe ho?",
                    "Jo important hai uspe focus karein. Kya help karega?",
                    "Yeh bahut lagta hai. Kaise lighten karein?",
                    "Main sun raha hoon—kya chal raha hai?",
                    "Apni feelings explore karein. Kya hai?",
                ],
                positiveSentiment: [
                    "Tumhari energy mast hai! Is khushi ka secret kya hai?",
                    "Positive vibe sunke achha laga! Kya smile la raha hai?",
                    "Tum positivity radiate kar rahe ho—raaz kya hai?",
                ],
                negativeSentiment: {
                    mild: "Lagta hai thodi si problem hai. Aur batao?",
                    severe: "Mujhe tumhari chinta hai—aisa feel karna tough hai. Saath mein help dhundhein?",
                },
                followUp: {
                    anxiety: "Kya thodi si shanti mili? Aur kuch try karein?",
                    depression: "Ab kaisa lag raha hai? Ek aur step lein?",
                    stress: "Stress kam hua? Aur koi idea try karein?",
                    sleep: "Neend aa rahi hai? Aur koi technique try karein?",
                    relationships: "Kya yeh help kiya? Aur deep baat karein?",
                    need_hug: "Jhappi se help hui? Aur support chahiye?",
                    reassurance: "Thoda steady feel ho raha hai? Aur reassurance doon?",
                    positive: "Abhi bhi khush ho? Is energy ko continue rakhein!",
                    neutral: "Ab kaisa hai? Mood boost karein?",
                    generic: "Ab kaisa chal raha hai? Aur baat karein ya kuch naya try karein?",
                },
                proactive: {
                    anxiety: "Dekha anxiety thodi tough thi lately. Nayi calming technique try karein?",
                    depression: "Tum thodi low feel kar rahe the. Kuch mood brighten karne ka try karein?",
                    stress: "Stress lately dimag mein hai. Naya relax ka tarika try karein?",
                    sleep: "Neend thodi problem de rahi thi. Nayi bedtime strategy try karein?",
                    relationships: "Relationships pe pehle baat hui thi. Kya chal raha hai, baat karein?",
                    positive: "Tum lately khush the! Naya goal set karein?",
                    neutral: "Sab steady chal raha hai—kuch joy spark karne ka try karein?",
                },
                clarification: [
                    "Thoda aur batao taaki better samjhu?",
                    "Main yahan hoon—aur kya dimag mein hai?",
                    "Kya pareshan kar raha hai? Thoda deep dive karein.",
                    "Zara aur explain karo? Main sun raha hoon.",
                    "Is feeling ko unpack karein—aur kya hai?",
                ],
                journalPrompts: [
                    "Aaj kya cheez ne tumhe smile karaya?",
                    "Dimag mein kya chal raha hai? Sab likh do.",
                    "Ek moment jisme tumhe proud feel hua, batao.",
                    "Aaj kya challenge aaya, aur usse kaise handle kiya?",
                    "Apna perfect day imagine karo—kaisa hoga?",
                ],
                affirmations: [
                    "Tum waisa hi perfect ho jaisa ho.",
                    "Tum mein har challenge face karne ki taakat hai.",
                    "Har kadam progress hai.",
                    "Tum sukoon aur khushi ke haqdaar ho.",
                    "Tumhari feelings valid hai, aur tum akela nahi ho.",
                ],
            },
        },
        tanglish: {
            initialMessages: ["Innaikku neenga eppadi feel pannureenga? 😊 Ungaloda mood share pannunga, saerndhu work pannalaam."],
            quickReplies: [
                { text: "Naan super a irukken! 😊", value: "positive" },
                { text: "Naan okay, just neutral", value: "neutral" },
                { text: "Naan sad a irukken 😔", value: "depression" },
                { text: "Enakku anxiety irukku 😰", value: "anxiety" },
                { text: "Enakku stress irukku 😥", value: "stress" },
                { text: "Thookam varala 🌙", value: "sleep" },
                { text: "Enakku hug venum 🤗", value: "need_hug" },
                { text: "Enakku reassurance kodu 💖", value: "reassurance" },
                { text: "Mindfulness suggest pannu 🧘", value: "mindfulness" },
                { text: "Enakku goal set pannu 🎯", value: "goalSetting" },
            ],
            crisisResponse: "Neenga ippadi feel pannuradhu pathu naan worry a irukken. Neenga thaniya illa—indha resources ippo help pannum:",
            copingStrategies: {
                anxiety: [
                    "Anxiety romba heavy a irukkum—4-7-8 breathing try pannu: 4 sec breathe in, 7 sec hold, 8 sec release. Ready?",
                    "5-4-3-2-1 technique: 5 things paaru, 4 touch pannu, 3 kelu, 2 smell pannu, 1 taste pannu. Start pannalaam?",
                    "Konjam walk pannu, mind calm aagum. 5 mins veliya polama?",
                    "Anxiety write pannina relief kidaikkum. ‘Enna worry pannudhu, naan enna control pannalam?’ ezhudhu?",
                    "Kaala ground la press pannu, feel pannu. Saerndhu pannalaam?",
                    "Safe place imagine pannu—kadala illa kaadu. Enna paakudhu?",
                ],
                depression: [
                    "Sad a irukradhu tough—naan irukken. Friend or family kooda pesu? Yaara connect pannalaam?",
                    "Chinna self-care, like paatu kekuradhu, help pannum. Unakku enna pidikkum?",
                    "Sollu: ‘Naan podhum.’ Eppadi irukku? Adhu pathi pesalaam?",
                    "Hot tea comfort pannum. Herbal tea pannalaam?",
                    "Innaikku oru thing ezhudhu neenga grateful a irukuradhu. Share pannureengala?",
                    "Chinna goal set pannalaam, like bed pannuradhu. Try pannalaam?",
                ],
                stress: [
                    "Stress romba heavy—adha break pannalaam. Ippo biggest stress enna?",
                    "Body scan pannu: shoulders, arms, legs tense pannitu release pannu. Saerndhu pannalaam?",
                    "Innaikku 3 small wins yosichu paaru, evlo small a irundhaalum. Enna nyabagam varudhu?",
                    "Chamomile tea relax pannum. Pannalaam?",
                    "Oru thing prioritize pannu innaikku pannalaam. Adhu enna?",
                    "1-minute stretch pannu, tension release aagum. Try pannalaam?",
                ],
                sleep: [
                    "Raatri relax pannuradhu ku ready aagalaam. Reading madhiri routine help pannum. Eppo thoonganum?",
                    "16-20°C cool room perfect for sleep. Room cozy pannalaam?",
                    "Evening caffeine avoid panniya? Adhu thoongama pannum. Check pannu.",
                    "Rain madhiri calming sounds help pannum. Track suggest pannava?",
                    "Muscle relaxation try pannu: each muscle tense pannitu relax pannu. Ready?",
                    "30 mins before screen off pannu. Ippo start pannalaam?",
                ],
                relationships: [
                    "Relationships konjam complicated a irukkum—naan help pannuren. Avanoda words repeat pannu. Practice pannalaam?",
                    "Feelings clearly sollu: ‘Enakku… feel pannuren eppadi… kaaranam…’ Try pannalaam?",
                    "Saerndhu time spend pannu, like saapadu. Chinna plan pannalaam?",
                    "Enna disturb pannudhu? Calm a solve pannalaam.",
                    "Feelings ezhudhura letter ezhudhu (send pannavendaam). Start pannalaam?",
                    "Role-play pannu conversation practice pannalaam. Ready?",
                ],
                mindfulness: [
                    "1 minute mindfulness exercise: breathing focus pannu, each breath count pannu. Ready?",
                    "Calm place imagine pannu, like kaadu or beach. Enna paakudhu?",
                    "Body scan pannu: body la tension paathu release pannu. Start pannalaam?",
                    "Mantra sollu: ‘Naan ippo irukken.’ Eppadi irukku?",
                    "Oru sense focus pannu: ippo enna kekudhu?",
                    "Chinna snack oda mindful eating try pannu. Start pannalaam?",
                ],
                positive: [
                    "Super da! Enna pannudhu indha awesome mood?",
                    "Ungaloda positivity semma! Indha joy oda secret enna?",
                    "Indha moment celebrate pannalaam—new goal set pannalaam?",
                    "Innaikku enna excite pannudhu?",
                    "Indha feeling detail a describe pannu. Ready?",
                    "Indha positivity share pannalaam—gratitude note ezhudhalaam?",
                ],
                neutral: [
                    "Ellam steady a irukku. Mind la enna irukku?",
                    "Neutral mood nalla start. Innaikku enna better pannalam?",
                    "Quick mindfulness pannalaam energy boost pannuradhu ku. Ready?",
                    "Innaikku oru chinna vishayam enna pannanumnu irukku?",
                    "Yosichu paaru: ippo enna nalla pogudhu?",
                    "Innaikku oru chinna intention set pannalaam. Enna adhu?",
                ],
            },
            responses: {
                anxiety: "Anxiety pathu kekuren—calm pannuradhu ku saerndhu pannalaam. Start pannalaam?",
                depression: "Sad a irukradhu tough—naan irukken. Mood konjam lift pannalaam, small step edukkalaam?",
                stress: "Stress heavy, but saerndhu tackle pannalaam. Enna pathi pesalaam?",
                sleep: "Thookam varala tough—naan help pannuren. Enna thoongama pannudhu?",
                relationships: "Relationships konjam complex—sort pannalaam. Enna nadandhadhu?",
                need_hug: "Idho oru periya virtual hug! 🤗 Innum share pannanuma?",
                reassurance: "Neenga ninaikkura vida strong—ellam okay aagum. Innum pesalaam?",
                coping: "Practical strategies try pannalaam, better feel pannum. Okay va?",
                thanks: "Welcome! Naan eppavum help ku irukken. Next enna?",
                thanksFollowUp: "Help pannadhu santhosham! Innum strategy try pannanuma illa pesanuma?",
                positive: "Ungaloda positive vibe kekka super! Enna happy pannudhu?",
                neutral: "Share pannadhu ku thanks—calm moment. Enna yosikkura?",
                generic: [
                    "Share pannadhu ku thanks—naan kekuren. Innaikku eppadi help pannuren?",
                    "Naan ungalukku irukken. Ippo enna yosikkura?",
                    "Important aana vishayathula focus pannalaam. Enna help pannum?",
                    "Idhu too much madhiri irukku. Eppadi lighten pannalaam?",
                    "Naan kekuren—enna nadakkudhu?",
                    "Feelings explore pannalaam. Enna irukku?",
                ],
                positiveSentiment: [
                    "Ungaloda energy semma! Indha joy oda secret enna?",
                    "Good vibes kekka nalla irukku! Enna smile pannudhu?",
                    "Positivity radiate pannureenga—rahasiyam enna?",
                ],
                negativeSentiment: {
                    mild: "Konjam tough a irukku madhiri irukku. Innum sollu?",
                    severe: "Naan ungala pathi worry pannuren—ippadi feel pannuradhu tough. Saerndhu help paakkalaam?",
                },
                followUp: {
                    anxiety: "Konjam calm aacha? Innum edha try pannalaam?",
                    depression: "Ippo eppadi irukku? Innoru step try pannalaam?",
                    stress: "Stress konjam reduce aacha? Vera idea try pannalaam?",
                    sleep: "Thookam varudha? Innoru technique try pannalaam?",
                    emotions: "Idhu help pannucha? Innum deep a pesalaam?",
                    need_hug: "Hug help pannucha? Innum support venuma?",
                    reassurance: "Steady a feel pannura? Innum reassurance venuma?",
                    positive: "Innum happy ya irukkeenga? Indha energy continue pannalaam!",
                    neutral: "Ippo eppadi irukku? Mood boost pannalaam?",
                    generic: "Ippo eppadi pogudhu? Innum pesanuma illa new try pannanuma?",
                },
                proactive: {
                    anxiety: "Anxiety konjam tough a irundhadhu recent a. New calming technique try pannalaam?",
                    depression: "Neenga konjam low a feel pannitu irundheenga. Mood brighten pannuradhu ku try pannalaam?",
                    stress: "Stress konjam dimag la irukku. New relax method try pannalaam?",
                    sleep: "Thookam konjam issue pannitu irukku. New bedtime strategy try pannalaam?",
                    relationships: "Relationships pathi already pesi irukkom. Enna nadakkudhu, pesalaam?",
                    positive: "Neenga recently happy a irundheenga! New goal set pannalaam?",
                    neutral: "Ellam steady a pogudhu—konjam joy spark pannalaam?",
                },
                clarification: [
                    "Konjam more sollu, naan better understand pannuren?",
                    "Naan irukken—innum enna mind la irukku?",
                    "Enna disturb pannudhu? Deep a pogalaam.",
                    "Innum konjam explain pannu? Naan kekuren.",
                    "Indha feeling unpack pannalaam—innum enna irukku?",
                ],
                journalPrompts: [
                    "Innaikku enna pannudhu ungalukku smile?",
                    "Mind la enna irukku? Ellam ezhudhu.",
                    "Oru moment sollunga neenga proud a feel pannadhu.",
                    "Innaikku enna challenge vandhadhu, adha eppadi handle pannineenga?",
                    "Perfect day imagine pannunga—eppadi irukkum?",
                ],
                affirmations: [
                    "Neenga irukkura madhiri perfect.",
                    "Ella challenge um face pannura strength ungalukku irukku.",
                    "Ella step um progress dhaan.",
                    "Sukham um santhosham um neenga deserve pannureenga.",
                    "Ungaloda feelings valid, neenga thaniya illa.",
                ],
            },
        },
    };

    // Utility Functions
    const sanitizeInput = (input) => {
        const div = document.createElement("div");
        div.textContent = input;
        return div.innerHTML;
    };

    const getCurrentTime = () => {
        return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const smoothScrollChat = () => {
        elements.chatContainer.scrollTo({
            top: elements.chatContainer.scrollHeight,
            behavior: "smooth",
        });
    };

    const updateStreak = () => {
        const today = new Date().toDateString();
        const lastActive = localStorage.getItem("lastActive");
        if (lastActive !== today) {
            state.streakCount++;
            localStorage.setItem("streakCount", state.streakCount);
            localStorage.setItem("lastActive", today);
            checkAchievements();
        }
    };

    const checkAchievements = () => {
        const achievements = [
            { id: "streak_7", name: "7-Day Streak", condition: state.streakCount >= 7 },
            { id: "feedback_10", name: "Feedback Star", condition: state.achievements.filter(a => a.includes("feedback")).length >= 10 },
            { id: "journal_5", name: "Journal Keeper", condition: Object.keys(state.journalEntries[state.currentUser] || {}).length >= 5 },
            { id: "goals_3", name: "Goal Achiever", condition: state.goals.filter(g => g.completed).length >= 3 },
        ];
        achievements.forEach(a => {
            if (a.condition && !state.achievements.includes(a.id)) {
                state.achievements.push(a.id);
                localStorage.setItem("achievements", JSON.stringify(state.achievements));
                confetti({ particleCount: 100, spread: 70 });
                alert(`Achievement Unlocked: ${a.name}!`);
            }
        });
    };

    // UI Functions
    const toggleTheme = () => {
        state.isDarkMode = !state.isDarkMode;
        document.body.classList.toggle("dark-mode", state.isDarkMode);
        localStorage.setItem("theme", state.isDarkMode ? "dark" : "light");
        elements.themeToggle.innerHTML = `<i class='bx bx-${state.isDarkMode ? "sun" : "moon"}'></i>`;
    };

    const toggleAuthForms = (showRegister) => {
        elements.loginForm.style.display = showRegister ? "none" : "flex";
        elements.registerForm.style.display = showRegister ? "flex" : "none";
    };

    const showTab = (tabId) => {
        elements.navItems.forEach(item => item.classList.remove("active"));
        elements.tabContents.forEach(content => content.classList.remove("active"));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add("active");
        document.getElementById(`${tabId}-tab`).classList.add("active");
        if (tabId === "mood") updateMoodChart();
        if (tabId === "resources") updateResources();
        if (tabId === "emergency") updateEmergencyResources();
        if (tabId === "plan") updateActionPlan();
        if (tabId === "insights") updateInsights();
        if (tabId === "meditation") updateMeditation();
        if (tabId === "settings") updateSettings();
        smoothScroll();
    };

    const displayMessage = (message, isUser = false) => {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message ${isUser ? "user-message" : "bot-message"}`;
        messageDiv.innerHTML = `<span>${sanitizeInput(message)}</span><span class="message-time">${getCurrentTime()}</span>`;
        elements.chatContainer.appendChild(messageDiv);
        state.conversationHistory.push({ role: isUser ? "user" : "bot", content: message });
        updateSentiment(message, isUser);
        smoothScrollChat();
    };

  const displayQuickReplies = () => {
    elements.quickRepliesContainer.innerHTML = "";
    const replies = [...languageData[state.currentLanguage].quickReplies, ...state.userPreferences.customReplies];
    replies.forEach(reply => {
        const button = document.createElement("button");
        button.className = "quick-reply";
        button.textContent = reply.text;
        button.onclick = () => handleQuickReply(reply.value);
        elements.quickRepliesContainer.appendChild(button);
    });
    state.offlineCache.replies = replies;
    localStorage.setItem("offlineCache", JSON.stringify(state.offlineCache));
};

            // Continuation of UI Functions
    const addCustomReply = () => {
        const customText = prompt("Enter a custom quick reply:");
        if (customText) {
            state.userPreferences.customReplies.push({ text: sanitizeInput(customText), value: `custom_${Date.now()}` });
            localStorage.setItem("userPreferences", JSON.stringify(state.userPreferences));
            displayQuickReplies();
        }
    };

    const updateAffirmation = () => {
        const affirmations = languageData[state.currentLanguage].responses.affirmations;
        const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];
        if (elements.affirmationDisplay) {
            elements.affirmationDisplay.textContent = randomAffirmation;
        }
    };

    const updateJournalPrompt = () => {
        const prompts = languageData[state.currentLanguage].responses.journalPrompts;
        const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
        if (elements.journalPrompt) {
            elements.journalPrompt.textContent = randomPrompt;
        }
    };

    const smoothScroll = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Chat Processing
    const handleQuickReply = async (value) => {
        const reply = [...languageData[state.currentLanguage].quickReplies, ...state.userPreferences.customReplies].find(r => r.value === value);
        if (reply) {
            displayMessage(reply.text, true);
            state.contextStack.push(value);
            await simulateBotResponse(value);
        }
    };

    const simulateBotResponse = async (input) => {
        const typingIndicator = document.createElement("div");
        typingIndicator.className = "typing-indicator";
        typingIndicator.innerHTML = "<span class='typing-dot'></span><span class='typing-dot'></span><span class='typing-dot'></span>";
        elements.chatContainer.appendChild(typingIndicator);
        smoothScrollChat();

        await new Promise(resolve => setTimeout(resolve, 1000));

        typingIndicator.remove();
        let response = "";
        const lang = languageData[state.currentLanguage];

        // Check for non-English languages and show development warning
        if (state.currentLanguage !== 'english') {
            const warningMessage = "<div class='development-warning' style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 8px; font-size: 0.9em;'>⚠️ Hinglish and Tanglish features are currently in developing phase - responses may not be accurate</div>";
            
            // Still use static responses for non-English languages
            if (state.conversationHistory.length <= 1) {
                response = await processMoodInput(input);
            } else if (input === "thanks") {
                response = warningMessage + lang.responses.thanks;
                state.lastResponseType = "thanks";
            } else if (lang.copingStrategies[input]) {
                response = warningMessage + lang.responses[input] + " " + lang.copingStrategies[input][Math.floor(Math.random() * lang.copingStrategies[input].length)];
                state.lastResponseType = input;
            } else if (state.lastResponseType && lang.responses.followUp[state.lastResponseType]) {
                response = warningMessage + lang.responses.followUp[state.lastResponseType];
                state.lastResponseType = "followUp";
            } else {
                response = warningMessage + lang.responses.generic[Math.floor(Math.random() * lang.responses.generic.length)];
                state.lastResponseType = "generic";
            }
        } else {
            // Use AI for English language
            try {
                // Determine current mood context
                let currentMood = state.lastMoodPrediction || 'neutral';
                if (lang.copingStrategies[input]) {
                    currentMood = input;
                }
                
                // Generate AI response
                response = await generateAIResponse(input, currentMood);
                state.lastResponseType = "ai_generated";
                
                // Add appropriate action buttons based on mood
                if (currentMood !== 'neutral' && currentMood !== 'positive') {
                    response += "<div class='ai-suggestions' style='margin-top: 10px; padding: 8px; background: #f8f9fa; border-radius: 6px; font-size: 0.9em;'>💡 Try: Deep breathing, gentle walking, or journaling</div>";
                }
                
            } catch (error) {
                console.log('AI response failed, using fallback');
                // Fallback to static responses if AI fails
                if (state.conversationHistory.length <= 1) {
                    response = await processMoodInput(input);
                } else if (input === "thanks") {
                    response = lang.responses.thanks;
                    state.lastResponseType = "thanks";
                } else if (lang.copingStrategies[input]) {
                    response = lang.responses[input] + " " + lang.copingStrategies[input][Math.floor(Math.random() * lang.copingStrategies[input].length)];
                    state.lastResponseType = input;
                } else if (state.lastResponseType && lang.responses.followUp[state.lastResponseType]) {
                    response = lang.responses.followUp[state.lastResponseType];
                    state.lastResponseType = "followUp";
                } else {
                    response = lang.responses.generic[Math.floor(Math.random() * lang.responses.generic.length)];
                    state.lastResponseType = "generic";
                }
            }
        }

        // Crisis detection still applies to all languages
        if (checkCrisis(input)) {
            response = lang.crisisResponse + "<div class='resources-card'>Immediate Help: Call 112 or visit <a href='https://www.crisistextline.org'>Crisis Text Line</a></div>";
        }

        displayMessage(response);
        displayQuickReplies();
        predictMood();
        updateStreak();
    };

    const processMoodInput = async (input) => {
        const lang = languageData[state.currentLanguage];
        const lowerInput = input.toLowerCase();
        let mood = "neutral";
        let response = "";

        // Determine mood from input
        if (lowerInput.includes("great") || lowerInput.includes("happy") || lowerInput.includes("😊")) {
            mood = "positive";
        } else if (lowerInput.includes("okay") || lowerInput.includes("fine")) {
            mood = "neutral";
        } else if (lowerInput.includes("sad") || lowerInput.includes("low") || lowerInput.includes("😔")) {
            mood = "depression";
        } else if (lowerInput.includes("anxious") || lowerInput.includes("nervous") || lowerInput.includes("😰")) {
            mood = "anxiety";
        } else if (lowerInput.includes("stressed") || lowerInput.includes("😥")) {
            mood = "stress";
        }

        state.lastMoodPrediction = mood;

        // Use AI for English, static responses for others
        if (state.currentLanguage === 'english') {
            try {
                response = await generateAIResponse(input, mood);
            } catch (error) {
                console.log('AI failed for mood input, using fallback');
                // Fallback to static responses
                if (mood === "positive") {
                    response = lang.responses.positive + " " + lang.copingStrategies.positive[Math.floor(Math.random() * lang.copingStrategies.positive.length)];
                } else if (mood === "neutral") {
                    response = lang.responses.neutral + " " + lang.copingStrategies.neutral[Math.floor(Math.random() * lang.copingStrategies.neutral.length)];
                } else if (mood === "depression") {
                    response = lang.responses.depression + " " + lang.copingStrategies.depression[Math.floor(Math.random() * lang.copingStrategies.depression.length)];
                } else if (mood === "anxiety") {
                    response = lang.responses.anxiety + " " + lang.copingStrategies.anxiety[Math.floor(Math.random() * lang.copingStrategies.anxiety.length)];
                } else if (mood === "stress") {
                    response = lang.responses.stress + " " + lang.copingStrategies.stress[Math.floor(Math.random() * lang.copingStrategies.stress.length)];
                } else {
                    response = lang.responses.clarification[Math.floor(Math.random() * lang.responses.clarification.length)];
                }
            }
        } else {
            // Static responses for non-English languages
            const warningMessage = "<div class='development-warning' style='background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; margin: 5px 0; border-radius: 8px; font-size: 0.9em;'>⚠️ Hinglish and Tanglish features are currently in developing phase - responses may not be accurate</div>";
            
            if (mood === "positive") {
                response = warningMessage + lang.responses.positive + " " + lang.copingStrategies.positive[Math.floor(Math.random() * lang.copingStrategies.positive.length)];
            } else if (mood === "neutral") {
                response = warningMessage + lang.responses.neutral + " " + lang.copingStrategies.neutral[Math.floor(Math.random() * lang.copingStrategies.neutral.length)];
            } else if (mood === "depression") {
                response = warningMessage + lang.responses.depression + " " + lang.copingStrategies.depression[Math.floor(Math.random() * lang.copingStrategies.depression.length)];
            } else if (mood === "anxiety") {
                response = warningMessage + lang.responses.anxiety + " " + lang.copingStrategies.anxiety[Math.floor(Math.random() * lang.copingStrategies.anxiety.length)];
            } else if (mood === "stress") {
                response = warningMessage + lang.responses.stress + " " + lang.copingStrategies.stress[Math.floor(Math.random() * lang.copingStrategies.stress.length)];
            } else {
                response = warningMessage + lang.responses.clarification[Math.floor(Math.random() * lang.responses.clarification.length)];
            }
        }

        return response;
    };

    const checkCrisis = (input) => {
        const crisisKeywords = ["suicide", "harm", "kill", "crisis", "emergency", "hurt myself"];
        return crisisKeywords.some(keyword => input.toLowerCase().includes(keyword)) && Math.random() * 100 < state.crisisSensitivity;
    };

    const handleUserInput = async () => {
        const input = elements.userInput.value.trim();
        if (!input) return;
        displayMessage(input, true);
        elements.userInput.value = "";
        state.contextStack.push(input);
        await simulateBotResponse(input);
    };

    // Voice Processing
    const initVoiceRecognition = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = state.currentLanguage === "english" ? "en-US" : state.currentLanguage === "hinglish" ? "hi-IN" : "ta-IN";
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => {
            state.isVoiceActive = true;
            elements.voiceBtn.classList.add("active");
            elements.userInput.placeholder = "Listening...";
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            elements.userInput.value = transcript;
            handleUserInput();
            if (transcript.toLowerCase().includes("open")) {
                const tab = transcript.toLowerCase().match(/open (\w+)/);
                if (tab && tab[1]) showTab(tab[1]);
            }
        };

        recognition.onend = () => {
            state.isVoiceActive = false;
            elements.voiceBtn.classList.remove("active");
            elements.userInput.placeholder = "Type or speak your message...";
        };

        elements.voiceBtn.onclick = () => {
            if (state.isVoiceActive) recognition.stop();
            else recognition.start();
        };
    };

    const speakResponse = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = state.currentLanguage === "english" ? "en-US" : state.currentLanguage === "hinglish" ? "hi-IN" : "ta-IN";
        window.speechSynthesis.speak(utterance);
    };

    // Mood Tracking
    const updateMoodChart = () => {
        const userMoodData = state.moodData[state.currentUser] || [];
        const labels = userMoodData.map((_, i) => `Day ${i + 1}`);
        const data = userMoodData.map(mood => ["terrible", "poor", "neutral", "good", "excellent"].indexOf(mood) + 1);

        if (state.moodChart) state.moodChart.destroy();
        state.moodChart = new Chart(elements.moodChartCanvas, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Mood Trend",
                    data,
                    borderColor: "rgba(162, 155, 254, 1)",
                    backgroundColor: "rgba(162, 155, 254, 0.2)",
                    fill: true,
                }],
            },
            options: {
                responsive: true,
                scales: {
                    y: { min: 0, max: 5, ticks: { stepSize: 1, callback: v => ["", "Terrible", "Poor", "Neutral", "Good", "Excellent"][v] } },
                },
            },
        });
    };

    const handleMoodSelection = (mood) => {
        if (!state.currentUser) return;
        if (!state.moodData[state.currentUser]) state.moodData[state.currentUser] = [];
        state.moodData[state.currentUser].push(mood);
        localStorage.setItem("moodData", JSON.stringify(state.moodData));
        updateMoodChart();
        elements.moodButtons.forEach(btn => btn.classList.remove("selected"));
        document.querySelector(`[data-tab="${mood}"]`)?.classList.add("selected");
    };

    // Sentiment Analysis
    const updateSentiment = (message, isUser) => {
        if (!isUser) return;
        const lowerMessage = message.toLowerCase();
        let sentiment = "neutral";
        if (lowerMessage.includes("happy") || lowerMessage.includes("great") || lowerMessage.includes("😊")) {
            sentiment = "positive";
        } else if (lowerMessage.includes("sad") || lowerMessage.includes("low") || lowerMessage.includes("anxious") || lowerMessage.includes("😔") || lowerMessage.includes("😰")) {
            sentiment = "negative";
        }
        state.sentimentHistory.push(sentiment);
        elements.sentimentStatus.textContent = sentiment.charAt(0).toUpperCase() + sentiment.slice(1);
        if (sentiment === "negative" && state.sentimentHistory.slice(-3).every(s => s === "negative")) {
            displayMessage(languageData[state.currentLanguage].responses.negativeSentiment.severe);
        }
    };

    // Resource Management
    const updateResources = () => {
        const resources = [
            { name: "Crisis Text Line", url: "https://www.crisistextline.org", icon: "bx bx-chat" },
            { name: "Mental Health America", url: "https://www.mhanational.org", icon: "bx bx-heart" },
            { name: "NAMI Helpline", url: "https://www.nami.org/help", icon: "bx bx-phone" },
        ];
        elements.resourcesGrid.innerHTML = resources.map(r => `
            <div class="card">
                <div class="card-header"><i class="${r.icon}"></i>${r.name}</div>
                <div class="card-body"><a href="${r.url}" target="_blank">${r.url}</a></div>
            </div>
        `).join("");
        state.offlineCache.resources = resources;
        localStorage.setItem("offlineCache", JSON.stringify(state.offlineCache));
    };

    const updateEmergencyResources = () => {
        const emergencyResources = [
            { name: "Emergency Services", url: "tel:112", icon: "bx bx-phone" },
            { name: "Suicide Prevention Lifeline", url: "tel:988", icon: "bx bx-shield" },
            { name: "Crisis Text Line", url: "sms:741741", icon: "bx bx-message" },
        ];
        elements.emergencyResources.innerHTML = emergencyResources.map(r => `
            <div class="card">
                <div class="card-header"><i class="${r.icon}"></i>${r.name}</div>
                <div class="card-body"><a href="${r.url}">${r.url}</a></div>
            </div>
        `).join("");
    };

    // Action Plan
    const updateActionPlan = () => {
        const actions = state.goals.filter(g => !g.completed).slice(0, 5);
        if (actions.length === 0) {
            actions.push({ text: "Practice deep breathing for 5 minutes daily", completed: false });
            actions.push({ text: "Write down 3 things you’re grateful for", completed: false });
        }
        elements.actionPlan.innerHTML = actions.map(a => `
            <div class="action-item">
                <div class="action-check ${a.completed ? "checked" : ""}" data-action="${a.text}">${a.completed ? "<i class='bx bx-check'></i>" : ""}</div>
                <span>${a.text}</span>
            </div>
        `).join("");
        document.querySelectorAll(".action-check").forEach(check => {
            check.onclick = () => toggleAction(check.dataset.action);
        });
    };

    const toggleAction = (actionText) => {
        const goal = state.goals.find(g => g.text === actionText);
        if (goal) {
            goal.completed = !goal.completed;
            localStorage.setItem("goals", JSON.stringify(state.goals));
            updateActionPlan();
            checkAchievements();
        }
    };

    // Insights
    const updateInsights = () => {
        const insights = [
            { title: "Mood Trend", content: `Your recent mood is ${state.moodData[state.currentUser]?.slice(-1)[0] || "neutral"}.` },
            { title: "Stress Patterns", content: state.stressTriggers.length > 0 ? "Stress triggers include: " + state.stressTriggers.join(", ") : "No stress triggers logged yet." },
            { title: "Engagement", content: `You’ve interacted ${state.conversationHistory.length} times.` },
        ];
        elements.insightsGrid.innerHTML = insights.map(i => `
            <div class="card">
                <div class="card-header">${i.title}</div>
                <div class="card-body">${i.content}</div>
            </div>
        `).join("");
    };

    // Meditation
    const updateMeditation = () => {
        elements.playMeditation.onclick = startMeditation;
    };

    const startMeditation = () => {
        let timeLeft = 60;
        elements.meditationProgress.textContent = "1:00";
        const interval = setInterval(() => {
            timeLeft--;
            elements.meditationProgress.textContent = `0:${timeLeft.toString().padStart(2, "0")}`;
            if (timeLeft <= 0) {
                clearInterval(interval);
                elements.meditationProgress.textContent = "Meditation Complete!";
                speakResponse("Great job completing the meditation!");
                confetti({ particleCount: 50, spread: 50 });
            }
        }, 1000);
        speakResponse("Let’s start a 1-minute meditation. Close your eyes, breathe deeply, and focus on your breath.");
    };

    // Settings
    const updateSettings = () => {
        elements.crisisSensitivity.value = state.crisisSensitivity;
        elements.reminderFrequency.value = state.reminderFrequency;
    };

    // Journaling
    const handleJournalEntry = () => {
        const entry = elements.journalPrompt?.nextElementSibling?.value;
        if (entry && state.currentUser) {
            if (!state.journalEntries[state.currentUser]) state.journalEntries[state.currentUser] = [];
            state.journalEntries[state.currentUser].push({ date: new Date().toISOString(), text: sanitizeInput(entry) });
            localStorage.setItem("journalEntries", JSON.stringify(state.journalEntries));
            alert("Journal entry saved!");
            checkAchievements();
        }
    };

    // Gratitude Log
    const handleGratitudeLog = () => {
        const entries = [
            document.getElementById("gratitude-1")?.value,
            document.getElementById("gratitude-2")?.value,
            document.getElementById("gratitude-3")?.value,
        ].filter(e => e);
        if (entries.length > 0 && state.currentUser) {
            if (!state.gratitudeLog[state.currentUser]) state.gratitudeLog[state.currentUser] = [];
            state.gratitudeLog[state.currentUser].push({ date: new Date().toISOString(), items: entries.map(sanitizeInput) });
            localStorage.setItem("gratitudeLog", JSON.stringify(state.gratitudeLog));
            alert("Gratitude log saved!");
        }
    };

    // Sleep Tracker
    const handleSleepLog = () => {
        const hours = document.getElementById("sleep-hours")?.value;
        if (hours && state.currentUser) {
            if (!state.sleepLog[state.currentUser]) state.sleepLog[state.currentUser] = [];
            state.sleepLog[state.currentUser].push({ date: new Date().toISOString(), hours: parseFloat(hours) });
            localStorage.setItem("sleepLog", JSON.stringify(state.sleepLog));
            alert("Sleep log saved!");
            if (hours < 6) {
                displayMessage("Looks like you’re not getting enough sleep. Let’s try some sleep strategies.");
            }
        }
    };

    // Goal Setting
    const addGoal = () => {
        const goalText = prompt("Enter a new mental health goal:");
        if (goalText) {
            state.goals.push({ text: sanitizeInput(goalText), completed: false });
            localStorage.setItem("goals", JSON.stringify(state.goals));
            updateActionPlan();
        }
    };

    // Stress Heatmap
    const updateStressHeatmap = () => {
        if (!elements.stressHeatmap) return;
        const triggers = state.stressTriggers.reduce((acc, t) => {
            acc[t] = (acc[t] || 0) + 1;
            return acc;
        }, {});
        const data = Object.entries(triggers).map(([trigger, count]) => `<div>${trigger}: ${count} times</div>`).join("");
        elements.stressHeatmap.innerHTML = data || "No stress triggers logged.";
    };

    // Emotion Wheel
    const initEmotionWheel = () => {
        if (!elements.emotionWheel) return;
        const emotions = ["Happy", "Sad", "Angry", "Fearful", "Surprised", "Disgusted"];
        elements.emotionWheel.innerHTML = emotions.map(e => `<button class="mood-btn" data-emotion="${e.toLowerCase()}">${e}</button>`).join("");
        document.querySelectorAll("[data-emotion]").forEach(btn => {
            btn.onclick = () => {
                state.emotionWheelSelection = btn.dataset.emotion;
                displayMessage(`You’re feeling ${state.emotionWheelSelection}. Want to explore this?`);
            };
        });
    };

    // CBT Exercise
    const startCBTExercise = () => {
        const thought = prompt("What negative thought are you having?");
        if (thought && state.currentUser) {
            const reframed = `Instead of "${thought}", try thinking: "I’m doing my best, and that’s enough."`;
            state.cbtResponses[state.currentUser] = state.cbtResponses[state.currentUser] || [];
            state.cbtResponses[state.currentUser].push({ thought: sanitizeInput(thought), reframed: reframed });
            localStorage.setItem("cbtResponses", JSON.stringify(state.cbtResponses));
            displayMessage(reframed);
        }
    };

    // Mindfulness Game
    const startMindfulnessGame = () => {
        if (!elements.mindfulnessGame) return;
        elements.mindfulnessGame.innerHTML = `
            <p>Click the bubbles to pop them and relax!</p>
            <div id="bubbles"></div>
        `;
        const bubbles = document.getElementById("bubbles");
        for (let i = 0; i < 10; i++) {
            const bubble = document.createElement("div");
            bubble.style.width = "30px";
            bubble.style.height = "30px";
            bubble.style.background = "rgba(162, 155, 254, 0.5)";
            bubble.style.borderRadius = "50%";
            bubble.style.position = "absolute";
            bubble.style.left = `${Math.random() * 90}%`;
            bubble.style.top = `${Math.random() * 90}%`;
            bubble.onclick = () => bubble.remove();
            bubbles.appendChild(bubble);
        }
    };

    // Anxiety Timer
    const startAnxietyTimer = () => {
        let timeLeft = 300; // 5 minutes
        elements.anxietyTimer.innerHTML = "5:00";
        const interval = setInterval(() => {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            elements.anxietyTimer.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
            if (timeLeft <= 0) {
                clearInterval(interval);
                elements.anxietyTimer.textContent = "Grounding Complete!";
                speakResponse("You’ve completed the grounding exercise. You’re doing great!");
            }
        }, 1000);
        speakResponse("Let’s do a 5-minute grounding exercise. Focus on your breath and name 5 things you see.");
    };

    // Coping Strategy Library
    const updateCopingLibrary = () => {
        if (!elements.copingLibrary) return;
        const strategies = Object.entries(languageData[state.currentLanguage].copingStrategies).flatMap(([key, values]) =>
            values.map(v => `<div class="card"><div class="card-body">${v}</div></div>`)
        );
        elements.copingLibrary.innerHTML = strategies.join("");
    };

    // Mood Prediction
    const predictMood = () => {
        const recentMessages = state.conversationHistory.slice(-5).filter(m => m.role === "user").map(m => m.content.toLowerCase());
        const positiveCount = recentMessages.filter(m => m.includes("happy") || m.includes("great") || m.includes("😊")).length;
        const negativeCount = recentMessages.filter(m => m.includes("sad") || m.includes("anxious") || m.includes("stressed") || m.includes("😔") || m.includes("😰")).length;
        state.lastMoodPrediction = positiveCount > negativeCount ? "positive" : negativeCount > positiveCount ? "negative" : "neutral";
        if (state.lastMoodPrediction === "negative" && Math.random() < 0.3) {
            displayMessage(languageData[state.currentLanguage].responses.proactive[state.lastMoodPrediction]);
        }
    };

    // Export Functions
    const exportChat = () => {
        const chatText = state.conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n");
        const blob = new Blob([chatText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mindaid_chat.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportMoodReport = () => {
        const moodText = state.moodData[state.currentUser]?.map((mood, i) => `Day ${i + 1}: ${mood}`).join("\n") || "No mood data.";
        const blob = new Blob([moodText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "mindaid_mood_report.txt";
        a.click();
        URL.revokeObjectURL(url);
    };

    // Authentication
    const login = (email, password) => {
        if (state.users[email] && state.users[email].password === password) {
            state.isAuthenticated = true;
            state.currentUser = email;
            elements.authContainer.style.display = "none";
            elements.mainApp.style.display = "block";
            initializeApp();
        } else {
            alert("Invalid email or password.");
        }
    };

    const register = (email, password, confirmPassword) => {
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        if (state.users[email]) {
            alert("Email already registered.");
            return;
        }
        state.users[email] = { password };
        localStorage.setItem("users", JSON.stringify(state.users));
        login(email, password);
    };

    const logout = () => {
        state.isAuthenticated = false;
        state.currentUser = null;
        elements.mainApp.style.display = "none";
        elements.authContainer.style.display = "flex";
        toggleAuthForms(false);
    };

    // Settings
    const saveSettings = () => {
        state.crisisSensitivity = parseInt(elements.crisisSensitivity.value);
        state.reminderFrequency = elements.reminderFrequency.value;
        localStorage.setItem("crisisSensitivity", state.crisisSensitivity);
        localStorage.setItem("reminderFrequency", state.reminderFrequency);
        alert("Settings saved!");
        scheduleReminders();
    };

    const scheduleReminders = () => {
        if (state.reminderFrequency === "none") return;
        if (Notification.permission !== "granted") Notification.requestPermission();
        const interval = state.reminderFrequency === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
        setInterval(() => {
            if (Notification.permission === "granted") {
                new Notification("MindAid Reminder", { body: "Time to check in with your mood!" });
            }
        }, interval);
    };

    // Initialization
    const initializeApp = () => {
        document.body.classList.toggle("dark-mode", state.isDarkMode);
        elements.themeToggle.innerHTML = `<i class='bx bx-${state.isDarkMode ? "sun" : "moon"}'></i>`;
        elements.languageSelector.value = state.currentLanguage;
        displayMessage(languageData[state.currentLanguage].initialMessages[0]);
        displayQuickReplies();
        initVoiceRecognition();
        loadAPISettings(); // Load saved API settings
        updateMoodChart();
        updateResources();
        updateEmergencyResources();
        updateActionPlan();
        updateInsights();
        updateMeditation();
        updateSettings();
        updateAffirmation();
        updateJournalPrompt();
        initEmotionWheel();
        updateCopingLibrary();
        scheduleReminders();
        if (elements.gratitudeLog) elements.gratitudeLog.onclick = handleGratitudeLog;
        if (elements.sleepLog) elements.sleepLog.onclick = handleSleepLog;
        if (elements.journalPrompt) elements.journalPrompt.onclick = handleJournalEntry;
        if (elements.cbtExercise) elements.cbtExercise.onclick = startCBTExercise;
        if (elements.mindfulnessGame) elements.mindfulnessGame.onclick = startMindfulnessGame;
        if (elements.anxietyTimer) elements.anxietyTimer.onclick = startAnxietyTimer;
    };

    // Event Listeners
    elements.loginBtn.onclick = () => {
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        login(email, password);
    };

    elements.registerBtn.onclick = () => {
        const email = document.getElementById("register-email").value;
        const password = document.getElementById("register-password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        register(email, password, confirmPassword);
    };

    elements.toggleToRegister.onclick = () => toggleAuthForms(true);
    elements.toggleToLogin.onclick = () => toggleAuthForms(false);
    elements.logoutBtn.onclick = logout;
    elements.themeToggle.onclick = toggleTheme;
    elements.languageSelector.onchange = (e) => {
        state.currentLanguage = e.target.value;
        localStorage.setItem("language", state.currentLanguage);
        displayQuickReplies();
        updateAffirmation();
        updateJournalPrompt();
    };
    elements.sendBtn.onclick = handleUserInput;
    elements.userInput.onkeypress = (e) => { if (e.key === "Enter") handleUserInput(); };
    elements.navItems.forEach(item => item.onclick = (e) => {
        e.preventDefault();
        showTab(item.dataset.tab);
    });
    elements.moodButtons.forEach(btn => btn.onclick = () => handleMoodSelection(btn.dataset.mood));
    elements.exportChat.onclick = exportChat;
    elements.addCustomReply.onclick = addCustomReply;
    elements.exportMood.onclick = exportMoodReport;
    elements.feedbackBtn.onclick = () => {
        const feedback = elements.feedbackText.value.trim();
        if (feedback) {
            state.achievements.push(`feedback_${Date.now()}`);
            localStorage.setItem("achievements", JSON.stringify(state.achievements));
            alert("Feedback submitted!");
            checkAchievements();
            elements.feedbackText.value = "";
        }
    };
    
    // API Management Functions
    const loadAPISettings = () => {
        const savedApiKey = localStorage.getItem('mindaid_api_key');
        const savedProvider = localStorage.getItem('mindaid_api_provider') || 'OPENAI';
        
        if (savedApiKey) {
            API_CONFIG.API_KEY = savedApiKey;
            document.getElementById('api-key-input').value = savedApiKey;
        }
        
        API_CONFIG.CURRENT_PROVIDER = savedProvider;
        document.getElementById('api-provider').value = savedProvider;
    };
    
    const saveAPISettings = () => {
        const apiKey = document.getElementById('api-key-input').value.trim();
        const provider = document.getElementById('api-provider').value;
        
        if (apiKey) {
            API_CONFIG.API_KEY = apiKey;
            localStorage.setItem('mindaid_api_key', apiKey);
        }
        
        API_CONFIG.CURRENT_PROVIDER = provider;
        localStorage.setItem('mindaid_api_provider', provider);
        
        showAPIStatus('Settings saved successfully!', 'success');
    };
    
    const testAPI = async () => {
        const apiKey = document.getElementById('api-key-input').value.trim();
        const provider = document.getElementById('api-provider').value;
        
        if (!apiKey) {
            showAPIStatus('Please enter an API key first.', 'error');
            return;
        }
        
        // Temporarily update config for testing
        const originalKey = API_CONFIG.API_KEY;
        const originalProvider = API_CONFIG.CURRENT_PROVIDER;
        
        API_CONFIG.API_KEY = apiKey;
        API_CONFIG.CURRENT_PROVIDER = provider;
        
        showAPIStatus('Testing API connection...', 'info');
        
        try {
            const testResponse = await generateAIResponse('Hello, this is a test message.', 'neutral');
            if (testResponse && !testResponse.includes('I\'m here to listen')) {
                showAPIStatus('✅ API connection successful!', 'success');
            } else {
                showAPIStatus('❌ API test failed. Check your key and provider.', 'error');
            }
        } catch (error) {
            showAPIStatus(`❌ API Error: ${error.message}`, 'error');
        } finally {
            // Restore original settings if test failed
            API_CONFIG.API_KEY = originalKey;
            API_CONFIG.CURRENT_PROVIDER = originalProvider;
        }
    };
    
    const clearAPISettings = () => {
        if (confirm('Are you sure you want to clear your API settings?')) {
            API_CONFIG.API_KEY = 'YOUR_API_KEY_HERE';
            API_CONFIG.CURRENT_PROVIDER = 'OPENAI';
            localStorage.removeItem('mindaid_api_key');
            localStorage.removeItem('mindaid_api_provider');
            
            document.getElementById('api-key-input').value = '';
            document.getElementById('api-provider').value = 'OPENAI';
            
            showAPIStatus('API settings cleared.', 'info');
        }
    };
    
    const showAPIStatus = (message, type) => {
        const statusEl = document.getElementById('api-status');
        statusEl.textContent = message;
        statusEl.className = 'text-sm p-2 rounded';
        
        switch (type) {
            case 'success':
                statusEl.classList.add('bg-green-500', 'bg-opacity-20', 'text-green-300', 'border', 'border-green-500');
                break;
            case 'error':
                statusEl.classList.add('bg-red-500', 'bg-opacity-20', 'text-red-300', 'border', 'border-red-500');
                break;
            case 'info':
                statusEl.classList.add('bg-blue-500', 'bg-opacity-20', 'text-blue-300', 'border', 'border-blue-500');
                break;
        }
        
        statusEl.classList.remove('hidden');
        
        // Auto hide after 5 seconds
        setTimeout(() => {
            statusEl.classList.add('hidden');
        }, 5000);
    };
    
    // API Event Listeners
    document.getElementById('test-api')?.addEventListener('click', testAPI);
    document.getElementById('clear-api')?.addEventListener('click', clearAPISettings);
    document.getElementById('api-provider')?.addEventListener('change', saveAPISettings);
    document.getElementById('api-key-input')?.addEventListener('blur', saveAPISettings);
    
    elements.saveSettings.onclick = () => {
        saveSettings();
        saveAPISettings();
    };

    // Offline Support
    window.addEventListener("offline", () => {
        displayMessage("You are offline. Some features are limited.");
    });

    window.addEventListener("online", () => {
        displayMessage("You’re back online! All features are available.");
    });

    // Initialize
    if (state.isAuthenticated && state.currentUser) {
        elements.authContainer.style.display = "none";
        elements.mainApp.style.display = "block";
        initializeApp();
    }

    // Proactive Check-Ins
    setInterval(() => {
        if (state.conversationHistory.length > 0 && Math.random() < 0.1) {
            const lastMood = state.lastMoodPrediction || "generic";
            displayMessage(languageData[state.currentLanguage].responses.proactive[lastMood] || languageData[state.currentLanguage].responses.clarification[0]);
        }
    }, 60000);

    // Mood-Based Music Suggestions
    const suggestMusic = () => {
        const mood = state.lastMoodPrediction || "neutral";
        const playlists = {
            positive: "https://open.spotify.com/playlist/37i9dQZF1DX0s5kDXi1oC5",
            neutral: "https://open.spotify.com/playlist/37i9dQZF1DX3rxVfibe1L0",
            negative: "https://open.spotify.com/playlist/37i9dQZF1DX3YSRoSdA634",
        };
        if (mood === "positive" || mood === "neutral" || mood === "negative") {
            displayMessage(`Based on your mood, here’s a playlist to try: <a href="${playlists[mood]}" target="_blank">Listen now</a>`);
        }
    };

    // Social Connection Prompts
    const promptSocialConnection = () => {
        if (state.lastMoodPrediction === "negative" && Math.random() < 0.2) {
            displayMessage("Sometimes connecting with someone helps. Who could you reach out to today?");
        }
    };

    // Additional AI Features Implementations
    const initAdditionalFeatures = () => {
        setInterval(suggestMusic, 120000);
        setInterval(promptSocialConnection, 90000);
        setInterval(updateStressHeatmap, 300000);
        if (elements.goalList) elements.goalList.onclick = addGoal;
    };

    initAdditionalFeatures();
})();