import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';

const App = () => {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['link'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent', 'link'
  ];

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please write something before submitting!');
      return;
    }

    setLoading(true);
    setFeedback([]);

    try {
      const response = await axios.post('/api/feedback', {
        text: text
      });
      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Sorry, there was an error getting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const critics = [
    {
      type: 'enthusiastic',
      name: 'Maya Chen',
      role: 'Enthusiastic Supporter',
      avatar: 'M'
    },
    {
      type: 'analytical',
      name: 'Dr. James Wilson',
      role: 'Technical Analyst',
      avatar: 'J'
    },
    {
      type: 'constructive',
      name: 'Sarah Rodriguez',
      role: 'Constructive Editor',
      avatar: 'S'
    },
    {
      type: 'creative',
      name: 'Alex Turner',
      role: 'Creative Visionary',
      avatar: 'A'
    }
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>Critic AI</h1>
        <p>Get diverse feedback on your writing from multiple AI personalities</p>
      </header>

      <main className="main-container">
        <div className="editor-container">
          <div className="editor-header">
            <h2>Your Writing Space</h2>
          </div>
          
          <ReactQuill
            theme="snow"
            value={text}
            onChange={setText}
            modules={modules}
            formats={formats}
            placeholder="Start writing your draft here... You can paste existing text or write from scratch."
          />
          
          <div className="submit-section">
            <button 
              className="submit-btn" 
              onClick={handleSubmit}
              disabled={loading || !text.trim()}
            >
              {loading ? 'Getting Feedback...' : 'Get Feedback from Critics'}
            </button>
          </div>
        </div>

        {loading && (
          <div className="loading">
            <div className="loading-spinner"></div>
            Our AI critics are reading your work...
          </div>
        )}

        {feedback.length > 0 && (
          <div className="feedback-section">
            {feedback.map((item, index) => {
              const criticInfo = critics.find(c => c.type === item.critic);
              return (
                <div key={index} className={`critic-card ${item.critic}`}>
                  <div className="critic-header">
                    <div className="critic-avatar">
                      {criticInfo.avatar}
                    </div>
                    <div className="critic-info">
                      <h3>{criticInfo.name}</h3>
                      <div className="role">{criticInfo.role}</div>
                    </div>
                  </div>
                  <div className="feedback-content">
                    {item.feedback}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;