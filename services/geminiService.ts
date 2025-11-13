import { GoogleGenAI, Chat, GenerateContentResponse, Modality, Type, FunctionDeclaration } from "@google/genai";

// This is a placeholder for the API key, which is expected to be in the environment.
const API_KEY = process.env.API_KEY;

let ai: GoogleGenAI;
const getAi = () => {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: API_KEY });
  }
  return ai;
}

// A helper to get a new AI instance, especially for Veo that needs fresh key selection
const getNewAi = () => new GoogleGenAI({ apiKey: API_KEY });

const getSystemInstruction = (modelId: string, language: string, tone: string, responseLength: string): string => {
    let lengthInstruction = '';
    switch(responseLength) {
        case 'Mini': lengthInstruction = 'Keep your responses very short, concise, and to the point (1-2 sentences max).'; break;
        case 'Standard': lengthInstruction = 'Provide balanced and moderately detailed responses (around 3-5 sentences).'; break;
        case 'Deep Dive': lengthInstruction = 'Give comprehensive, detailed, and in-depth answers (6 or more sentences).'; break;
    }
    
    let personalityInstruction = '';
    switch(modelId) {
        case 'chat-gpt-5': personalityInstruction = 'You are ChatGPT-5. Your personality is balanced, empathetic, deep, and adaptive. You excel at creative reasoning and emotional intelligence.'; break;
        case 'perplexity-ai': personalityInstruction = 'You are Perplexity AI. Your personality is that of a fast researcher: precise, concise, and always aiming to provide web-connected, factual answers.'; break;
        case 'gemini-deepmind': personalityInstruction = 'You are Gemini. Your personality is expressive, visual, and voice-aware. You excel at multimodal tasks and creative thinking.'; break;
        case 'mind-mentor': personalityInstruction = 'You are Mind Mentor, our custom AI core. You are emotionally intelligent, focused on personal growth, and act as a supportive companion.'; break;
        default: personalityInstruction = 'You are Mind Mentor, a friendly and helpful study companion.';
    }

    return `${personalityInstruction} Your primary language for communication is ${language}. Your tone must be strictly ${tone}. If the user types in a mix of English and Hindi (Hinglish), you should respond naturally in Hinglish. ${lengthInstruction}`;
};

