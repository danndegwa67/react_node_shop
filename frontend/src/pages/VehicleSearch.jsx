import { useState } from 'react';
import ProductCatalog from '../components/ProductCatalog';

function VehicleSearch() {
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '' });
  const [isLocked, setIsLocked] = useState(false);

  const handleLookup = (e) => {
    e.preventDefault();
    if (vehicle.make && vehicle.model) {
      setIsLocked(true);
    }
  };

  return (
    <div class="container py-5">
      <div class="border-bottom pb-3 mb-4">
        <h1 class="h2 text-dark fw-bold mb-1">Vehicle Compatibility Search</h1>
        <p class="text-muted mb-0">Select your specific vehicle attributes to find direct replacement matches.</p>
      </div>

      {/* Selector Panel */}
      <div class="card border-0 shadow-sm p-4 bg-white rounded-3 mb-4">
        <form onSubmit={handleLookup} class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">1. Select Make</label>
            <select class="form-select" value={vehicle.make} onChange={(e) => setVehicle({...vehicle, make: e.target.value})} disabled={isLocked}>
              <option value="">-- Choose Make --</option>
              <option value="Toyota">Toyota</option>
              <option value="Nissan">Nissan</option>
              <option value="Isusu">Isuzu</option>
              <option value="Mitsubishi">Mitsubishi</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">2. Select Model</label>
            <select class="form-select" value={vehicle.model} onChange={(e) => setVehicle({...vehicle, model: e.target.value})} disabled={!vehicle.make || isLocked}>
              <option value="">-- Choose Model --</option>
              {vehicle.make === 'Toyota' && (
                <>
                  <option value="Corolla">Corolla</option>
                  <option value="Prado">Prado Land Cruiser</option>
                  <option value="Hilux">Hilux</option>
                </>
              )}
              {vehicle.make !== 'Toyota' && <option value="Generic">Standard Fleet Model</option>}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">3. Select Year</label>
            <select class="form-select" value={vehicle.year} onChange={(e) => setVehicle({...vehicle, year: e.target.value})} disabled={!vehicle.model || isLocked}>
              <option value="">-- Choose Year --</option>
              <option value="2020">2020</option>
              <option value="2018">2018</option>
              <option value="2015">2015</option>
              <option value="2012">2012</option>
            </select>
          </div>
          <div class="col-md-3">
            {isLocked ? (
              <button type="button" class="btn btn-danger w-100 py-2 fw-bold" onClick={() => setIsLocked(false)}>
                Reset Search Frame
              </button>
            ) : (
              <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" disabled={!vehicle.year}>
                Find Matching Parts
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Dynamic Compatibility Content Delivery */}
      {isLocked && (
        <div class="alert alert-info border-0 shadow-xs mb-4">
          Showing parts compatible with: <strong class="text-uppercase">{vehicle.make} {vehicle.model} ({vehicle.year})</strong>
        </div>
      )}

      <ProductCatalog />
    </div>
  );
}

export default VehicleSearch;