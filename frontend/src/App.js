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
  const [activeTab, setActiveTab] = useState('coauthor');
  const [hoveredComment, setHoveredComment] = useState(null);
  const textareaRef = useRef(null);

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

  const processTextWithComments = () => {
    if (!text || comments.length === 0) {
      return text;
    }

    // Create segments with comment information
    const segments = [];
    let lastIndex = 0;
    
    // Sort comments by their position in text
    const sortedComments = [...comments].sort((a, b) => {
      const aPos = text.indexOf(a.selectedText?.replace(/^["']|["']$/g, '').trim() || '');
      const bPos = text.indexOf(b.selectedText?.replace(/^["']|["']$/g, '').trim() || '');
      return aPos - bPos;
    });
    
    sortedComments.forEach((comment, index) => {
      const cleanSelected = comment.selectedText?.replace(/^["']|["']$/g, '').trim();
      if (!cleanSelected) return;
      
      const startPos = text.indexOf(cleanSelected, lastIndex);
      if (startPos === -1) return;
      
      const endPos = startPos + cleanSelected.length;
      
      // Add text before this comment
      if (startPos > lastIndex) {
        segments.push({
          text: text.substring(lastIndex, startPos),
          type: 'normal'
        });
      }
      
      // Add commented text
      segments.push({
        text: text.substring(startPos, endPos),
        type: 'comment',
        critic: comment.critic,
        commentId: index,
        comment: comment.comment
      });
      
      lastIndex = endPos;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      segments.push({
        text: text.substring(lastIndex),
        type: 'normal'
      });
    }
    
    return segments;
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
        <div 
          className={`tab ${activeTab === 'coauthor' ? 'active' : ''}`}
          onClick={() => setActiveTab('coauthor')}
        >
          <span>Coauthor</span>
        </div>
        <div 
          className={`tab ${activeTab === 'critics' ? 'active' : ''}`}
          onClick={() => setActiveTab('critics')}
        >
          <span>Critics</span>
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
              <div className="purpose-section">
                <input
                  type="text"
                  placeholder="What are you writing? (e.g., blog post, college essay, novel chapter...)"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="purpose-input"
                />
              </div>
              
              <div className="editor-content">
                <div className="writing-area-with-comments">
                  <div className="document-container">
                    {/* Text Editor */}
                    <div className="text-editor">
                      {comments.length === 0 ? (
                        <textarea
                          ref={textareaRef}
                          className="main-textarea"
                          value={text}
                          onChange={handleTextChange}
                          placeholder="Start writing your draft here..."
                        />
                      ) : (
                        <div className="document-view">
                          <div className="document-text">
                            {processTextWithComments().map((segment, index) => {
                              if (segment.type === 'normal') {
                                return (
                                  <span key={index} className="normal-text">
                                    {segment.text}
                                  </span>
                                );
                              } else {
                                return (
                                  <span
                                    key={index}
                                    className={`commented-text commented-${segment.critic} ${
                                      hoveredComment === segment.commentId ? 'highlighted' : ''
                                    }`}
                                    data-comment-id={segment.commentId}
                                    title={segment.comment}
                                    onMouseEnter={() => setHoveredComment(segment.commentId)}
                                    onMouseLeave={() => setHoveredComment(null)}
                                  >
                                    {segment.text}
                                  </span>
                                );
                              }
                            })}
                          </div>
                          <button 
                            className="edit-button"
                            onClick={() => setComments([])}
                          >
                            ✏️ Edit Text
                          </button>
                        </div>
                      )}
                      {suggestion && (
                        <div className="suggestion-overlay">
                          {suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Comment Sidebar - Moved Outside Document Container */}
                  {comments.length > 0 && (
                    <div className="comment-sidebar">
                      <h3>Comments</h3>
                      {comments.map((comment, index) => {
                        const criticInfo = critics.find(c => c.type === comment.critic);
                        return (
                          <div 
                            key={index} 
                            className={`comment-card ${comment.critic} ${
                              hoveredComment === index ? 'highlighted' : ''
                            }`}
                            data-comment-id={index}
                            onMouseEnter={() => setHoveredComment(index)}
                            onMouseLeave={() => setHoveredComment(null)}
                          >
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

          {/* Right Sidebar - Loading States */}
          <div className="right-sidebar">
            {(loading || loadingProgress) && (
              <div className="loading">
                <div className="loading-spinner"></div>
                {loading ? 'Getting feedback...' : 'Analyzing progress...'}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;