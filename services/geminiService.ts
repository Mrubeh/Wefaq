import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
// Initialize conditionally to avoid crashing if env is missing in dev, though strictly required in prod.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateBioSuggestion = async (
  name: string,
  age: number,
  job: string,
  hobbies: string
): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key is missing.");
    return "يرجى إضافة مفتاح API لإنشاء نبذة شخصية تلقائية.";
  }

  try {
    const prompt = `
      اكتب نبذة شخصية قصيرة وجذابة (حوالي 30-40 كلمة) لموقع تعارف وزواج جاد باللغة العربية.
      المستخدم:
      الاسم: ${name}
      العمر: ${age}
      الوظيفة: ${job}
      الهوايات: ${hobbies}
      
      النبرة: محترمة، ودودة، وجادة.
      لا تضع أقواس أو ترويسات، فقط النص.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "لم نتمكن من إنشاء النبذة، يرجى المحاولة مرة أخرى.";
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.";
  }
};

export const checkCompatibility = async (user1Bio: string, user2Bio: string): Promise<string> => {
    if (!ai) return "الخدمة غير متوفرة حالياً";

    try {
         const prompt = `
            بصفتك خبيراً في العلاقات الزوجية، قم بتحليل التوافق بين هذين الشخصين بناءً على النبذة الشخصية فقط.
            الشخص الأول: "${user1Bio}"
            الشخص الثاني: "${user2Bio}"
            
            أعط نسبة مئوية تقديرية للتوافق ونصيحة واحدة قصيرة جداً (سطر واحد) للبدء في الحديث.
            الرد بصيغة JSON: {"score": number, "advice": string}
        `;

         const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: 'application/json' }
        });
        
        return response.text || JSON.stringify({ score: 0, advice: "لا يمكن التحليل" });
    } catch (e) {
        return JSON.stringify({ score: 0, advice: "تعذر التحليل" });
    }
}