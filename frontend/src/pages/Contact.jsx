import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ShieldCheck } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const whatsappMsg = `Hello Mhenik Traders! 👋\n` +
      `*Name:* ${formData.name}\n` +
      `*Phone:* ${formData.phone}\n` +
      `*Subject:* ${formData.subject || 'General Inquiry'}\n\n` +
      `*Message:* ${formData.message}`;
    
    window.open(`https://wa.me/254716687687?text=${encodeURIComponent(whatsappMsg)}`, '_blank', 'noopener,noreferrer');
    setSubmitted(true);
  };

  return (
    <div className="bg-white min-vh-100 py-4 py-md-5">
      <div className="container text-start" style={{ maxWidth: '1160px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Dispatch Desk &amp; Inquiries
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">
            Contact &amp; Customer Support
          </h1>
          <p className="text-secondary small mb-0">
            Reach our technicians for part compatibility, order fulfillment, or visit our Nairobi trade counter.
          </p>
        </div>

        <div className="row g-4 mb-5">
          {/* Left: Contact Info + Map */}
          <div className="col-lg-5 d-flex flex-column gap-3">
            <div className="border rounded-1 p-4 bg-white shadow-xs">
              <h6 className="fw-bold text-dark font-monospace text-uppercase mb-3 small" style={{ letterSpacing: '0.8px' }}>
                Trade Counter Information
              </h6>
              
              <div className="d-flex flex-column gap-3 small text-secondary">
                {/* 1. Store Location */}
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center text-danger flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Physical Store</strong>
                    <span>49 Kirinyaga Rd, Nairobi CBD, Kenya</span>
                  </div>
                </div>

                {/* 2. Direct Lines */}
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center text-danger flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Direct Lines</strong>
                    <span>+254 716 687687</span>
                  </div>
                </div>

                {/* 3. Email Dispatch */}
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center text-danger flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Email Dispatch</strong>
                    <span>mhenikt@gmail.com</span>
                  </div>
                </div>

                {/* 4. Business Hours */}
                <div className="d-flex align-items-start gap-3">
                  <div className="d-flex align-items-center justify-content-center text-danger flex-shrink-0" style={{ width: '24px', height: '24px' }}>
                    <Clock size={18} />
                  </div>
                  <div>
                    <strong className="text-dark d-block">Business Hours</strong>
                    <span>Monday – Saturday: 8:00 AM – 5:00 PM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Location Map */}
            <div className="border rounded-1 overflow-hidden shadow-xs flex-grow-1" style={{ minHeight: '260px' }}>
              <iframe
                title="Mhenik Traders Location"
                src="https://maps.google.com/maps?q=MHENIK+TRADERS+49+Kirinyaga+Rd+Nairobi&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '260px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="col-lg-7">
            <div className="border rounded-1 p-4 bg-white shadow-xs h-100">
              <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                <h6 className="fw-bold text-dark font-monospace text-uppercase mb-0 small" style={{ letterSpacing: '0.8px' }}>
                  Send Dispatch Message
                </h6>
                <span className="badge bg-light text-secondary border rounded-1 font-monospace px-2 py-1" style={{ fontSize: '10px' }}>
                  Instant WhatsApp Sync
                </span>
              </div>

              {submitted ? (
                <div className="alert alert-success border-0 rounded-1 p-4 text-center my-4">
                  <ShieldCheck size={32} className="text-success mb-2" />
                  <h6 className="fw-bold mb-1">Message Dispatched!</h6>
                  <p className="small mb-0">Our counter technicians have received your message and will follow up promptly.</p>
                  <button 
                    type="button" 
                    className="btn btn-sm btn-outline-dark rounded-1 px-4 py-2 mt-3" 
                    onClick={() => setSubmitted(false)}
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Full Name *</label>
                    <input 
                      type="text" 
                      required 
                      className="form-control form-control-sm rounded-1 shadow-none px-3 py-2"
                      placeholder="e.g., Name here"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Phone Number *</label>
                    <input 
                      type="tel" 
                      required 
                      className="form-control form-control-sm rounded-1 shadow-none px-3 py-2"
                      placeholder="e.g., +254 7XX XXX XXX"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Email Address (Optional)</label>
                    <input 
                      type="email" 
                      className="form-control form-control-sm rounded-1 shadow-none px-3 py-2"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Inquiry Topic</label>
                    <input 
                      type="text" 
                      className="form-control form-control-sm rounded-1 shadow-none px-3 py-2"
                      placeholder="e.g., Prado Suspension Bushings"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small text-muted font-monospace mb-1" style={{ fontSize: '11px' }}>Message / Required Spares *</label>
                    <textarea 
                      rows={5}
                      required 
                      className="form-control form-control-sm rounded-1 shadow-none p-3"
                      placeholder="Specify part names, vehicle model, chassis code, or questions..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="col-12 pt-2">
                    <button 
                      type="submit" 
                      className="btn btn-dark rounded-1 fw-semibold d-inline-flex align-items-center gap-2 px-4 py-2.5 shadow-xs"
                      style={{ fontSize: '13px' }}
                    >
                      <Send size={14} /> Send Message to Parts Desk
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}