const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const critics = require('./critics');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const generateFeedback = async (text, criticType) => {
  const critic = critics[criticType];
  
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: critic.prompt
        },
        {
          role: 'user',
          content: `Please provide feedback on the following piece of writing. Keep your response to about 2-3 paragraphs and stay true to your personality:

"${text}"`
        }
      ]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error(`Error generating feedback for ${criticType}:`, error.response?.data || error.message);
    return `I apologize, but I'm having trouble providing feedback right now. Please try again in a moment.`;
  }
};

app.post('/api/feedback', async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(400).json({ error: 'Text is required' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const feedbackPromises = Object.keys(critics).map(async (criticType) => {
      const feedback = await generateFeedback(text, criticType);
      return { critic: criticType, feedback };
    });

    const feedbackResults = await Promise.all(feedbackPromises);
    
    res.json({
      success: true,
      feedback: feedbackResults
    });
  } catch (error) {
    console.error('Error processing feedback request:', error);
    res.status(500).json({ 
      error: 'Failed to generate feedback',
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