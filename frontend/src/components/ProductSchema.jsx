import { useEffect } from 'react';

export default function ProductSchema({ product }) {
  useEffect(() => {
    if (!product) return;

    const name = product.productName || product.product_name || "Automotive Spare Part";
    const price = product.sellingPrice || product.price || 4500;
    const sku = product.sku || "";
    const inStock = (product.stock || 0) > 0;
    const imageUrl = product.imageUrl || "https://cdn-icons-png.flaticon.com/512/744/744465.png";
    const category = product.category?.name || "Auto Parts";

    const schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": name,
      "image": [imageUrl],
      "description": `Genuine ${category} spare part available at Mhenik Traders Nairobi. SKU: ${sku}`,
      "sku": sku,
      "brand": {
        "@type": "Brand",
        "name": "Toyota / Generic OEM"
      },
      "offers": {
        "@type": "Offer",
        "url": window.location.href,
        "priceCurrency": "KES",
        "price": price.toString(),
        "availability": inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "seller": {
          "@type": "Organization",
          "name": "Mhenik Traders"
        }
      }
    };

    // Create or update script tag in document head
    let scriptTag = document.getElementById('product-jsonld');
    if (!scriptTag) {
      scriptTag = document.createElement('script');
      scriptTag.id = 'product-jsonld';
      scriptTag.type = 'application/ld+json';
      document.head.appendChild(scriptTag);
    }
    scriptTag.textContent = JSON.stringify(schemaData);

    return () => {
      // Clean up script on unmount
      if (scriptTag) {
        scriptTag.remove();
      }
    };
  }, [product]);

  return null;
}