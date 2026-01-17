import { regions } from "../utils/countries";

export function MapControls({ map, onRegionSelect }: { map: L.Map | null; onRegionSelect: (region: string) => void }) {
  const fly = (lat: number, lng: number, zoom: number, region: string) => {
    if (!map)
      return;
    map.flyTo([lat, lng], zoom);
    onRegionSelect(region);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {regions.map((region, index) => (
        <button
          key={index}
          onClick={() => fly(region.coords[0], region.coords[1], region.coords[2], region.label)}
          style={{
            width: '100%',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: '500',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            transition: 'all 0.2s',
            background: '#444269ff'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {region.label}
        </button>
      ))}
    </div>
  );
}