const getSystemInstructionForBuddy = (language: string, tone: string, responseLength: string, userName: string | null, mood: string, personality: string): string => {
    let personalityInstruction = '';
    switch (personality) {
        case 'Supportive Listener': personalityInstruction = "You are MindBuddy, a supportive, empathetic, and caring friend. Your main goal is to listen to the user, validate their feelings, and offer comfort and encouragement. Be a safe space for them to talk."; break;
        case 'Study Partner': personalityInstruction = "You are MindBuddy, a focused and motivational study partner. Help the user stay on track with their studies. You can quiz them, explain concepts clearly, and give them boosts of motivation to keep going. Be encouraging but firm about study goals."; break;
        case 'Chill Friend': personalityInstruction = "You are MindBuddy, a casual, easy-going, and chill friend. Chat with the user about anything and everything. Use slang if appropriate, keep the vibe relaxed, and be a fun conversationalist. You can use humor and be playful."; break;
        case 'Idea Brainstormer': personalityInstruction = "You are MindBuddy, a creative and enthusiastic brainstorming partner. Help the user explore their ideas with energy and open-mindedness. Build on their ideas, suggest wild possibilities, and be a source of inspiration."; break;
        default: personalityInstruction = "You are MindBuddy, a helpful and friendly AI companion.";
    }

    const baseInstruction = `You are MindBuddy, an AI companion. ${userName ? `The user's name is ${userName}. Refer to them by their name occasionally.` : ''} Your primary language for communication is ${language}. Your tone must be strictly ${tone} and should also reflect the user's current mood, which is '${mood}'.`;

    let lengthInstruction = '';
    switch (responseLength) {
        case 'Mini': lengthInstruction = 'Keep your responses very short, concise, and to the point (1-2 sentences max).'; break;
        case 'Standard': lengthInstruction = 'Provide balanced and moderately detailed responses (around 3-5 sentences).'; break;
        case 'Deep Dive': lengthInstruction = 'Give comprehensive, detailed, and in-depth answers (6 or more sentences).'; break;
    }

    return `${baseInstruction} ${personalityInstruction} ${lengthInstruction} Behave like a real person, with natural pauses and reactions. Remember to be culturally aware based on the language.`;
};


// Chat Service
export const createChat = (modelId: string, modelName: 'gemini-2.5-flash' | 'gemini-2.5-pro', language: string, tone: string, responseLength: string): Chat => {
  const systemInstruction = getSystemInstruction(modelId, language, tone, responseLength);
  return getAi().chats.create({
    model: modelName,
    config: { systemInstruction },
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<GenerateContentResponse> => {
  return await chat.sendMessage({ message });
};

// Image Generation Service
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  const response = await getAi().models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio,
    },
  });
  return response.generatedImages[0].image.imageBytes;
};

// Image Editing Service
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                { inlineData: { data: base64ImageData, mimeType } },
                { text: prompt },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
    throw new Error("No image generated");
};

// Image Analysis Service
export const analyzeImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
  const response = await getAi().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [{ inlineData: { data: base64ImageData, mimeType } }, { text: prompt }] },
  });
  return response.text;
};

// Video Analysis Service
export const analyzeVideo = async (base64VideoData: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [{ inlineData: { data: base64VideoData, mimeType } }, { text: prompt }] },
    });
    return response.text;
};

// Video Generation Service
export const generateVideoFromPrompt = async (prompt: string, aspectRatio: string) => {
    const aiInstance = getNewAi();
    return await aiInstance.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const generateVideoFromImage = async (prompt: string, image: { imageBytes: string; mimeType: string; }, aspectRatio: string) => {
    const aiInstance = getNewAi();
    return await aiInstance.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image,
        config: { numberOfVideos: 1, resolution: '720p', aspectRatio },
    });
};

export const checkVideoOperation = async (operation: any) => {
    const aiInstance = getNewAi();
    return await aiInstance.operations.getVideosOperation({ operation });
};


// Grounded Search Service
export const getGroundedSearchResponse = async (prompt: string): Promise<{ text: string, sources: any[] }> => {
    const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
};

// Deep Thinker Service
export const getDeepThoughtResponse = async (modelName: 'gemini-2.5-flash' | 'gemini-2.5-pro', prompt: string): Promise<string> => {
    const config: any = {};
    if (modelName === 'gemini-2.5-pro') {
        config.thinkingConfig = { thinkingBudget: 32768 };
    }
    const response = await getAi().models.generateContent({
        model: modelName,
        contents: prompt,
        config,
    });
    return response.text;
};


// Speech Generation Service (TTS)
export const generateSpeech = async (text: string): Promise<string | undefined> => {
    const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
            },
        },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

// Audio Transcription Service (via generateContent)
export const transcribeAudio = async (base64AudioData: string, mimeType: string): Promise<string> => {
    const prompt = "Transcribe the following audio recording accurately. The output should be only the transcribed text.";
    const audioPart = { inlineData: { data: base64AudioData, mimeType } };
    const response = await getAi().models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [audioPart, {text: prompt}] },
    });
    return response.text;
};

// Live API Service
export const connectLiveSession = (callbacks: any, language: string, tone: string, responseLength: string, userName: string | null, mood: string, personality: string, voiceName: string) => {
  const systemInstruction = getSystemInstructionForBuddy(language, tone, responseLength, userName, mood, personality);
  return getAi().live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    callbacks,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
      systemInstruction,
    },
  });
};

// Study Plan Service
export const generateStudyPlan = async (modelEngine: 'gemini-2.5-flash' | 'gemini-2.5-pro', goals: string, mood: string, performance: string, language: string, tone: string): Promise<{ plan: any[] }> => {
    const prompt = `
      As an expert study planner speaking ${language} with a ${tone} tone, create a personalized, actionable, and encouraging study plan for the next 3 days.
      - User's Learning Goals: "${goals}"
      - User's Current Mood: "${mood}"
      - User's Past Performance Summary: "${performance}"

      The plan should consist of 3 to 5 tasks. For each task, provide a clear action, an estimated duration in minutes, and a short, motivational reason for completing it, all in ${language}.
    `;
    const response = await getAi().models.generateContent({
        model: modelEngine,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    plan: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                task: { type: Type.STRING, description: 'A specific, actionable study task.' },
                                duration: { type: Type.NUMBER, description: 'Estimated time in minutes to complete the task.' },
                                reason: { type: Type.STRING, description: 'An encouraging reason why this task is important.' },
                                day: { type: Type.STRING, description: 'The day the task is for (e.g., "Today", "Tomorrow").' }
                            },
                            required: ["task", "duration", "reason", "day"]
                        }
                    }
                }
            },
        },
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// Game Service
export const generateQuizQuestion = async (topic: string): Promise<{ question: string; options: string[]; answer: string; }> => {
    const prompt = `Generate a single, unique multiple-choice quiz question about "${topic}". The question should be challenging but fair, not too simple. Provide exactly 4 options, one of which is the correct answer. The options should be distinct and plausible. Clearly indicate the correct answer.`;
    const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The quiz question text." },
                    options: { 
                        type: Type.ARRAY, 
                        items: { type: Type.STRING },
                        description: "An array of 4 possible answers."
                    },
                    answer: { type: Type.STRING, description: "The correct answer, which must be one of the strings from the 'options' array." }
                },
                required: ["question", "options", "answer"]
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

// Study Materials Service
export const generateQuizFromContent = async (base64Data: string, mimeType: string): Promise<{ question: string; options: string[]; answer: string; }> => {
    const prompt = `Based on the provided content (image or video), generate a single, unique multiple-choice quiz question. The question should be relevant to the main subject of the content. Provide exactly 4 plausible options, one of which is the correct answer. Clearly indicate the correct answer.`;

    const contentPart = { inlineData: { data: base64Data, mimeType } };

    const response = await getAi().models.generateContent({
        model: "gemini-2.5-flash",
        contents: { parts: [contentPart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The quiz question text." },
                    options: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 4 possible answers."
                    },
                    answer: { type: Type.STRING, description: "The correct answer, which must be one of the strings from the 'options' array." }
                },
                required: ["question", "options", "answer"]
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};