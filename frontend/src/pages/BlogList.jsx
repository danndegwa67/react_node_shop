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
      setPosts(res.data.posts || []);
    })
    .catch(err => console.error("Error fetching articles:", err))
    .finally(() => setLoading(false));
  }, [search, category]);

  const categories = ['ALL', 'Fitment Guides', 'Maintenance', 'Market Insights', 'General'];

  const handleCardClick = (post) => {
    const target = post.slug ? post.slug : post.id;
    if (!target) {
      alert("This post has no valid slug or ID.");
      return;
    }
    navigate(`/blog/${target}`);
  };

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5">
      <div className="container text-start" style={{ maxWidth: '1200px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-4 mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Knowledge Base
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">
            Automotive Guides &amp; Fitment Articles
          </h1>
          <p className="text-secondary small mb-3" style={{ maxWidth: '620px' }}>
            Expert maintenance advice, genuine OEM compatibility instructions, and mechanical repair breakdowns from our Nairobi workshop technicians.
          </p>

          {/* Search + Category Filter Bar */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pt-2">
            <div className="d-flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`btn btn-sm rounded-1 px-3.5 py-1.5 font-monospace transition-all ${
                    category === cat 
                      ? 'btn-dark text-white fw-semibold' 
                      : 'btn-light text-secondary border'
                  }`}
                  style={{ fontSize: '12px' }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
              <span className="input-group-text bg-white border-end-0 text-muted px-2.5">
                <Search size={14} />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0 ps-0 shadow-none py-1.5" 
                placeholder="Search articles, models..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
                style={{ fontSize: '12.5px' }}
              />
            </div>
          </div>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="text-center py-5 border rounded-1 bg-white">
            <div className="spinner-border text-danger spinner-border-sm mb-2" role="status"></div>
            <p className="small text-muted mb-0 font-monospace">Loading guides...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-5 border rounded-1 bg-light">
            <BookOpen size={36} className="text-muted mb-2 opacity-50" />
            <h6 className="fw-bold text-dark mb-1">No Articles Published Yet</h6>
            <p className="text-muted small mb-0">Check back soon for new vehicle parts advice and fitment updates.</p>
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
                    className="card h-100 border rounded-1 shadow-xs overflow-hidden bg-white d-flex flex-column guide-card"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleCardClick(post)}
                  >
                    {coverSrc ? (
                      <div style={{ height: '180px', overflow: 'hidden' }} className="border-bottom">
                        <img 
                          src={coverSrc} 
                          alt={post.title} 
                          className="w-100 h-100 guide-img" 
                          style={{ objectFit: 'cover' }} 
                        />
                      </div>
                    ) : (
                      <div 
                        className="bg-light d-flex align-items-center justify-content-center text-muted border-bottom"
                        style={{ height: '180px' }}
                      >
                        <BookOpen size={30} className="opacity-40" />
                      </div>
                    )}

                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-light text-secondary border rounded-1 font-monospace" style={{ fontSize: '10.5px' }}>
                          {post.category || 'Guide'}
                        </span>
                        <span className="small text-muted font-monospace d-flex align-items-center gap-1" style={{ fontSize: '11px' }}>
                          <Calendar size={11} />
                          {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      <h6 className="fw-bold text-dark mb-2 text-clamp-2" style={{ fontSize: '14px', lineHeight: 1.4 }}>
                        {post.title}
                      </h6>

                      <p className="text-secondary small flex-grow-1 mb-3 text-clamp-3" style={{ fontSize: '12.5px', lineHeight: 1.55 }}>
                        {post.excerpt || 'Read the full guide for details, diagrams, and installation advice.'}
                      </p>

                      <div className="pt-2 border-top d-flex align-items-center justify-content-between text-danger font-monospace small fw-semibold">
                        <span>Read Breakdown</span>
                        <ArrowRight size={13} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      <style>{`
        .guide-card {
          transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .guide-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          border-color: #0f172a !important;
        }
        .guide-card:hover .guide-img {
          transform: scale(1.03);
        }
        .guide-img {
          transition: transform 0.3s ease;
        }
        .text-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .text-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}