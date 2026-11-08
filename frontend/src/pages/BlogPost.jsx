import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Eye, ArrowLeft, Share2, Check } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/posts/slug/${slug}`)
      .then(res => setPost(res.data))
      .catch(err => console.error("Error loading article:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
        <p className="small text-muted mt-2">Loading guide...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '70vh' }}>
        <h4 className="fw-bold text-dark">Article Not Found</h4>
        <p className="text-muted small">The requested article could not be located or may have been drafted.</p>
        <Link to="/blog" className="btn btn-outline-dark btn-sm rounded-mhenik fw-bold">
          ← Back to Articles
        </Link>
      </div>
    );
  }

  const rawCover = post.coverImage;
  const coverSrc = rawCover
    ? (rawCover.startsWith('http') ? rawCover : `${API_BASE}${rawCover}`)
    : null;

  return (
    <article className="container py-4 py-md-5" style={{ maxWidth: '820px', minHeight: '80vh' }}>
      {/* Navigation & Share */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/blog" className="btn btn-sm btn-light border text-dark fw-bold rounded-mhenik d-flex align-items-center gap-1">
          <ArrowLeft size={14} /> All Guides
        </Link>
        <button 
          type="button" 
          onClick={handleShare} 
          className="btn btn-sm btn-light border rounded-mhenik d-flex align-items-center gap-1"
        >
          {copied ? <Check size={14} className="text-success" /> : <Share2 size={14} />}
          <span className="small">{copied ? 'Copied Link' : 'Share'}</span>
        </button>
      </div>

      {/* Header Info */}
      <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-1 rounded-mhenik mb-2">
        {post.category || 'Fitment Guide'}
      </span>
      <h1 className="fw-bold text-dark mb-3" style={{ fontSize: '2.2rem', lineHeight: 1.25 }}>
        {post.title}
      </h1>

      <div className="d-flex align-items-center gap-3 text-muted small pb-3 mb-4 border-bottom">
        <span className="d-flex align-items-center gap-1">
          <Calendar size={14} />
          {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <span className="d-flex align-items-center gap-1">
          <Eye size={14} /> {post.views || 0} views
        </span>
      </div>

      {/* Cover Banner */}
      {coverSrc && (
        <div className="rounded-mhenik overflow-hidden mb-4 border shadow-xs" style={{ maxHeight: '420px' }}>
          <img 
            src={coverSrc} 
            alt={post.title} 
            className="w-100" 
            style={{ objectFit: 'cover', maxHeight: '420px' }} 
          />
        </div>
      )}

      {/* Render TipTap Content */}
      <div 
        className="article-body" 
        style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#334155' }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Bottom CTA */}
      <div className="mt-5 p-4 rounded-mhenik bg-light border text-center">
        <h5 className="fw-bold text-dark mb-1">Need help finding the right part?</h5>
        <p className="text-muted small mb-3">Our mechanics and parts counter staff are available to verify OEM vehicle compatibility directly.</p>
        <Link to="/contact" className="btn btn-primary btn-sm rounded-mhenik fw-bold px-4">
          Speak to a Technician
        </Link>
      </div>
    </article>
  );
}