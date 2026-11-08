import { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit3, Trash2, Plus, Search, ExternalLink } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogManager({ onAddNew, onEditPost }) {
  const [posts, setPosts] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ total: 0, published: 0, drafts: 0 });
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/posts`, {
        params: { status: statusFilter, search }
      });
      setPosts(res.data.posts || []);
      setCounts({
        total: res.data.total || 0,
        published: res.data.publishedCount || 0,
        drafts: res.data.draftCount || 0
      });
    } catch (err) {
      console.error('Error fetching blog list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [statusFilter, search]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const token = localStorage.getItem('mhenik_staff_token');
      await axios.delete(`${API_BASE}/api/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      fetchPosts();
    } catch (err) {
      alert('Failed to delete post.');
    }
  };

  return (
    <div className="card border-0 shadow-sm p-3 rounded-mhenik bg-white">
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h3 className="h6 fw-bold text-dark mb-1">Knowledge Base & Spares Guides</h3>
          <p className="text-muted small mb-0">Publish technical writeups, repair advisories, and fitment tips.</p>
        </div>
        {/* Uses onAddNew callback instead of Link to /admin/blog/new */}
        <button 
          type="button" 
          onClick={onAddNew} 
          className="btn btn-primary btn-sm fw-bold rounded-mhenik d-flex align-items-center gap-1 shadow-sm"
        >
          <Plus size={16} /> Add New Post
        </button>
      </div>

      {/* Status Filter Tabs & Search */}
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div className="d-flex gap-1 flex-wrap">
          <button 
            type="button" 
            className={`btn btn-sm rounded-mhenik fw-bold ${statusFilter === 'ALL' ? 'btn-dark' : 'btn-light text-secondary'}`}
            onClick={() => setStatusFilter('ALL')}
          >
            All ({counts.total})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm rounded-mhenik fw-bold ${statusFilter === 'PUBLISHED' ? 'btn-dark' : 'btn-light text-secondary'}`}
            onClick={() => setStatusFilter('PUBLISHED')}
          >
            Published ({counts.published})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm rounded-mhenik fw-bold ${statusFilter === 'DRAFT' ? 'btn-dark' : 'btn-light text-secondary'}`}
            onClick={() => setStatusFilter('DRAFT')}
          >
            Drafts ({counts.drafts})
          </button>
        </div>

        <div className="input-group input-group-sm" style={{ maxWidth: '260px' }}>
          <span className="input-group-text bg-light border-end-0"><Search size={14} className="text-muted" /></span>
          <input
            type="text"
            className="form-control border-start-0 rounded-end-mhenik"
            placeholder="Search guides..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Posts Table */}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0" style={{ minWidth: '650px' }}>
          <thead className="table-light">
            <tr>
              <th style={{ width: '45%' }}>Article Title</th>
              <th>Category</th>
              <th>Created</th>
              <th>Views</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted small">Loading knowledge base records...</td>
              </tr>
            ) : posts.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-4 text-muted small">No articles or fitment drafts found.</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong className="text-dark d-block text-break" style={{ fontSize: '13px' }}>{post.title}</strong>
                    <div className="d-flex align-items-center gap-2 mt-1">
                      <span className={`badge rounded-mhenik ${post.status === 'DRAFT' ? 'bg-warning text-dark' : 'bg-success text-white'}`} style={{ fontSize: '10px' }}>
                        {post.status}
                      </span>
                      <span className="font-monospace text-muted small" style={{ fontSize: '11px' }}>/{post.slug}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border rounded-mhenik" style={{ fontSize: '11px' }}>
                      {post.category || 'General'}
                    </span>
                  </td>
                  <td className="small text-muted font-monospace">
                    {new Date(post.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="small font-monospace fw-bold">{post.views || 0}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-1">
                      {post.status === 'PUBLISHED' && (
                        <a 
                          href={`/blog/${post.slug}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn btn-sm btn-outline-secondary rounded-mhenik px-2 py-1"
                          title="View Live Guide"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      {/* Uses onEditPost callback instead of Link to /admin/blog/edit/:id */}
                      <button 
                        type="button" 
                        onClick={() => onEditPost(post.id)} 
                        className="btn btn-sm btn-outline-dark rounded-mhenik px-2 py-1 fw-bold"
                        title="Edit Article"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                      <button 
                        type="button" 
                        onClick={() => handleDelete(post.id, post.title)} 
                        className="btn btn-sm btn-outline-danger rounded-mhenik px-2 py-1"
                        title="Delete Article"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}