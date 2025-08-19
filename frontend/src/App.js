import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const App = () => {
  const [text, setText] = useState('');
  const [purpose, setPurpose] = useState('');
  const [comments, setComments] = useState([]);
  const [suggestion, setSuggestion] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const textareaRef = useRef(null);
  const [pages, setPages] = useState([0]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && suggestion) {
        e.preventDefault();
        acceptSuggestion();
      }
    };
    
    if (textareaRef.current) {
      textareaRef.current.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      if (textareaRef.current) {
        textareaRef.current.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [suggestion]);

  const acceptSuggestion = () => {
    setText(text + suggestion);
    setSuggestion('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    setSuggestion('');
    setCursorPosition(e.target.selectionStart);
  };

  const calculatePages = () => {
    if (!textareaRef.current) return;
    const lineHeight = 24;
    const linesPerPage = Math.floor(792 / lineHeight);
    const lines = text.split('\n').length;
    const totalPages = Math.ceil(lines / linesPerPage) || 1;
    setPages(Array.from({length: totalPages}, (_, i) => i));
  };

  useEffect(() => {
    calculatePages();
  }, [text]);

  const handleSubmit = async () => {
    if (!text.trim()) {
      alert('Please write something before submitting!');
      return;
    }

    setLoading(true);
    setComments([]);

    try {
      const response = await axios.post('/api/feedback', {
        text: text,
        purpose: purpose,
        type: 'complete'
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error getting feedback:', error);
      alert('Sorry, there was an error getting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspire = async () => {
    if (!text.trim()) {
      alert('Please write something first!');
      return;
    }

    setLoadingSuggestion(true);
    setSuggestion('');

    try {
      const response = await axios.post('/api/inspire', {
        text: text,
        purpose: purpose
      });
      setSuggestion(response.data.suggestion);
    } catch (error) {
      console.error('Error getting suggestion:', error);
      alert('Sorry, there was an error getting suggestion. Please try again.');
    } finally {
      setLoadingSuggestion(false);
    }
  };

  const handleProgress = async () => {
    if (!text.trim()) {
      alert('Please write something first!');
      return;
    }

    setLoadingProgress(true);
    setComments([]);

    try {
      const response = await axios.post('/api/progress', {
        text: text,
        purpose: purpose
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error getting progress feedback:', error);
      alert('Sorry, there was an error getting progress feedback. Please try again.');
    } finally {
      setLoadingProgress(false);
    }
  };

  const renderTextWithHighlights = () => {
    if (!comments.length) return text;
    
    let highlightedText = text;
    let offset = 0;
    
    comments.forEach((comment, index) => {
      const startPos = comment.position.start + offset;
      const endPos = comment.position.end + offset;
      const highlightClass = `highlight-${comment.critic}`;
      const highlightSpan = `<span class="${highlightClass}" data-comment-id="${index}">${highlightedText.substring(startPos, endPos)}</span>`;
      
      highlightedText = highlightedText.substring(0, startPos) + highlightSpan + highlightedText.substring(endPos);
      offset += highlightSpan.length - (endPos - startPos);
    });
    
    return highlightedText;
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
      <div className="tab-container">
        <div className="tab active">
          <span>Coauthor</span>
        </div>
      </div>

      <main className="main-container">
        <div className="layout-grid">
          {/* Left Sidebar - Writing Tools */}
          <div className="left-sidebar">
            {loadingSuggestion && (
              <div className="loading">
                <div className="loading-spinner"></div>
                Getting suggestion...
              </div>
            )}
            {suggestion && (
              <div className="suggestion-preview">
                <h3>Next Sentence Suggestion</h3>
                <div className="suggestion-text">{suggestion}</div>
                <div className="suggestion-hint">Press Tab to accept</div>
              </div>
            )}
          </div>

          {/* Center - Writing Space */}
          <div className="center-content">
            <div className="editor-container">
              <div className="editor-header">
                <h2>Coauthor</h2>
              </div>
              
              <div className="purpose-section">
                <input
                  type="text"
                  placeholder="What are you writing? (e.g., blog post, college essay, novel chapter...)"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="purpose-input"
                />
              </div>
              
              <div className="pages-container">
                {pages.map((pageIndex) => (
                  <div key={pageIndex} className="page">
                    <div className="page-number">Page {pageIndex + 1}</div>
                    <div className="page-content">
                      {pageIndex === 0 ? (
                        <>
                          <textarea
                            ref={textareaRef}
                            className="page-textarea"
                            value={text}
                            onChange={handleTextChange}
                            placeholder="Start writing your draft here..."
                          />
                          {suggestion && (
                            <div className="suggestion-overlay">
                              {suggestion}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="page-overflow">
                          {/* Additional pages content will be handled here */}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="action-buttons">
                <button 
                  className="action-btn inspire-btn" 
                  onClick={handleInspire}
                  disabled={loadingSuggestion || !text.trim()}
                >
                  {loadingSuggestion ? 'Getting...' : 'Inspire'}
                </button>
                <button 
                  className="action-btn progress-btn" 
                  onClick={handleProgress}
                  disabled={loadingProgress || !text.trim()}
                >
                  {loadingProgress ? 'Analyzing...' : 'Progress'}
                </button>
                <button 
                  className="action-btn submit-btn" 
                  onClick={handleSubmit}
                  disabled={loading || !text.trim()}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Comments */}
          <div className="right-sidebar">
            {(loading || loadingProgress) && (
              <div className="loading">
                <div className="loading-spinner"></div>
                {loading ? 'Getting feedback...' : 'Analyzing progress...'}
              </div>
            )}
            {comments.length > 0 && (
              <div className="comments-section">
                <h3>Comments</h3>
                {comments.map((comment, index) => {
                  const criticInfo = critics.find(c => c.type === comment.critic);
                  return (
                    <div key={index} className={`comment-bubble ${comment.critic}`}>
                      <div className="comment-header">
                        <div className="critic-avatar">
                          {criticInfo.avatar}
                        </div>
                        <div className="critic-name">{criticInfo.name}</div>
                      </div>
                      <div className="comment-content">
                        <div className="quoted-text">"{comment.selectedText}"</div>
                        <div className="comment-text">{comment.comment}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;