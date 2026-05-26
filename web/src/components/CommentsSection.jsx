import React, { useState, useEffect, useRef } from 'react';
import { getPostComments, createComment, deleteComment, updateComment, formatDateTime } from '../lib/api';
import Avatar from './Avatar';

export default function CommentsSection({ postId, user, openProfile }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [replyToId, setReplyToId] = useState(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const textareaRef = useRef(null);

  useEffect(() => {
    loadComments();
    loadUsers();
  }, [postId]);

  const loadComments = async () => {
    try {
      const data = await getPostComments(postId);
      setComments(data || []);
    } catch (e) {
      console.error('Failed to load comments', e);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/users', {
        credentials: 'include'
      });
      const users = await response.json();
      setAvailableUsers(users || []);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewComment(value);

    // Check for @ mention
    const lastWord = value.split(/\s/).pop();
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setMentionSearch(lastWord.substring(1));
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (userName) => {
    const words = newComment.split(/\s/);
    words[words.length - 1] = `@${userName} `;
    setNewComment(words.join(' '));
    setShowMentions(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setLoading(true);
    try {
      const comment = await createComment(postId, newComment, replyToId);
      setComments([...comments, comment]);
      setNewComment('');
      setReplyToId(null);
    } catch (e) {
      alert(e.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (commentId) => {
    if (!editContent.trim()) return;

    try {
      const updated = await updateComment(commentId, editContent);
      setComments(comments.map(c => c._id === commentId ? updated : c));
      setEditingId(null);
      setEditContent('');
    } catch (e) {
      alert(e.message || 'Failed to update comment');
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return;

    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c._id !== commentId && c.parentId !== commentId));
    } catch (e) {
      alert(e.message || 'Failed to delete comment');
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditContent(comment.content);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  // Separate top-level comments and replies
  const topLevelComments = comments.filter(c => !c.parentId);
  const getReplies = (commentId) => comments.filter(c => c.parentId === commentId);

  const renderComment = (comment, isReply = false) => {
    const isAuthor = user && String(comment.authorId) === String(user.id);
    const isAdmin = user && user.role === 'Admin';
    const canModify = isAuthor || isAdmin;
    const replies = getReplies(comment._id);

    return (
      <div key={comment._id} className={`comment-item ${isReply ? 'reply' : ''}`}>
        <div className="comment-header">
          <Avatar 
            user={comment.author || { name: 'Unknown', id: comment.authorId }} 
            size="sm" 
            onClick={() => comment.author && openProfile && openProfile(comment.author)}
          />
          <div className="comment-author">
            <span className="author-name">{comment.author?.name || 'Unknown'}</span>
            <span className="author-role">{comment.author?.role}</span>
          </div>
          <span className="comment-time">{formatDateTime(comment.createdAt)}</span>
        </div>

        {editingId === comment._id ? (
          <div className="comment-edit">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="edit-textarea"
              rows={2}
            />
            <div className="edit-actions">
              <button onClick={() => handleEdit(comment._id)} className="btn-save">Save</button>
              <button onClick={cancelEdit} className="btn-cancel">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="comment-content">
            {comment.content.split(/(@\w+)/g).map((part, i) =>
              part.startsWith('@') ? (
                <span key={i} className="mention">{part}</span>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        )}

        <div className="comment-actions">
          {!isReply && (
            <button 
              onClick={() => setReplyToId(replyToId === comment._id ? null : comment._id)} 
              className="action-btn"
            >
              {replyToId === comment._id ? 'Cancel Reply' : '↩️ Reply'}
            </button>
          )}
          {canModify && (
            <>
              <button onClick={() => startEdit(comment)} className="action-btn">✏️ Edit</button>
              <button onClick={() => handleDelete(comment._id)} className="action-btn delete">🗑️ Delete</button>
            </>
          )}
        </div>

        {replies.length > 0 && (
          <div className="replies-container">
            {replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">
        💬 Comments ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <div className="input-wrapper">
          <textarea
            ref={textareaRef}
            value={newComment}
            onChange={handleInputChange}
            placeholder={replyToId ? "Write a reply... (use @name to mention)" : "Write a comment... (use @name to mention)"}
            className="comment-input"
            rows={3}
            disabled={loading}
          />
          {showMentions && filteredUsers.length > 0 && (
            <div className="mentions-dropdown">
              {filteredUsers.slice(0, 5).map(u => (
                <div
                  key={u._id}
                  className="mention-item"
                  onClick={() => insertMention(u.name)}
                >
                  <span className="mention-name">{u.name}</span>
                  <span className="mention-role">{u.role}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {replyToId && (
          <div className="reply-indicator">
            Replying to comment...
            <button type="button" onClick={() => setReplyToId(null)} className="cancel-reply">✕</button>
          </div>
        )}
        <button type="submit" disabled={loading || !newComment.trim()} className="submit-comment">
          {loading ? 'Posting...' : replyToId ? '💬 Reply' : '💬 Comment'}
        </button>
      </form>

      <div className="comments-list">
        {topLevelComments.length === 0 ? (
          <div className="no-comments">No comments yet. Be the first to comment!</div>
        ) : (
          topLevelComments.map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
}
