import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { sku } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${sku}`)
      .then((res) => res.json())
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setLoading(false);
      });
  }, [sku]);

  if (loading) return <div class="text-center py-5 text-muted fs-5">Loading item details...</div>;
  if (!product) return <div class="text-center py-5 text-danger fs-5 fw-bold">Product catalog entry not found.</div>;

  const whatsappMessage = encodeURIComponent(
    `Hello Mhenik Traders, I am inquiring about the product: ${product.product_name} (SKU: ${product.sku}). Is it currently available in stock?`
  );

  return (
    <div class="container py-5">
      <div class="card border-0 shadow-sm p-4 p-md-5 bg-white rounded-3">
        <div class="row g-5">
          
          {/* Left Column: Image Area */}
          <div class="col-md-5">
            <div class="product-img-container border rounded p-3 shadow-xs">
              <img 
                src={`http://localhost:5000/uploads/${product.sku}.jpg`} 
                alt={product.product_name}
                onError={(e) => { e.target.src = 'https://placehold.co/500x500?text=No+Photo+Available'; }}
                class="img-fluid"
              />
            </div>
          </div>

          {/* Right Column: Specification Area */}
          <div class="col-md-7 d-flex flex-column justify-content-between">
            <div>
              <span class="badge bg-primary text-uppercase px-3 py-2 mb-3 tracking-wider font-monospace">
                {product.category || 'General Component'}
              </span>
              <h1 class="h2 text-dark fw-bold mb-2">{product.product_name}</h1>
              <p class="text-muted mb-4 fs-6">Catalog Reference SKU: <strong class="text-dark font-monospace">{product.sku}</strong></p>
              
              <hr class="text-black-50 my-4" />
              
              <h5 class="fw-bold text-dark mb-2">Item Specifications & Description</h5>
              <p class="text-muted lh-base fs-5">
                {product.description || `Genuine automotive component tracking under standard manufacturing reference code ${product.sku}. Optimized for specific vehicle assembly guidelines.`}
              </p>
            </div>

            {/* CTA Communication Trigger */}
            <div class="mt-4">
              <a 
                href={`https://wa.me/254XXXXXXXXX?text=${whatsappMessage}`}
                target="_blank" 
                rel="noopener noreferrer"
                class="btn btn-success btn-lg fw-bold w-100 w-md-auto px-5 py-3 shadow-sm"
              >
                📥 Enquire Availability via WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetail;