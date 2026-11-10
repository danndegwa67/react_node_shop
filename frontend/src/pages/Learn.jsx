import { useState, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Html } from '@react-three/drei';
import { Link } from 'react-router-dom';
import { Layers, Eye, RotateCw, ShoppingBag, ArrowRight, Info, CheckCircle2 } from 'lucide-react';

/* ─── PROCEDURAL 3D SUSPENSION & BRAKE ASSEMBLY ─── */
function MechanicalAssembly({ exploded, activePart, onSelectPart }) {
  const groupRef = useRef();

  // Subtle idle breathing rotation when not interacting
  useFrame((state, delta) => {
    if (groupRef.current && !activePart) {
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  // Target explosion offsets (0 = assembled, 1 = exploded view)
  const factor = exploded ? 1 : 0;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      
      {/* 1. VENTED BRAKE ROTOR / DISC */}
      <group 
        position={[0, 0, factor * -1.4]} 
        onClick={(e) => { e.stopPropagation(); onSelectPart('rotor'); }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.15, 48]} />
          <meshStandardMaterial 
            color={activePart === 'rotor' ? "#ef4444" : "#94a3b8"} 
            metalness={0.85} 
            roughness={0.25} 
          />
        </mesh>
        {/* Hub Center Hat */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.12]}>
          <cylinderGeometry args={[1.0, 1.0, 0.22, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. 6-PISTON BRAKE CALIPER (Crimson Accent) */}
      <group 
        position={[factor * 1.6, factor * 0.8, factor * 0.9]} 
        onClick={(e) => { e.stopPropagation(); onSelectPart('caliper'); }}
      >
        <mesh position={[1.4, 0.9, 0]}>
          <boxGeometry args={[1.2, 1.8, 0.65]} />
          <meshStandardMaterial 
            color={activePart === 'caliper' ? "#b91c1c" : "#dc2626"} 
            metalness={0.4} 
            roughness={0.35} 
          />
        </mesh>
      </group>

      {/* 3. COIL SPRING & STRUT (Suspension Damper) */}
      <group 
        position={[factor * -1.8, factor * 1.8, factor * -0.5]} 
        onClick={(e) => { e.stopPropagation(); onSelectPart('strut'); }}
      >
        {/* Central Hydraulic Piston Shaft */}
        <mesh position={[-0.8, 1.2, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 3.2, 24]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
        </mesh>
        {/* Yellow / Gold Coil Spring */}
        <mesh position={[-0.8, 1.2, 0]}>
          <torusGeometry args={[0.75, 0.14, 16, 64]} />
          <meshStandardMaterial 
            color={activePart === 'strut' ? "#f59e0b" : "#eab308"} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[-0.8, 0.4, 0]}>
          <torusGeometry args={[0.75, 0.14, 16, 64]} />
          <meshStandardMaterial 
            color={activePart === 'strut' ? "#f59e0b" : "#eab308"} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
        <mesh position={[-0.8, 2.0, 0]}>
          <torusGeometry args={[0.75, 0.14, 16, 64]} />
          <meshStandardMaterial 
            color={activePart === 'strut' ? "#f59e0b" : "#eab308"} 
            metalness={0.6} 
            roughness={0.3} 
          />
        </mesh>
      </group>

      {/* 4. SUSPENSION TOP MOUNT & BUSHINGS */}
      <group 
        position={[factor * -1.8, factor * 3.4, factor * -0.5]} 
        onClick={(e) => { e.stopPropagation(); onSelectPart('mount'); }}
      >
        <mesh position={[-0.8, 2.8, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 0.35, 32]} />
          <meshStandardMaterial 
            color={activePart === 'mount' ? "#dc2626" : "#0f172a"} 
            metalness={0.7} 
            roughness={0.4} 
          />
        </mesh>
      </group>

    </group>
  );
}

/* ─── DATA MATRIX FOR INTERACTIVE MECHANICAL PARTS ─── */
const PART_DETAILS = {
  rotor: {
    id: 'rotor',
    name: 'Ventilated Cross-Drilled Brake Rotor',
    category: 'Braking & Rotors',
    code: 'BR-PRADO-VENT-120',
    compatible: 'Toyota Land Cruiser Prado 120 / 150 Series, Hilux Revo',
    desc: 'High-carbon cast iron rotor designed with directional cooling vanes. Eliminates thermal brake fade under heavy descent towing and fleet load strains.',
    specs: ['Diameter: 338mm', 'Thickness: 32mm Vented', 'Material: G3000 Gray Iron', 'Bolt Pattern: 6x139.7'],
    catalogKeyword: 'Mirror' // Search bridge to current catalog
  },
  caliper: {
    id: 'caliper',
    name: 'Heavy-Duty 4-Piston Hydraulic Caliper',
    category: 'Hydraulic Actuation',
    code: 'CP-SPORT-6P-49',
    compatible: 'Universal Commercial & Heavy 4x4 Axles',
    desc: 'Forged aluminum monobloc body providing rigid, non-flex clamp force across ceramic pads. Engineered with heat-resistant Viton dust seals for dusty East African trail conditions.',
    specs: ['Piston Count: 4 Radial Piston', 'Fluid: DOT 4 / 5.1 Compatible', 'Body: 6061-T6 Monobloc Alloy'],
    catalogKeyword: 'Bumper'
  },
  strut: {
    id: 'strut',
    name: 'Heavy-Duty Twin-Tube Nitrogen Gas Damper',
    category: 'Suspension & Shock Absorbers',
    code: 'SUSP-COIL-TT-450',
    compatible: 'Prado 120 / 150, Nissan Patrol Y61 / Y62, Isuzu D-Max',
    desc: 'Multi-stage velocity-sensitive valving pre-charged with high-pressure nitrogen gas. Dampens harsh corrugations while preventing hydraulic cavitation on unpaved bypass routes.',
    specs: ['Piston Rod: 18mm Hard Chrome', 'Body: 54mm Twin-Tube Reserve', 'Coil: High-Tensile CrSi Spring Steel'],
    catalogKeyword: 'Prado'
  },
  mount: {
    id: 'mount',
    name: 'Reinforced Strut Top Mount & Polyurethane Bushing',
    category: 'Chassis & Bushing Kits',
    code: 'MNT-TOP-HD-88',
    compatible: 'Toyota Fleet Chassis (Hilux, Prado, HiAce)',
    desc: 'High-durometer natural rubber bonded with laser-cut steel top plate. Isolates suspension impact vibrations from entering the chassis cabin.',
    specs: ['Durometer: 75 Shore A', 'Hardware: Grade 10.9 Zinc Coated Bolts'],
    catalogKeyword: 'Weatherstrip'
  }
};

export default function Learn() {
  const [exploded, setExploded] = useState(false);
  const [selectedPartKey, setSelectedPartKey] = useState('rotor');

  const activePart = PART_DETAILS[selectedPartKey] || PART_DETAILS.rotor;

  return (
    <div className="bg-white min-vh-100 py-3 py-md-4 text-start">
      <div className="container" style={{ maxWidth: '1240px' }}>
        
        {/* Editorial Header */}
        <div className="border-bottom pb-3 mb-4">
          <div className="d-inline-flex align-items-center gap-2 px-2 py-0.5 mb-2 border rounded-1 bg-white shadow-xs">
            <span className="badge bg-danger rounded-1 p-1"></span>
            <span className="small text-uppercase font-monospace fw-bold text-secondary" style={{ fontSize: '11px', letterSpacing: '1px' }}>
              Interactive Visualizer
            </span>
          </div>
          <h1 className="h3 text-dark fw-light mb-1 tracking-tight">
            Vehicle Mechanism &amp; Exploded Parts Simulator
          </h1>
          <p className="text-secondary small mb-0">
            Rotate, disassemble, and inspect OEM suspension and braking assemblies to verify mechanical fitment before ordering.
          </p>
        </div>

        {/* 3D Canvas + Technical Telemetry Rail */}
        <div className="row g-4 align-items-stretch">
          
          {/* Left Canvas: 3D Viewport */}
          <div className="col-lg-8">
            <div 
              className="position-relative w-100 border rounded-1 overflow-hidden shadow-xs bg-light"
              style={{ height: '540px', background: 'radial-gradient(circle at 50% 50%, #ffffff 0%, #f1f5f9 100%)' }}
            >
              
              {/* Canvas Controls Toolbar */}
              <div className="position-absolute top-0 start-0 m-3 d-flex gap-2" style={{ zIndex: 10 }}>
                <button
                  type="button"
                  onClick={() => setExploded(!exploded)}
                  className={`btn btn-sm rounded-1 px-3 py-1.5 font-monospace fw-semibold d-inline-flex align-items-center gap-2 shadow-xs transition-all ${
                    exploded ? 'btn-danger text-white' : 'btn-white bg-white text-dark border'
                  }`}
                  style={{ fontSize: '11.5px' }}
                >
                  <Layers size={13} />
                  {exploded ? 'Collapse Assembly' : 'Explode View'}
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedPartKey(null); }}
                  className="btn btn-sm btn-white bg-white border rounded-1 px-3 py-1.5 font-monospace fw-semibold text-secondary d-none d-sm-inline-flex align-items-center gap-1.5 shadow-xs"
                  style={{ fontSize: '11.5px' }}
                >
                  <RotateCw size={12} /> Auto-Rotate
                </button>
              </div>

              {/* Interaction Hint Badge */}
              <div className="position-absolute bottom-0 start-0 m-3 px-2.5 py-1 bg-white border rounded-1 font-monospace small text-muted shadow-xs d-flex align-items-center gap-1.5" style={{ fontSize: '11px', zIndex: 10 }}>
                <Eye size={12} className="text-danger" /> Drag to Orbit • Scroll to Zoom • Click Component
              </div>

              {/* Three.js R3F Canvas */}
              <Canvas camera={{ position: [4.5, 3.2, 5.5], fov: 42 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 15, 8]} intensity={1.2} castShadow />
                <directionalLight position={[-8, -5, -4]} intensity={0.4} color="#94a3b8" />
                <Suspense fallback={null}>
                  <Float speed={exploded ? 0 : 1.2} rotationIntensity={0.2} floatIntensity={0.3}>
                    <MechanicalAssembly 
                      exploded={exploded} 
                      activePart={selectedPartKey} 
                      onSelectPart={(key) => setSelectedPartKey(key)} 
                    />
                  </Float>
                </Suspense>
                <OrbitControls 
                  enablePan={false} 
                  minDistance={3.5} 
                  maxDistance={10} 
                  maxPolarAngle={Math.PI / 2 + 0.15} 
                />
              </Canvas>

            </div>
          </div>

          {/* Right Rail: Technical Telemetry & Compatibility Inspector */}
          <div className="col-lg-4">
            <div className="border rounded-1 p-3.5 p-md-4 bg-white shadow-xs h-100 d-flex flex-column justify-content-between">
              
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                  <span className="small text-uppercase font-monospace fw-bold text-muted" style={{ fontSize: '11px' }}>
                    Component Inspection
                  </span>
                  <span className="badge bg-danger bg-opacity-10 text-danger rounded-1 font-monospace" style={{ fontSize: '10px' }}>
                    OEM Traceable
                  </span>
                </div>

                {/* Part Title */}
                <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.25rem', lineHeight: 1.3 }}>
                  {activePart.name}
                </h5>
                <span className="badge bg-light text-secondary font-monospace border mb-3" style={{ fontSize: '10.5px' }}>
                  REF: {activePart.code}
                </span>

                {/* Compatibility Target */}
                <div className="p-2.5 bg-light rounded-1 border mb-3 small">
                  <strong className="text-dark d-block mb-1 font-monospace" style={{ fontSize: '11px' }}>
                    Chassis Compatibility:
                  </strong>
                  <span className="text-secondary">{activePart.compatible}</span>
                </div>

                {/* Engineering Overview */}
                <p className="text-secondary small mb-3 lh-base" style={{ fontSize: '13px' }}>
                  {activePart.desc}
                </p>

                {/* Technical Specs Checklist */}
                <h6 className="fw-bold text-dark font-monospace text-uppercase mb-2 small" style={{ fontSize: '11px', letterSpacing: '0.8px' }}>
                  Technical Parameters
                </h6>
                <div className="d-flex flex-column gap-1.5 mb-4">
                  {activePart.specs.map((spec, i) => (
                    <div key={i} className="small text-muted font-monospace d-flex align-items-center gap-2" style={{ fontSize: '11.5px' }}>
                      <CheckCircle2 size={13} className="text-success flex-shrink-0" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons to Direct Catalog Search */}
              <div className="pt-3 border-top d-flex flex-column gap-2">
                <Link
                  to={`/shop`}
                  className="btn btn-dark rounded-1 font-monospace fw-semibold py-2.5 d-flex align-items-center justify-content-center gap-2 shadow-xs"
                  style={{ fontSize: '13px' }}
                >
                  <ShoppingBag size={14} /> View in Spare Catalog <ArrowRight size={14} />
                </Link>
                <Link
                  to="/contact"
                  className="btn btn-outline-secondary rounded-1 font-monospace btn-sm py-2 text-center"
                  style={{ fontSize: '11.5px' }}
                >
                  Ask Technician About Sizing
                </Link>
              </div>

            </div>
          </div>

        </div>

        {/* Assembly Component Selector Strip */}
        <div className="mt-4 pt-3 border-top">
          <span className="small text-muted font-monospace text-uppercase fw-bold d-block mb-2" style={{ fontSize: '11px' }}>
            Jump to Assembly Section:
          </span>
          <div className="d-flex flex-wrap gap-2">
            {Object.values(PART_DETAILS).map((part) => (
              <button
                key={part.id}
                type="button"
                onClick={() => setSelectedPartKey(part.id)}
                className={`btn btn-sm rounded-1 px-3 py-1.5 font-monospace transition-all ${
                  selectedPartKey === part.id 
                    ? 'btn-danger text-white fw-bold shadow-xs' 
                    : 'btn-light text-secondary border'
                }`}
                style={{ fontSize: '12px' }}
              >
                {part.name.split(' ')[0]} ({part.category.split(' ')[0]})
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}