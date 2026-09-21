/**
 * AI Workout Logger Service using Gemini 2.5 Flash Vision API
 * Parses exercise photos and natural language workout text.
 */

export const analyzeWorkoutInputWithAI = async (photoBase64, textInput) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const modelName = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash';

  const promptText = `
You are an expert fitness AI assistant. Analyze this exercise photo and/or user text note: "${textInput || ''}".
Your job is to identify the exercise being performed or equipment shown, and parse the sets, weights (in kg), and reps.

Return ONLY a valid JSON object matching this exact schema:
{
  "exerciseName": "Name of Exercise (e.g. Barbell Bench Press, Lat Pulldown, Incline Dumbbell Press)",
  "muscleGroup": "Chest|Back|Legs|Shoulders|Arms|Core|Full Body",
  "equipment": "Barbell|Dumbbell|Machine|Cable|Bodyweight|Other",
  "sets": [
    { "setNumber": 1, "weight": 80, "reps": 8 },
    { "setNumber": 2, "weight": 80, "reps": 8 }
  ],
  "confidenceMessage": "Short 1-line summary of what was identified"
}
`;

  // Fallback heuristic parser if API key is missing or network fails
  const fallbackParse = () => {
    let name = 'Logged Exercise';
    let weight = 20;
    let reps = 8;
    let setsCount = 3;

    if (textInput) {
      // Try extracting weight (e.g. 80kg, 80 kg, 80lbs)
      const weightMatch = textInput.match(/(\d+(?:\.\d+)?)\s*(?:kg|kgs|lbs)?/i);
      if (weightMatch) weight = parseFloat(weightMatch[1]);

      // Try extracting reps (e.g. 8 reps, 8x, x8)
      const repsMatch = textInput.match(/(?:x|\*|\b)(\d+)\s*(?:reps|rep)?/i);
      if (repsMatch) reps = parseInt(repsMatch[1], 10);

      // Extract exercise name if letters present before numbers
      const nameMatch = textInput.match(/^([a-zA-Z\s]+)/);
      if (nameMatch && nameMatch[1].trim().length > 2) {
        name = nameMatch[1].trim();
      }
    }

    const sets = [];
    for (let i = 1; i <= setsCount; i++) {
      sets.push({ setNumber: i, weight, reps, completed: true });
    }

    return {
      exerciseName: name,
      muscleGroup: 'Chest',
      equipment: 'Barbell',
      sets,
      confidenceMessage: 'Parsed via quick text engine.'
    };
  };

  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini_api_key')) {
    console.warn('No Gemini API key configured in .env. Using fallback text parser.');
    return fallbackParse();
  }

  try {
    const parts = [];

    if (photoBase64) {
      const mimeType = photoBase64.split(';')[0].split(':')[1] || 'image/jpeg';
      const base64Data = photoBase64.split(',')[1];
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    parts.push({ text: promptText });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      console.error('Gemini API Error status:', response.status);
      return fallbackParse();
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (rawText) {
      const parsed = JSON.parse(rawText);
      return {
        exerciseName: parsed.exerciseName || 'Logged Exercise',
        muscleGroup: parsed.muscleGroup || 'Full Body',
        equipment: parsed.equipment || 'Machine',
        sets: (parsed.sets && parsed.sets.length > 0) ? parsed.sets.map((s, idx) => ({
          setNumber: idx + 1,
          weight: Number(s.weight) || 0,
          reps: Number(s.reps) || 0,
          completed: true
        })) : [
          { setNumber: 1, weight: 20, reps: 8, completed: true },
          { setNumber: 2, weight: 20, reps: 8, completed: true },
          { setNumber: 3, weight: 20, reps: 8, completed: true }
        ],
        confidenceMessage: parsed.confidenceMessage || 'Identified via Gemini AI Vision'
      };
    }
    return fallbackParse();
  } catch (err) {
    console.error('AI Analysis failed, utilizing fallback:', err);
    return fallbackParse();
  }
};
