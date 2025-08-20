const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const critics = require('./critics');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const generateComments = async (text, criticType, purpose = '', type = 'complete') => {
  const critic = critics[criticType];
  let maxTokens = type === 'complete' ? 400 : 300;
  let contextPrompt = type === 'complete' 
    ? 'This is a complete piece of writing. Provide detailed feedback.'
    : 'This is a draft in progress. Focus on encouragement and developmental feedback.';
  
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      max_tokens: maxTokens,
      messages: [
        {
          role: 'system',
          content: `${critic.prompt}

You must respond with ONLY a valid JSON array of comment objects. Do not include any other text, explanations, or markdown formatting.

Each comment object must have exactly these fields:
- "selectedText": exact text from the original that you're commenting on (5-15 words)
- "comment": your brief comment about that selection (1-2 sentences max)  
- "position": object with "start" and "end" character positions

Example format:
[
  {
    "selectedText": "example text",
    "comment": "Your comment here.",
    "position": {"start": 0, "end": 12}
  }
]

Provide 2-4 comments maximum. ${contextPrompt} Be concise but maintain your personality. Return ONLY the JSON array.`
        },
        {
          role: 'user',
          content: `Analyze this ${purpose || 'text'} and provide specific comments on selected portions:

"${text}"`
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    let content = response.data.choices[0].message.content.trim();
    
    // Clean up common JSON formatting issues
    if (content.startsWith('```json')) {
      content = content.replace(/```json\s*/, '').replace(/```\s*$/, '');
    }
    if (content.startsWith('```')) {
      content = content.replace(/```.*?\n/, '').replace(/```\s*$/, '');
    }
    
    try {
      const parsed = JSON.parse(content);
      // Ensure we return an array
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (parsed && typeof parsed === 'object') {
        return [parsed]; // Single object, wrap in array
      } else {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse comment JSON:', content);
      console.error('Parse error:', parseError.message);
      
      // Try to extract meaningful text, avoiding JSON display
      let fallbackComment = 'I apologize, but I\'m having trouble providing specific feedback right now. Please try again.';
      
      // If content looks like it might contain a meaningful comment, try to extract it
      if (content && !content.includes('{') && !content.includes('[') && content.length > 10) {
        fallbackComment = content.length > 100 
          ? content.substring(0, 100) + '...'
          : content;
      }
      
      return [{
        selectedText: text.substring(0, Math.min(50, text.length)),
        comment: fallbackComment,
        position: { start: 0, end: Math.min(50, text.length) }
      }];
    }
  } catch (error) {
    console.error(`Error generating comments for ${criticType}:`, error.response?.data || error.message);
    return [{
      selectedText: text.substring(0, 30) + '...',
      comment: `I'm having trouble providing feedback right now. Please try again.`,
      position: { start: 0, end: Math.min(30, text.length) }
    }];
  }
};

const generateNextSentence = async (text, purpose = '') => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `You are a writing assistant. Continue the given text with exactly ONE natural, flowing sentence that maintains the writing style and tone. Return only the next sentence, nothing else. No quotes, no explanations.`
        },
        {
          role: 'user',
          content: `Continue this ${purpose || 'text'} with one natural sentence:

"${text}"`
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating next sentence:', error.response?.data || error.message);
    return ' I\'m having trouble generating a suggestion right now.';
  }
};


app.post('/api/feedback', async (req, res) => {
  const { text, purpose, type } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const commentPromises = Object.keys(critics).map(async (criticType) => {
      const comments = await generateComments(text, criticType, purpose, type);
      return comments.map(comment => ({ ...comment, critic: criticType }));
    });

    const commentResults = await Promise.all(commentPromises);
    const allComments = commentResults.flat();
    
    res.json({
      success: true,
      comments: allComments
    });
  } catch (error) {
    console.error('Error processing feedback request:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback',
      message: error.message 
    });
  }
});

app.post('/api/inspire', async (req, res) => {
  const { text, purpose } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const suggestion = await generateNextSentence(text, purpose);
    
    res.json({
      success: true,
      suggestion: suggestion
    });
  } catch (error) {
    console.error('Error processing inspire request:', error);
    res.status(500).json({ 
      error: 'Failed to generate suggestion',
      message: error.message 
    });
  }
});

app.post('/api/progress', async (req, res) => {
  const { text, purpose } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const commentPromises = Object.keys(critics).map(async (criticType) => {
      const comments = await generateComments(text, criticType, purpose, 'progress');
      return comments.map(comment => ({ ...comment, critic: criticType }));
    });

    const commentResults = await Promise.all(commentPromises);
    const allComments = commentResults.flat();
    
    res.json({
      success: true,
      comments: allComments
    });
  } catch (error) {
    console.error('Error processing progress request:', error);
    res.status(500).json({ 
      error: 'Failed to generate progress feedback',
      message: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Critic AI Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});