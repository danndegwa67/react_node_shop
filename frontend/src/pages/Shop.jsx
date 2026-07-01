import ProductCatalog from '../components/ProductCatalog';

function Shop() {
  return (
    <div class="container py-5">
      <div class="border-bottom pb-3 mb-4">
        <h1 class="h2 text-dark fw-bold mb-1">Parts & Component Catalog</h1>
        <p class="text-muted mb-0">Directly query our live inventory of nearly 4,000 genuine automotive components.</p>
      </div>
      
      {/* Dynamic filtering engine renders right here */}
      <ProductCatalog />
    </div>
  );
}

export default Shop;