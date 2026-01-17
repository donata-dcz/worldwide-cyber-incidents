import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L, { type LeafletMouseEvent, type PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import mapData from "../data/countries.json";
import incidentsData from "../data/incidents.json";
import { iso2ToIso3 } from "../utils/countryCodes";
import type { Incidents } from "../types/incidents";
import Timeline from "./Timeline";

const getCountryISO3 = (feature: any): string | null => {
  return (
    feature.properties.ISO_A3 || feature.properties.ADM0_A3 || feature.properties?.["ISO3166-1-Alpha-3"] || feature.id || null
  );
};

const getColorByCount = (count: number): string => {
  if (count >= 50) return "#e04d4dff";
  if (count >= 20) return "#ffae16ff";
  if (count >= 1) return "#ffe064ff";
  return "#ffffffff";
};

const countIncidentsByCountryISO3 = (data: Incidents[]) => {
  const counts: Record<string, Incidents[]> = {};
  data.forEach((incident) => {
    const iso2 = incident.event.primaryLocation.toUpperCase();
    if (!iso2) return;
    const iso3 = iso2ToIso3[iso2];
    if (!iso3) return;
    if (!counts[iso3]) counts[iso3] = [];
    counts[iso3].push(incident);
  });
  return counts;
};

const regionCountries: Record<string, string[]> = {
  'Europe': ['FRA', 'DEU', 'GBR', 'ITA', 'ESP', 'POL', 'ROU', 'NLD', 'BEL', 'GRC', 'CZE', 'PRT', 'HUN', 'SWE', 'AUT', 'BGR', 'DNK', 'FIN', 'SVK', 'IRL', 'HRV', 'LTU', 'SVN', 'LVA', 'EST', 'CYP', 'LUX', 'MLT', 'NOR', 'CHE', 'ISL', 'ALB', 'MKD', 'SRB', 'BIH', 'MNE', 'UKR', 'BLR', 'MDA'],
  'North America': ['USA', 'CAN', 'MEX', 'GTM', 'CUB', 'HTI', 'DOM', 'HND', 'NIC', 'SLV', 'CRI', 'PAN', 'JAM', 'TTO', 'BHS', 'BRB'],
  'South America': ['BRA', 'ARG', 'COL', 'PER', 'VEN', 'CHL', 'ECU', 'BOL', 'PRY', 'URY', 'GUY', 'SUR'],
  'Africa': ['NGA', 'ETH', 'EGY', 'COD', 'TZA', 'ZAF', 'KEN', 'UGA', 'DZA', 'SDN', 'MAR', 'AGO', 'GHA', 'MOZ', 'MDG', 'CMR', 'CIV', 'NER', 'BFA', 'MLI', 'MWI', 'ZMB', 'SOM', 'SEN', 'TCD', 'ZWE', 'GIN', 'RWA', 'BEN', 'TUN', 'BDI', 'SSD', 'TGO', 'SLE', 'LBY', 'LBR', 'MRT', 'CAF', 'ERI', 'GMB', 'BWA', 'NAM', 'GAB', 'LSO', 'GNB', 'GNQ', 'MUS', 'SWZ', 'DJI', 'COM', 'CPV', 'STP', 'SYC'],
  'Oceania': ['AUS', 'PNG', 'NZL', 'FJI', 'SLB', 'NCL', 'PYF', 'VUT', 'WSM', 'KIR', 'TON', 'FSM', 'PLW', 'MHL', 'TUV', 'NRU'],
  'South Asia': ['IND', 'PAK', 'BGD', 'AFG', 'NPL', 'LKA', 'BTN', 'MDV'],
  'East Asia': ['CHN', 'JPN', 'KOR', 'TWN', 'MNG', 'PRK', 'HKG', 'MAC', 'VNM', 'THA', 'MMR', 'KHM', 'LAO', 'MYS', 'SGP', 'IDN', 'PHL', 'BRN', 'TLS']
};

function MapControls({ map, onRegionSelect }: { map: L.Map | null; onRegionSelect: (region: string) => void }) {
  const regions = [
    { label: 'World', coords: [20, 0, 2] as [number, number, number] },
    { label: 'Europe', coords: [48, 12.5, 4.3] as [number, number, number] },
    { label: 'North America', coords: [48, -100, 3.2] as [number, number, number] },
    { label: 'South America', coords: [-25, -60, 3.2] as [number, number, number] },
    { label: 'Africa', coords: [0, 22, 3.3] as [number, number, number] },
    { label: 'Oceania', coords: [-20, 135, 3.5] as [number, number, number] },
    { label: 'South Asia', coords: [28, 78, 4] as [number, number, number] },
    { label: 'East Asia', coords: [58, 105, 3.5] as [number, number, number] }
  ];

  const fly = (lat: number, lng: number, zoom: number, region: string) => {
    if (!map) return;
    map.flyTo([lat, lng], zoom);
    onRegionSelect(region);
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
    background: '#444269ff'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {regions.map((region, index) => (
        <button
          key={index}
          onClick={() => fly(region.coords[0], region.coords[1], region.coords[2], region.label)}
          style={buttonStyle}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {region.label}
        </button>
      ))}
    </div>
  );
}

export default function IncidentsMap() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [incidentsByCountry, setIncidentsByCountry] = useState<Record<string, Incidents[]>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    const result = countIncidentsByCountryISO3(incidentsData as Incidents[]);
    setIncidentsByCountry(result);
  }, []);

  const handleCountryClick = useCallback((iso3: string | null) => {
    setSelectedCountry(iso3);
    setSelectedRegion(null);
  }, []);

  const handleRegionSelect = useCallback((region: string) => {
    setSelectedCountry(null);
    setSelectedRegion(region === 'World' ? null : region);
  }, []);

  const countryStyle = (feature: any): PathOptions => {
    const iso3 = getCountryISO3(feature);
    const count = iso3 ? incidentsByCountry[iso3]?.length || 0 : 0;
    return {
      fillColor: getColorByCount(count),
      fillOpacity: 0.85,
      color: "#4b6b8aff",
      weight: 0.5,
    };
  };

  const onEachCountry = (feature: any, layer: L.Layer) => {
    const iso3 = getCountryISO3(feature);
    const name = feature.properties?.name_en || feature.properties?.ADMIN || "Unknown";
    const count = iso3 ? incidentsByCountry[iso3]?.length || 0 : 0;
    layer.bindPopup(`<strong>${name}</strong><br/>Incidents: ${count}`);
    layer.on({
      click: () => {
        if (iso3) handleCountryClick(iso3);
      },
      mouseover: (e: LeafletMouseEvent) => {
        (e.target as L.Path).setStyle({ weight: 1, fillOpacity: 1 });
      },
      mouseout: (e: LeafletMouseEvent) => {
        (e.target as L.Path).setStyle({ weight: 0.5, fillOpacity: 1 });
      },
    });
  };

  const displayedIncidents = useMemo(() => {
    if (selectedCountry) {
      return incidentsByCountry[selectedCountry] || [];
    }
    if (selectedRegion && regionCountries[selectedRegion]) {
      const regionIncidents: Incidents[] = [];
      regionCountries[selectedRegion].forEach(iso3 => {
        if (incidentsByCountry[iso3]) {
          regionIncidents.push(...incidentsByCountry[iso3]);
        }
      });
      return regionIncidents;
    }
    return Object.values(incidentsByCountry).flat();
  }, [selectedCountry, selectedRegion, incidentsByCountry]);

  const timelineTitle = useMemo(() => {
    if (selectedCountry) {
      return `Incidents Timeline - ${selectedCountry}`;
    }
    if (selectedRegion) {
      return `Incidents Timeline - ${selectedRegion}`;
    }
    return 'Global Incidents Timeline';
  }, [selectedCountry, selectedRegion]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      width: '100vw',
      background: '#0f172a', 
      margin: 0, 
      padding: 0,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 1001,
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '280px',
          background: "#1e293b",
          color: 'white',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #334155',
          zIndex: 1000
        }}
        className="sidebar"
        data-open={isMobileMenuOpen}>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              display: 'none',
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'transparent',
              color: 'white',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '4px'
            }}
            className="mobile-close-btn"
          >
            ×
          </button>
          <div style={{ 
            padding: '24px 20px 20px 20px',
            borderBottom: '1px solid #334155'
          }}>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: 0,
              color: 'white'
            }}>
              Worldwide Cyber Incidents
            </h1>
          </div>
          <div style={{ padding: '20px' }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              margin: '0 0 12px 0',
              color: '#7876f7ff'
            }}>
              Navigation
            </h2>
            <MapControls map={map} onRegionSelect={handleRegionSelect} />
          </div>
          <div style={{ 
            padding: '20px',
            borderTop: '1px solid #334155'
          }}>
            <h4 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              margin: '0 0 12px 0',
              color: '#7876f7ff'
            }}>
              Caption
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#e74c3c',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)'
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }}>Critical</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>50+ incidents</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#f39c12',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(243, 156, 18, 0.4)'
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }}>Medium</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>20-49 incidents</p>
                </div>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                padding: '8px',
                borderRadius: '8px'
              }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#f1c40f',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(241, 196, 15, 0.4)'
                }}></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: '0 0 2px 0' }}>Low</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>1-19 incidents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            ref={setMap}
            style={{ width: '100%', height: '100%', backgroundColor: "#d5e5ffff" }}
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
          >
            <GeoJSON
              data={mapData as any}
              style={countryStyle}
              onEachFeature={onEachCountry}
            />
          </MapContainer>
        </div>
      </div>
      <div style={{
        height: '180px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: 'white',
        borderTop: '2px solid #475569',
        boxShadow: '0 -4px 24px rgba(0,0,0,0.3)'
      }}
      className="timeline-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 24px',
          borderBottom: '1px solid #334155'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600',
            margin: 0
          }}>
            {timelineTitle}
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '400', 
              color: '#94a3b8', 
              marginLeft: '12px'
            }}>
              ({displayedIncidents.length} incident{displayedIncidents.length > 1 ? 's' : ''})
            </span>
          </h3>
          {(selectedCountry || selectedRegion) && (
            <button 
              onClick={() => {
                setSelectedCountry(null);
                setSelectedRegion(null);
              }}
              style={{
                padding: '8px 16px',
                background: '#334155',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#475569';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#334155';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Show All
            </button>
          )}
        </div>
        <div style={{ padding: '8px 24px', height: 'calc(100% - 50px)' }}>
          <Timeline incidents={displayedIncidents} />
        </div>
      </div>
      
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: block !important;
            }
            
            .sidebar {
              position: fixed !important;
              top: 0;
              left: -280px;
              bottom: 0;
              width: 280px !important;
              transition: left 0.3s ease;
              z-index: 1000;
            }
            
            .sidebar[data-open="true"] {
              left: 0;
            }
            
            .mobile-close-btn {
              display: block !important;
            }
            
            .timeline-container {
              height: 120px !important;
            }
            
            .timeline-container > div:first-child {
              padding: 4px 12px !important;
            }
            
            .timeline-container > div:first-child h3 {
              font-size: 13px !important;
            }
            
            .timeline-container > div:first-child span {
              font-size: 11px !important;
            }
            
            .timeline-container > div:first-child button {
              padding: 6px 12px !important;
              font-size: 11px !important;
            }
            
            .timeline-container > div:last-child {
              padding: 4px 12px !important;
              height: calc(100% - 40px) !important;
            }
          }
        `}
      </style>
    </div>
  );
}
