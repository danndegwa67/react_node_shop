import ProductCatalog from '../components/ProductCatalog';

function Products() {
  return (
    <div class="container py-5">
      <div class="border-bottom pb-3 mb-4">
        <h1 class="h2 text-dark fw-bold mb-1">Spare Parts Catalog</h1>
        <p class="text-muted mb-0">Browse through Mhenik Traders' collection of verified mechanical inventory.</p>
      </div>
      
      {/* Dynamic engine connects and drops right here */}
      <ProductCatalog />
    </div>
  );
}

export default Products;