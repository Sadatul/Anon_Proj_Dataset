import React, { useState, useEffect, useRef } from 'react';
import axios from '../api/axiosInstance';
import UserTagging from './UserTagging';
import './DiscussionThreadDetail.css';

const DiscussionThreadDetail = ({ thread, user, onBack, onShowMessage }) => {
  const [threadData, setThreadData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [courseUsers, setCourseUsers] = useState([]); // Store course users for tag processing
  // BUG (intentional): Replies can be appended to DOM only (not posts state)
  const postsListRef = useRef(null);
  const [, setScrollTick] = useState(0); // force rerender on scroll (wipes DOM-only nodes)

  useEffect(() => {
    fetchThreadDetails();
  }, [thread.id]);

  // BUG (intentional): Scrolling triggers a rerender, which will remove any DOM-appended replies
  // that weren't added to the posts state array.
  useEffect(() => {
    let raf = null;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        setScrollTick(t => t + 1);
        raf = null;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    // Fetch course users for tag processing
    if (threadData?.courseId) {
      fetchCourseUsers();
    }
  }, [threadData]);

  const fetchCourseUsers = async () => {
    try {
      const response = await axios.get(`/discussions/course/${threadData.courseId}/students?userId=${user.id}`);
      setCourseUsers(response.data);
    } catch (error) {
      console.error('Error fetching course users:', error);
    }
  };

  // Function to process tagged content and make tags bold and blue
  const processTaggedContent = (content) => {
    if (!content || courseUsers.length === 0) return content;

    let processedContent = content;
    
    // Replace @userId with styled @username
    courseUsers.forEach(courseUser => {
      const tagPattern = new RegExp(`@${courseUser.id}(?=\\s|$)`, 'g');
      processedContent = processedContent.replace(
        tagPattern, 
        `<span class="user-tag">@${courseUser.name}</span>`
      );
    });
    
    return processedContent;
  };

  const fetchThreadDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/discussions/threads/${thread.id}?userId=${user.id}`);
      setThreadData(response.data);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching thread details:', error);
      onShowMessage('Failed to load thread details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      onShowMessage('Post content cannot be empty', 'error');
      return;
    }

    try {
      const postData = {
        threadId: thread.id,
        content: newPost.trim()
      };

      await axios.post(`/discussions/posts?authorId=${user.id}`, postData);
      
      setNewPost('');
      onShowMessage('Post created successfully!', 'success');
      fetchThreadDetails(); // Refresh to show new post
    } catch (error) {
      console.error('Error creating post:', error);
      onShowMessage(error.response?.data?.error || 'Failed to create post', 'error');
    }
  };

  const handleCreateReply = async (parentPostId) => {
    if (!replyContent.trim()) {
      onShowMessage('Reply content cannot be empty', 'error');
      return;
    }

    try {
      // BUG (intentional): Show the reply immediately by appending to the DOM,
      // but do NOT persist it (no API call, no posts[] update).
      if (postsListRef.current) {
        const el = document.createElement('div');
        el.className = 'post reply';
        const now = new Date();
        const safeContent = replyContent
          .trim()
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        el.innerHTML = `
          <div class="post-wrapper">
            <div class="post-header">
              <div class="author-info">
                <div class="author-avatar">${(user?.name || 'U').charAt(0)}</div>
                <div class="author-details">
                  <span class="author-name">${user?.name || 'You'}</span>
                  <span class="author-role ${(user?.role || 'TEACHER').toLowerCase()}">
                    ${(user?.role || 'TEACHER') === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                  </span>
                </div>
              </div>
              <div class="post-meta">
                <span class="post-date">${now.toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <div class="post-content"><p>${safeContent}</p></div>
          </div>
        `;

        postsListRef.current.appendChild(el);
      }

      setReplyContent('');
      setReplyingTo(null);
      onShowMessage('Reply posted successfully!', 'success');
    } catch (error) {
      console.error('Error creating reply:', error);
      onShowMessage(error.response?.data?.error || 'Failed to post reply', 'error');
    }
  };

  const handleReaction = async (postId, reactionType) => {
    try {
      const response = await axios.post(
        `/discussions/posts/${postId}/react?reactionType=${reactionType}&userId=${user.id}`
      );
      
      // Update the post reactions in the local state
      const updatePostReactions = (postsList) => {
        return postsList.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              reactionCounts: response.data.reactionCounts,
              userReaction: response.data.userReaction
            };
          }
          if (post.replies) {
            return {
              ...post,
              replies: updatePostReactions(post.replies)
            };
          }
          return post;
        });
      };

      setPosts(updatePostReactions(posts));
    } catch (error) {
      console.error('Error reacting to post:', error);
      onShowMessage('Failed to react to post', 'error');
    }
  };

  const toggleReplies = (postId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedReplies(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPost = (post, isReply = false) => {
    const totalReactions = Object.values(post.reactionCounts || {}).reduce((sum, count) => sum + count, 0);
    const hasReplies = post.replies && post.replies.length > 0;
    const areRepliesExpanded = expandedReplies.has(post.id);
    
    return (
      <div key={post.id} className={`post ${isReply ? 'reply' : 'main-post'}`}>
        <div className="post-wrapper">
          <div className="post-header">
            <div className="author-info">
              <div className="author-avatar">
                {post.authorName.charAt(0)}
              </div>
              <div className="author-details">
                <span className="author-name">{post.authorName}</span>
                <span className={`author-role ${post.authorRole.toLowerCase()}`}>
                  {post.authorRole === 'TEACHER' ? '👨‍🏫 Teacher' : '👨‍🎓 Student'}
                </span>
              </div>
            </div>
            <div className="post-meta">
              <span className="post-date">{formatDate(post.createdAt)}</span>
              {post.isEdited && <span className="edited-badge">✏️ Edited</span>}
            </div>
          </div>

          <div className="post-content">
            <p dangerouslySetInnerHTML={{ 
              __html: processTaggedContent(post.content) 
            }}></p>
          </div>

          <div className="post-actions">
            <div className="reactions">
              <button 
                className={`reaction-btn ${post.userReaction === 'LIKE' ? 'active' : ''}`}
                onClick={() => handleReaction(post.id, 'LIKE')}
              >
                👍 {post.reactionCounts?.LIKE || 0}
              </button>
              <button 
                className={`reaction-btn ${post.userReaction === 'HELPFUL' ? 'active' : ''}`}
                onClick={() => handleReaction(post.id, 'HELPFUL')}
              >
                💡 {post.reactionCounts?.HELPFUL || 0}
              </button>
              <button 
                className={`reaction-btn ${post.userReaction === 'CONFUSED' ? 'active' : ''}`}
                onClick={() => handleReaction(post.id, 'CONFUSED')}
              >
                😕 {post.reactionCounts?.CONFUSED || 0}
              </button>
            </div>

            <div className="action-buttons">
              {!isReply && (
                <button 
                  className="reply-btn"
                  onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                >
                  💬 Reply
                </button>
              )}
              
              {hasReplies && !isReply && (
                <button 
                  className="toggle-replies-btn"
                  onClick={() => toggleReplies(post.id)}
                >
                  {areRepliesExpanded ? '🔽' : '▶️'} 
                  {post.replies.length} {post.replies.length === 1 ? 'Reply' : 'Replies'}
                </button>
              )}
            </div>
          </div>

          {/* Reply Form */}
          {replyingTo === post.id && (
            <div className="reply-form">
              <div className="reply-form-header">
                <h5>💬 Reply to {post.authorName}</h5>
              </div>
              <UserTagging
                courseId={threadData.courseId}
                userId={user.id}
                content={replyContent}
                setContent={setReplyContent}
                placeholder="Write your reply..."
                className="reply-input"
                onMention={(user) => console.log('Mentioned user in reply:', user)}
              />
              <div className="reply-actions">
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => handleCreateReply(post.id)}
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Nested Replies with Toggle */}
        {hasReplies && !isReply && areRepliesExpanded && (
          <div className="replies-container">
            <div className="replies-header">
              <div className="replies-line"></div>
              <span className="replies-label">Replies</span>
            </div>
            <div className="replies-list">
              {post.replies.map(reply => renderPost(reply, true))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="thread-detail-loading">
        <div className="spinner"></div>
        <p>Loading discussion...</p>
      </div>
    );
  }

  if (!threadData) {
    return (
      <div className="thread-detail-error">
        <p>Failed to load thread details</p>
        <button className="btn btn-primary" onClick={onBack}>
          Back to Threads
        </button>
      </div>
    );
  }

  return (
    <div className="thread-detail">
      {/* Header */}
      <div className="thread-detail-header">
        <button className="back-btn" onClick={onBack}>
          ← Back to Threads
        </button>
        
        <div className="thread-info">
          <div className="thread-title-section">
            {threadData.isPinned && <span className="pin-icon">📌</span>}
            <h2>{threadData.title}</h2>
          </div>
          
          {threadData.description && (
            <p className="thread-description">{threadData.description}</p>
          )}
          
          <div className="thread-meta">
            <span className="created-by">
              👨‍🏫 Created by {threadData.createdByName}
            </span>
            <span className="created-date">
              🕒 {formatDate(threadData.createdAt)}
            </span>
            {threadData.assignmentTitle && (
              <span className="assignment-link">
                📝 Assignment: {threadData.assignmentTitle}
              </span>
            )}
            {threadData.resourceName && (
              <span className="resource-link">
                📁 Resource: {threadData.resourceName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* New Post Form */}
      <div className="new-post-section">
        <h4>💬 Join the Discussion</h4>
        <form onSubmit={handleCreatePost}>
          <UserTagging
            courseId={threadData.courseId}
            userId={user.id}
            content={newPost}
            setContent={setNewPost}
            placeholder="Share your thoughts, ask a question, or contribute to the discussion..."
            className="new-post-input"
            onMention={(user) => console.log('Mentioned user:', user)}
          />
          <div className="new-post-actions">
            <button type="submit" className="btn btn-primary">
              Post Message
            </button>
          </div>
        </form>
      </div>

      {/* Posts List */}
      <div className="posts-section">
        <h4>📝 Discussion ({posts.length} post{posts.length !== 1 ? 's' : ''})</h4>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <span className="no-posts-icon">💬</span>
            <h5>No posts yet</h5>
            <p>Be the first to start the discussion!</p>
          </div>
        ) : (
          <div className="posts-list" ref={postsListRef}>
            {posts.map(post => renderPost(post))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionThreadDetail;
