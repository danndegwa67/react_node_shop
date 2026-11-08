import { useState, useEffect } from 'react';
import axios from 'axios';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { ArrowLeft, Save, UploadCloud, Bold, Italic, Heading2, List, Quote } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BlogEditor({ postId, onBack }) {
  const isEditing = Boolean(postId);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState('Fitment Guides');
  const [status, setStatus] = useState('DRAFT');
  const [coverImage, setCoverImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true }),
      Link.configure({ openOnClick: false })
    ],
    content: '<p>Start typing technical guides, part compatibility details, or customer notes...</p>',
  });

  useEffect(() => {
    if (isEditing) {
      axios.get(`${API_BASE}/api/posts/${postId}`).then(res => {
        const post = res.data;
        setTitle(post.title || '');
        setSlug(post.slug || '');
        setCategory(post.category || 'Fitment Guides');
        setStatus(post.status || 'DRAFT');
        setCoverImage(post.coverImage || '');
        setExcerpt(post.excerpt || '');
        if (editor && post.content) {
          editor.commands.setContent(post.content);
        }
      }).catch(err => {
        console.error('Failed to load post for editing:', err);
      });
    }
  }, [postId, editor, isEditing]);

  const handleTitleChange = (e) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, ''));
    }
  };

  const handleEditorImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('mhenik_staff_token');
      const res = await axios.post(`${API_BASE}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      const fullUrl = res.data.url.startsWith('http') ? res.data.url : `${API_BASE}${res.data.url}`;
      editor.chain().focus().setImage({ src: fullUrl }).run();
    } catch (err) {
      console.error("Body image upload detailed failure:", err.response?.data || err);
      alert(`Inline image upload failed: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('image', file);
  
    try {
      const token = localStorage.getItem('mhenik_staff_token');
      const res = await axios.post(`${API_BASE}/api/media/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      console.log("Cover upload response:", res.data);
      setCoverImage(res.data.url);
    } catch (err) {
      console.error("Cover upload detailed failure:", err.response?.data || err);
      alert(`Cover upload failed: ${err.response?.data?.error || err.message}`);
    }
  };
  
  const handleSave = async (forcedStatus) => {
    const postStatus = forcedStatus || status;
    if (!title.trim()) {
      alert('Please enter an article title.');
      return;
    }
  
    setSaving(true);
    const token = localStorage.getItem('mhenik_staff_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const payload = {
      title,
      slug,
      category,
      status: postStatus,
      coverImage,
      excerpt,
      content: editor ? editor.getHTML() : ''
    };
  
    try {
      let res;
      if (isEditing) {
        res = await axios.put(`${API_BASE}/api/posts/${postId}`, payload, { headers });
      } else {
        res = await axios.post(`${API_BASE}/api/posts`, payload, { headers });
      }
      console.log("Save post success:", res.data);
      onBack();
    } catch (err) {
      console.error("Save post detailed failure:", err.response?.data || err);
      alert(`Failed saving post: ${err.response?.data?.error || err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-mhenik bg-white overflow-hidden">
      {/* Top Controls Strip */}
      <div className="border-bottom p-3 d-flex justify-content-between align-items-center flex-wrap gap-2 bg-light">
        <div className="d-flex align-items-center gap-2">
          <button type="button" onClick={onBack} className="btn btn-sm btn-outline-dark rounded-mhenik fw-bold d-flex align-items-center gap-1">
            <ArrowLeft size={15} /> Back to List
          </button>
          <span className="badge bg-secondary rounded-mhenik ms-2 font-monospace" style={{ fontSize: '11px' }}>
            {status}
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button 
            type="button" 
            className="btn btn-outline-secondary btn-sm rounded-mhenik fw-bold"
            disabled={saving}
            onClick={() => handleSave('DRAFT')}
          >
            Save Draft
          </button>
          <button 
            type="button" 
            className="btn btn-primary btn-sm rounded-mhenik fw-bold d-flex align-items-center gap-1 shadow-sm"
            disabled={saving}
            onClick={() => handleSave('PUBLISHED')}
          >
            <Save size={15} /> Publish Live
          </button>
        </div>
      </div>

      <div className="p-3 p-md-4">
        <div className="row g-4">
          
          {/* Main Writing Canvas */}
          <div className="col-12 col-lg-8 border-end-lg">
            <input
              type="text"
              placeholder="Article title..."
              value={title}
              onChange={handleTitleChange}
              className="form-control form-control-lg border-0 fs-3 fw-bold p-0 mb-3 shadow-none"
              style={{ outline: 'none' }}
            />

            {/* Quick Floating Format Bar */}
            {editor && (
              <div className="d-flex flex-wrap gap-1 p-1 mb-3 bg-light rounded-mhenik border sticky-top" style={{ top: '10px', zIndex: 10 }}>
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`btn btn-xs ${editor.isActive('bold') ? 'btn-dark' : 'btn-light'}`}
                >
                  <Bold size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`btn btn-xs ${editor.isActive('italic') ? 'btn-dark' : 'btn-light'}`}
                >
                  <Italic size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={`btn btn-xs ${editor.isActive('heading', { level: 2 }) ? 'btn-dark' : 'btn-light'}`}
                >
                  <Heading2 size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={`btn btn-xs ${editor.isActive('bulletList') ? 'btn-dark' : 'btn-light'}`}
                >
                  <List size={14} />
                </button>
                <button 
                  type="button" 
                  onClick={() => editor.chain().focus().toggleBlockquote().run()}
                  className={`btn btn-xs ${editor.isActive('blockquote') ? 'btn-dark' : 'btn-light'}`}
                >
                  <Quote size={14} />
                </button>
                <label className="btn btn-xs btn-light mb-0 cursor-pointer" title="Insert image into body">
                  <UploadCloud size={14} />
                  <input type="file" accept="image/*" className="d-none" onChange={handleEditorImageUpload} />
                </label>
              </div>
            )}

            {/* Structured Editor Box with Scoped Focus Surface */}
            <div 
              className="border rounded-mhenik p-3 bg-white tiptap-editor-surface" 
              onClick={() => editor?.commands.focus()}
            >
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* Right WordPress Settings Sidebar */}
          <div className="col-12 col-lg-4">
            <h6 className="fw-bold small text-muted text-uppercase mb-3">Publication Meta</h6>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Status</label>
              <select className="form-select form-select-sm rounded-mhenik" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Custom URL Slug</label>
              <input 
                type="text" 
                className="form-control form-control-sm font-monospace rounded-mhenik" 
                value={slug} 
                onChange={(e) => setSlug(e.target.value)} 
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Category</label>
              <select className="form-select form-select-sm rounded-mhenik" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Fitment Guides">Fitment Guides</option>
                <option value="Maintenance">Maintenance & Care</option>
                <option value="Market Insights">Market Insights & Trends</option>
                <option value="General">General Updates</option>
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Featured Banner Image</label>
              {coverImage ? (
                <div className="position-relative rounded-mhenik overflow-hidden border mb-2">
                  <img src={coverImage.startsWith('http') ? coverImage : `${API_BASE}${coverImage}`} alt="Cover" className="img-fluid w-100" style={{ maxHeight: '130px', objectFit: 'cover' }} />
                  <button 
                    type="button" 
                    className="btn btn-xs btn-dark position-absolute bottom-0 end-0 m-1 rounded-mhenik"
                    onClick={() => setCoverImage('')}
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <label className="btn btn-sm btn-outline-secondary w-100 py-3 rounded-mhenik d-flex flex-column align-items-center justify-content-center border-dashed">
                  <UploadCloud size={20} className="text-muted mb-1" />
                  <span className="small">Upload Cover Photo</span>
                  <input type="file" accept="image/*" className="d-none" onChange={handleCoverUpload} />
                </label>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold text-muted">Google Excerpt (Meta Description)</label>
              <textarea 
                rows="3" 
                className="form-control form-control-sm rounded-mhenik" 
                placeholder="150 character summary for search engines..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}