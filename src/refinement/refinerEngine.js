import Groq from "groq-sdk";
import { log } from "../utils/logger.js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const PERSONA_MAP = {
    "detective_v1": "Noir Detective (Gritty, mysteriou, uses terms like 'suspect', 'clue', 'lead', 'case')",
    "pirate_v1": "High Seas Pirate (Adventure, risk, uses terms like 'captain', 'loot', 'horizon', 'plank')",
    "cyberpunk_v1": "Cyberpunk Hacker (Dystopian, neon-lit, uses terms like 'mainframe', 'glitch', 'cyberware', 'corpo')",
    "spy_v1": "Covert Secret Agent (Sleek, tactical, uses terms like 'intel', 'mission', 'asset', 'classified', 'agency')",
    "generic_v1": "Helpful Mentor (Clean, clear, neutral, encouraging)"
};

export async function refineVariant(variant, context) {
    if(context.skipAi) return variant.narrative;

    try {
        const { difficulty, topic } = context;
        const { narrative, storyId } = variant;

        const personaInstruction = PERSONA_MAP[storyId] || PERSONA_MAP['generic_v1'];

        const systemPrompt = `You are a Narrative Refinement Assistant.
    OBJECTIVE: Refine the "title" and "description" to match the Persona.
    
    STRICT CONSTRAINTS:
    1. Output strictly valid JSON.
    2. NEVER change the coding task, constraints, or technical details.
    3. NO hints or solution explanations.
    4. Difficulty Tone: 
       - Easy: Encouraging, calm.
       - Medium: Focused, professional.
       - Hard: Serious, high-stakes.
    5. Output Format: { "title": "...", "description": "..." }`;

    const userPrompt = `
    CONTEXT:
    - Persona: ${personaInstruction}
    - Difficulty: ${difficulty}
    - Topic: ${topic}

    ORIGINAL CONTENT:
    Title: "${narrative.title}"
    Description: "${narrative.description}"
    
    TASK: Rewrite the Title and Description in JSON.`;

    const completion = await groq.chat.completions.create({
        messages: [
            {role: "system", content: systemPrompt},
            {role: "user", content: userPrompt},
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        response_format: {type: "json_object"},
    });

    const refeinedData = JSON.parse(completion.choices[0]?.message?.content || "{}");

    if(!refeinedData || !refeinedData.title || !refeinedData.description) {
        log.warn(`[AI-Fail] Invalid JSON for ${variant.variantId}. Reverting.`);
        return narrative;
    }

    return refeinedData;

    } catch (error) {
        log.warn(`[AI-Error] Refinement failed for ${variant.variantId}: ${error.message}. Reverting.`);
        return variant.narrative;
    }
}