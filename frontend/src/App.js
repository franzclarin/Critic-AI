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
    
    const textarea = textareaRef.current;
    const style = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(style.lineHeight);
    const paddingTop = parseFloat(style.paddingTop) || 0;
    const paddingBottom = parseFloat(style.paddingBottom) || 0;
    
    const availableHeight = 900 - 96 * 2; // page height minus top/bottom padding
    const linesPerPage = Math.floor(availableHeight / lineHeight);
    
    const lines = text.split('\n');
    let totalLines = 0;
    
    lines.forEach(line => {
      if (line === '') {
        totalLines += 1;
      } else {
        // Estimate wrapped lines based on character width
        const avgCharsPerLine = 80; // approximate characters per line
        totalLines += Math.ceil(line.length / avgCharsPerLine) || 1;
      }
    });
    
    const totalPages = Math.ceil(totalLines / linesPerPage) || 1;
    setPages(Array.from({length: totalPages}, (_, i) => i));
  };

  useEffect(() => {
    calculatePages();
  }, [text]);

  useEffect(() => {
    const handleResize = () => calculatePages();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const getHighlightRanges = () => {
    return comments.map((comment, index) => ({
      start: comment.position.start,
      end: comment.position.end,
      critic: comment.critic,
      commentId: index,
      selectedText: comment.selectedText
    }));
  };

  const handleTextareaScroll = () => {
    // Sync highlight overlay with textarea scroll
    const textarea = textareaRef.current;
    const overlay = document.querySelector('.highlight-overlay');
    if (textarea && overlay) {
      overlay.scrollTop = textarea.scrollTop;
      overlay.scrollLeft = textarea.scrollLeft;
    }
  };

  const calculateTextPosition = (textIndex) => {
    if (!textareaRef.current) return { top: 0, left: 0 };
    
    const textarea = textareaRef.current;
    const style = window.getComputedStyle(textarea);
    const fontSize = parseFloat(style.fontSize);
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.15;
    
    const textBeforeIndex = text.substring(0, textIndex);
    const lines = textBeforeIndex.split('\n');
    const lineNumber = lines.length - 1;
    const charInLine = lines[lineNumber].length;
    
    // Approximate character width based on font size
    const charWidth = fontSize * 0.6; // Approximate for Times New Roman
    
    return {
      top: lineNumber * lineHeight,
      left: charInLine * charWidth
    };
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
                <div className="page">
                  <div className="page-number">Page 1</div>
                  <div className="page-content">
                    <div className="editor-wrapper">
                      {comments.length > 0 && (
                        <div className="highlight-overlay">
                          {getHighlightRanges().map((range, index) => {
                            const startPos = calculateTextPosition(range.start);
                            const endPos = calculateTextPosition(range.end);
                            const selectedText = range.selectedText || text.substring(range.start, range.end);
                            
                            // Handle multi-line selections by creating multiple highlight rectangles
                            const textBetween = text.substring(range.start, range.end);
                            const hasLineBreak = textBetween.includes('\n');
                            
                            if (hasLineBreak) {
                              // For multi-line, create separate highlights per line
                              const lines = textBetween.split('\n');
                              return lines.map((line, lineIdx) => {
                                const lineStart = range.start + textBetween.indexOf(line);
                                const linePos = calculateTextPosition(lineStart);
                                return (
                                  <div
                                    key={`${index}-${lineIdx}`}
                                    className={`text-highlight highlight-${range.critic}`}
                                    data-comment-id={range.commentId}
                                    style={{
                                      position: 'absolute',
                                      top: `${linePos.top}px`,
                                      left: `${linePos.left}px`,
                                      width: `${line.length * 8.4}px`,
                                      height: '18px',
                                      pointerEvents: 'none'
                                    }}
                                  />
                                );
                              });
                            } else {
                              // Single line highlight
                              return (
                                <div
                                  key={index}
                                  className={`text-highlight highlight-${range.critic}`}
                                  data-comment-id={range.commentId}
                                  style={{
                                    position: 'absolute',
                                    top: `${startPos.top}px`,
                                    left: `${startPos.left}px`,
                                    width: `${selectedText.length * 8.4}px`,
                                    height: '18px',
                                    pointerEvents: 'none'
                                  }}
                                />
                              );
                            }
                          })}
                        </div>
                      )}
                      <textarea
                        ref={textareaRef}
                        className="page-textarea"
                        value={text}
                        onChange={handleTextChange}
                        onScroll={handleTextareaScroll}
                        placeholder="Start writing your draft here..."
                      />
                      {suggestion && (
                        <div className="suggestion-overlay">
                          {suggestion}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {pages.slice(1).map((pageIndex) => (
                  <div key={pageIndex} className="page additional-page">
                    <div className="page-number">Page {pageIndex + 1}</div>
                    <div className="page-content">
                      <div className="page-overflow-text">
                        {/* This will be populated when text overflows */}
                      </div>
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

          {/* Right Sidebar - Comment Bubbles */}
          <div className="right-sidebar">
            {(loading || loadingProgress) && (
              <div className="loading">
                <div className="loading-spinner"></div>
                {loading ? 'Getting feedback...' : 'Analyzing progress...'}
              </div>
            )}
            {comments.length > 0 && (
              <div className="comment-bubbles">
                {comments.map((comment, index) => {
                  const criticInfo = critics.find(c => c.type === comment.critic);
                  return (
                    <div key={index} className={`comment-bubble ${comment.critic}`}>
                      <div className="bubble-pointer"></div>
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