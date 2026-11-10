import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Eye, ArrowLeft, Share2, Check, ShieldCheck } from 'lucide-react';

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
        <div className="spinner-border text-danger spinner-border-sm mb-2" role="status"></div>
        <p className="small text-muted font-monospace">Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container py-5 text-center" style={{ minHeight: '70vh' }}>
        <h5 className="fw-bold text-dark">Article Not Found</h5>
        <p className="text-muted small">The requested article could not be located or may have been unindexed.</p>
        <Link to="/blog" className="btn btn-outline-dark btn-sm rounded-1 fw-semibold font-monospace">
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
    <article className="bg-white min-vh-100 py-4 py-md-5">
      <div className="container text-start" style={{ maxWidth: '820px' }}>
        
        {/* Navigation & Share */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <Link to="/blog" className="btn btn-sm btn-light border text-dark fw-semibold rounded-1 d-flex align-items-center gap-1 font-monospace" style={{ fontSize: '11.5px' }}>
            <ArrowLeft size={13} /> Back to Guides
          </Link>
          <button 
            type="button" 
            onClick={handleShare} 
            className="btn btn-sm btn-light border rounded-1 d-flex align-items-center gap-1 font-monospace"
            style={{ fontSize: '11.5px' }}
          >
            {copied ? <Check size={13} className="text-success" /> : <Share2 size={13} />}
            <span>{copied ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>

        {/* Header Information */}
        <div className="mb-3">
          <span className="badge bg-light text-dark border rounded-1 font-monospace small px-2.5 py-1 mb-2">
            {post.category || 'Fitment Guide'}
          </span>
          <h1 className="h2 fw-bold text-dark mb-2 tracking-tight" style={{ lineHeight: 1.25 }}>
            {post.title}
          </h1>

          <div className="d-flex align-items-center gap-3 text-muted small font-monospace pb-3 border-bottom" style={{ fontSize: '12px' }}>
            <span className="d-flex align-items-center gap-1">
              <Calendar size={13} />
              {new Date(post.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <span className="d-flex align-items-center gap-1">
              <Eye size={13} /> {post.views || 0} views
            </span>
          </div>
        </div>

        {/* Cover Photo */}
        {coverSrc && (
          <div className="rounded-1 overflow-hidden mb-4 border shadow-xs" style={{ maxHeight: '420px' }}>
            <img 
              src={coverSrc} 
              alt={post.title} 
              className="w-100" 
              style={{ objectFit: 'cover', maxHeight: '420px' }} 
            />
          </div>
        )}

        {/* Article Content */}
        <div 
          className="article-body py-2" 
          style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#334155' }}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Bottom Technician CTA */}
        <div className="mt-5 p-4 rounded-1 bg-light border d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-1.5 text-dark fw-bold mb-1">
              <ShieldCheck size={18} className="text-danger" /> Need parts fitment confirmation?
            </div>
            <p className="text-muted small mb-0">Our counter mechanics can verify OEM vehicle specifications before order dispatch[cite: 8].</p>
          </div>
          <Link to="/contact" className="btn btn-dark btn-sm rounded-1 fw-semibold font-monospace px-3 py-2 flex-shrink-0">
            Contact Dispatch Desk
          </Link>
        </div>

      </div>
    </article>
  );
}