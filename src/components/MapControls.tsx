import type { MapControlsProps } from "../types/incidents";

export function MapControls({ map }: MapControlsProps) {
  const regions = [
    { label: 'World', coords: [20, 0, 2], color: '#444269ff' },
    { label: 'Europe', coords: [48, 12.5, 4.3], color: '#444269ff' },
    { label: 'North America', coords: [48, -100, 3.2], color: '#444269ff' },
    { label: 'South America', coords: [-25, -60, 3.2], color: '#444269ff' },
    { label: 'Africa', coords: [0, 22, 3.3], color: '#444269ff' },
    { label: 'Oceania', coords: [-20, 135, 3.5], color: '#444269ff' },
    { label: 'South Asia', coords: [28, 78, 4], color: '#444269ff' },
    { label: 'East Asia', coords: [58, 105, 3.5], color: '#444269ff' }
  ];

  const fly = (lat: number, lng: number, zoom: number) => {
    if (!map) return;
    map.flyTo([lat, lng], zoom);
  };

    const buttonStyle = {
    width: '100%',
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 4px rgba(0,0,0,0)'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {regions.map((region, index) => (
        <button
          key={index}
          onClick={() => fly(region.coords[0], region.coords[1], region.coords[2])}
          style={{
            ...buttonStyle,
            background: `${region.color}`
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
