const { GoogleGenerativeAI } = require('@google/generative-ai');

const aiCache = new Map(); // Simple in-memory cache

const chatWithAI = async (req, res) => {
  try {
    const { message, image } = req.body;
    
    if (!message && !image) {
      return res.status(400).json({ message: 'Message or image is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback if no API key is provided
      return res.json({
        text: "I am currently in offline mode because the Gemini API key is not configured.",
        redirectUrl: null
      });
    }

    // Cache key based on message (ignores image for simplicity, or we could hash the image)
    const cacheKey = message ? message.trim().toLowerCase() : 'image_upload';
    if (aiCache.has(cacheKey)) {
      return res.json(aiCache.get(cacheKey));
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `You are a helpful AI Shopping Assistant for GoldMarket. 
User says: "${message || 'I uploaded an image'}". 
If they are looking for a specific category like Watches, Sneakers, Laptops, Phones, or Electronics, reply conversationally and include the EXACT string '[REDIRECT:/products?category=CategoryName]' at the very end of your response.
If they just say hello, greet them. Keep it brief. Do not use markdown for the redirect tag.`;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text();

    let redirectUrl = null;
    let cleanText = textResponse;

    // Use a more robust regex that ignores surrounding whitespace/quotes just in case
    const redirectMatch = textResponse.match(/\[\s*REDIRECT:\s*([^\]\s]+)\s*\]/i);
    if (redirectMatch) {
      redirectUrl = redirectMatch[1].replace(/['"]/g, ''); // strip accidental quotes
      cleanText = textResponse.replace(redirectMatch[0], '').trim();
    }

    const responsePayload = {
      text: cleanText,
      redirectUrl
    };

    // Cache response for 10 minutes
    aiCache.set(cacheKey, responsePayload);
    setTimeout(() => aiCache.delete(cacheKey), 10 * 60 * 1000);

    return res.json(responsePayload);

  } catch (err) {
    console.error('AI Error:', err);
    if (err.status === 429) {
      return res.status(429).json({ message: 'AI rate limit exceeded. Please try again later.' });
    }
    return res.status(500).json({ message: 'Failed to process AI request' });
  }
};

module.exports = { chatWithAI };
