import ProductCatalog from '../components/ProductCatalog';

export default function Shop() {
  return (
    <div className="bg-white min-vh-100 py-3 py-md-4">
      {/* Centered, narrow layout container matching Home */}
      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4 text-start">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Commercial Inventory
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">
            Spare Parts Catalog
          </h1>
          <p className="text-secondary small mb-0">
            Browse genuine authenticated automotive components or narrow down by vehicle chassis.
          </p>
        </div>

        {/* Product Catalog Core */}
        <ProductCatalog />
      </div>
    </div>
  );
}