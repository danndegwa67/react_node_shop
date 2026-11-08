import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, ArrowRight, Search, BookOpen } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogList() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/posts`, {
      params: { 
        status: 'PUBLISHED', 
        search, 
        ...(category !== 'ALL' && { category }) 
      }
    })
    .then(res => {
      console.log("Fetched published posts:", res.data.posts);
      setPosts(res.data.posts || []);
    })
    .catch(err => console.error("Error fetching articles:", err))
    .finally(() => setLoading(false));
  }, [search, category]);

  const categories = ['ALL', 'Fitment Guides', 'Maintenance', 'Market Insights', 'General'];

  const handleCardClick = (post) => {
    // If slug is missing for an old record, fallback to id
    const target = post.slug ? post.slug : post.id;
    console.log("Navigating to article:", target);
    if (!target) {
      alert("This post has no valid slug or ID.");
      return;
    }
    navigate(`/blog/${target}`);
  };

  return (
    <div className="container py-4 py-md-5" style={{ minHeight: '80vh', maxWidth: '1100px' }}>
      {/* Hero Header */}
      <div className="text-center mb-5">
        <span className="badge bg-primary bg-opacity-10 text-primary fw-bold px-3 py-2 rounded-mhenik mb-2">
          Mhenik Knowledge Base
        </span>
        <h1 className="fw-bold text-dark mb-2">Auto Blogs & Fitment Guides</h1>
        <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
          Expert maintenance advice, genuine OEM compatibility instructions, and vehicle repair breakdowns from our technicians.
        </p>

        {/* Search & Category Pills */}
        <div className="d-flex justify-content-center mt-4">
          <div className="input-group mb-3 shadow-xs" style={{ maxWidth: '420px' }}>
            <span className="input-group-text bg-white border-end-0">
              <Search size={16} className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0" 
              placeholder="Search guides, parts, models..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="d-flex justify-content-center gap-1 flex-wrap mt-1">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`btn btn-sm rounded-mhenik fw-semibold px-3 ${category === cat ? 'btn-dark' : 'btn-light text-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Articles */}
      {loading ? (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border text-primary mb-2" role="status"></div>
          <p className="small">Loading guides...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-5 border rounded-mhenik bg-light">
          <BookOpen size={40} className="text-muted mb-2" />
          <h5 className="fw-bold text-dark">No Articles Published Yet</h5>
          <p className="text-muted small">Check back soon for new vehicle parts advice and fitment updates.</p>
        </div>
      ) : (
        <div className="row g-4">
          {posts.map(post => {
            const rawCover = post.coverImage;
            const coverSrc = rawCover
              ? (rawCover.startsWith('http') ? rawCover : `${API_BASE}${rawCover}`)
              : null;

            return (
              <div key={post.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="card h-100 border-0 shadow-sm rounded-mhenik overflow-hidden bg-white d-flex flex-column"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCardClick(post)}
                >
                  {coverSrc ? (
                    <div style={{ height: '190px', overflow: 'hidden' }}>
                      <img 
                        src={coverSrc} 
                        alt={post.title} 
                        className="w-100 h-100" 
                        style={{ objectFit: 'cover' }} 
                      />
                    </div>
                  ) : (
                    <div 
                      className="bg-light d-flex align-items-center justify-content-center text-muted"
                      style={{ height: '190px' }}
                    >
                      <BookOpen size={32} className="opacity-50" />
                    </div>
                  )}

                  <div className="p-3 p-md-4 d-flex flex-column flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-light text-dark border rounded-mhenik" style={{ fontSize: '11px' }}>
                        {post.category || 'Guide'}
                      </span>
                      <span className="small text-muted d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                        <Calendar size={12} />
                        {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.1rem', lineHeight: 1.4 }}>
                      {post.title}
                    </h5>

                    <p className="text-muted small flex-grow-1 mb-3" style={{ lineHeight: 1.6 }}>
                      {post.excerpt || 'Read the full guide for details, diagrams, and installation advice.'}
                    </p>

                    <button 
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(post);
                      }}
                      className="btn btn-link p-0 text-primary fw-bold text-decoration-none small d-flex align-items-center gap-1 mt-auto text-start"
                    >
                      Read Article <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}