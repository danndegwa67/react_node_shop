import { useState } from 'react';
import ProductCatalog from '../components/ProductCatalog';

export default function Shop() {
  const [vehicle, setVehicle] = useState({ make: '', model: '', year: '' });
  const [isVehicleLocked, setIsVehicleLocked] = useState(false);
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);

  const handleVehicleLookup = (e) => {
    e.preventDefault();
    if (vehicle.make && vehicle.model && vehicle.year) {
      setIsVehicleLocked(true);
    }
  };

  const handleResetVehicle = () => {
    setVehicle({ make: '', model: '', year: '' });
    setIsVehicleLocked(false);
  };

  return (
    <div className="container py-4">
      {/* 1. UNIFIED HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center border-bottom pb-3 mb-4 gap-3">
        <div>
          <h1 className="h2 text-dark fw-bold mb-1">Mhenik Spare Parts Store</h1>
          <p className="text-muted mb-0">Browse genuine automotive components or narrow down by your vehicle model.</p>
        </div>

        {/* Garage Toggle Button */}
        <div>
          <button
            type="button"
            className={`btn fw-bold rounded-mhenik px-3 py-2 transition-all ${
              isVehicleLocked 
                ? 'btn-success text-white' 
                : showVehicleSelector 
                  ? 'btn-dark' 
                  : 'btn-outline-dark'
            }`}
            onClick={() => setShowVehicleSelector(!showVehicleSelector)}
          >
            {isVehicleLocked 
              ? `🚗 ${vehicle.make} ${vehicle.model} (${vehicle.year}) ✓` 
              : showVehicleSelector 
                ? '✕ Close Vehicle Selector' 
                : ' Filter By Vehicle'}
          </button>
        </div>
      </div>

      {/* 2. OPTIONAL/COLLAPSIBLE VEHICLE GARAGE SELECTOR */}
      {(showVehicleSelector || isVehicleLocked) && (
        <div className="card border-0 shadow-sm p-4 bg-white rounded-mhenik mb-4 animate-fade-in">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-uppercase small fw-bold text-muted tracking-wider">
              Vehicle Compatibility Filter
            </span>
            {isVehicleLocked && (
              <span className="badge bg-success bg-opacity-10 text-success rounded-mhenik px-2 py-1 fs-7">
                Active Vehicle Filter Locked
              </span>
            )}
          </div>

          <form onSubmit={handleVehicleLookup} className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">1. Select Make</label>
              <select 
                className="form-select rounded-mhenik" 
                value={vehicle.make} 
                onChange={(e) => setVehicle({...vehicle, make: e.target.value, model: '', year: ''})} 
                disabled={isVehicleLocked}
              >
                <option value="">-- Choose Make --</option>
                <option value="Toyota">Toyota</option>
                <option value="Nissan">Nissan</option>
                <option value="Isuzu">Isuzu</option>
                <option value="Mitsubishi">Mitsubishi</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">2. Select Model</label>
              <select 
                className="form-select rounded-mhenik" 
                value={vehicle.model} 
                onChange={(e) => setVehicle({...vehicle, model: e.target.value})} 
                disabled={!vehicle.make || isVehicleLocked}
              >
                <option value="">-- Choose Model --</option>
                {vehicle.make === 'Toyota' && (
                  <>
                    <option value="Corolla">Corolla</option>
                    <option value="Prado">Prado Land Cruiser</option>
                    <option value="Hilux">Hilux</option>
                  </>
                )}
                {vehicle.make && vehicle.make !== 'Toyota' && (
                  <option value="Generic">Standard Fleet Model</option>
                )}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label small fw-bold text-muted">3. Select Year</label>
              <select 
                className="form-select rounded-mhenik" 
                value={vehicle.year} 
                onChange={(e) => setVehicle({...vehicle, year: e.target.value})} 
                disabled={!vehicle.model || isVehicleLocked}
              >
                <option value="">-- Choose Year --</option>
                <option value="2020">2020</option>
                <option value="2018">2018</option>
                <option value="2015">2015</option>
                <option value="2012">2012</option>
              </select>
            </div>

            <div className="col-md-3">
              {isVehicleLocked ? (
                <button 
                  type="button" 
                  className="btn btn-outline-danger rounded-mhenik w-100 py-2 fw-bold" 
                  onClick={handleResetVehicle}
                >
                  Reset Vehicle Filter
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-mhenik w-100 py-2 fw-bold" 
                  disabled={!vehicle.year}
                >
                  Apply Vehicle Lock
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ACTIVE VEHICLE BANNER */}
      {isVehicleLocked && (
        <div className="alert alert-info border-0 shadow-sm rounded-mhenik mb-4 d-flex justify-content-between align-items-center">
          <div>
            Showing compatibility matches for: <strong className="text-uppercase">{vehicle.make} {vehicle.model} ({vehicle.year})</strong>
          </div>
          <button type="button" className="btn-close" onClick={handleResetVehicle} aria-label="Close"></button>
        </div>
      )}

      {/* 3. CORE CATALOG & SEARCH ENGINE */}
      <ProductCatalog vehicleFilter={isVehicleLocked ? vehicle : null} />
    </div>
  );
}