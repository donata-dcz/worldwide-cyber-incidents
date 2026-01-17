import { useEffect, useState, useCallback, useMemo } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";
import L, { type LeafletMouseEvent, type PathOptions } from "leaflet";
import "leaflet/dist/leaflet.css";
import mapData from "../data/countries.json";
import incidentsData from "../data/incidents.json";
import { iso2ToIso3, regionCountries } from "../utils/countries";
import type { Incidents } from "../types/incidents";
import Timeline from "./Timeline";
import { MapControls } from "./MapControls";

const getCountryISO3 = (feature: any): string | null => {
  return (
    feature.properties.ISO_A3 || feature.properties.ADM0_A3 || feature.properties?.["ISO3166-1-Alpha-3"] || feature.id || null
  );
};

const getColorByCount = (count: number): string => {
  if (count >= 50)
    return "#e04d4dff";
  if (count >= 20)
    return "#ffae16ff";
  if (count >= 1)
    return "#ffe064ff";
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

export default function IncidentsMap() {
  const [map, setMap] = useState<L.Map | null>(null);
  const [incidentsByCountry, setIncidentsByCountry] = useState<Record<string, Incidents[]>>({});
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedAttackTypes, setSelectedAttackTypes] = useState<string[]>([]);
  const [showAttackFilter, setShowAttackFilter] = useState<boolean>(false);

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
  const attackTypes = useMemo(() => {
    const types = new Set<string>();
    Object.values(incidentsByCountry).flat().forEach(inc => {
      if (inc.attack.type) types.add(inc.attack.type);
    });
    return Array.from(types).sort();
  }, [incidentsByCountry]);
  const countryStyle = (feature: any): PathOptions => {
    const iso3 = getCountryISO3(feature);
    const count = iso3 ? filteredIncidentsByCountry[iso3]?.length || 0 : 0;
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
    const count = iso3 ? filteredIncidentsByCountry[iso3]?.length || 0 : 0;
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
  const filteredIncidentsByCountry = useMemo(() => {
    if (selectedAttackTypes.length === 0)
      return incidentsByCountry;
    const filtered: Record<string, Incidents[]> = {};
    Object.entries(incidentsByCountry).forEach(([iso3, incidents]) => {
      const filteredIncidents = incidents.filter(inc => 
        selectedAttackTypes.includes(inc.attack.type || '')
      );
      if (filteredIncidents.length > 0) {
        filtered[iso3] = filteredIncidents;
      }
    });
    return filtered;
  }, [incidentsByCountry, selectedAttackTypes]);
  const displayedIncidents = useMemo(() => {
    let incidents: Incidents[] = [];
    if (selectedCountry) {
      incidents = filteredIncidentsByCountry[selectedCountry] || [];
    } else if (selectedRegion && regionCountries[selectedRegion]) {
      regionCountries[selectedRegion].forEach(iso3 => {
        if (filteredIncidentsByCountry[iso3]) {
          incidents.push(...filteredIncidentsByCountry[iso3]);
        }
      });
    } else {
      incidents = Object.values(filteredIncidentsByCountry).flat();
    }
    return incidents;
  }, [selectedCountry, selectedRegion, filteredIncidentsByCountry]);
  const timelineTitle = useMemo(() => {
    if (selectedCountry)
      return `Incidents Timeline - ${selectedCountry}`;
    if (selectedRegion)
      return `Incidents Timeline - ${selectedRegion}`;
    return 'Global Incidents Timeline';
  }, [selectedCountry, selectedRegion]);
  const toggleAttackType = (type: string) => {
    setSelectedAttackTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  const toggleAllTypes = () => {
    if (selectedAttackTypes.length === attackTypes.length) {
      setSelectedAttackTypes([]);
    } else {
      setSelectedAttackTypes([...attackTypes]);
    }
  };
  const isAllSelected = selectedAttackTypes.length === attackTypes.length || selectedAttackTypes.length === 0;
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
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{
          width: '280px',
          background: "#1e293b",
          color: 'white',
          boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid #334155',
          overflowY: 'auto'
        }}>
          <div style={{ 
            padding: '24px 20px 20px 20px',
            borderBottom: '1px solid #334155'
          }}>
            <h1 style={{ 
              fontSize: '20px', 
              fontWeight: '700', 
              margin: 0
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
            <div style={{ 
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                margin: 0,
                color: '#7876f7ff'
              }}>
                Attack Types
              </h2>
              <button
                onClick={() => setShowAttackFilter(!showAttackFilter)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#7876f7ff',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showAttackFilter ? '▼' : '▶'}
              </button>
            </div>
            {showAttackFilter && (
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '8px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    paddingBottom: '8px',
                    borderBottom: '1px solid #334155'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAttackTypes.length === 12}
                    onChange={() => toggleAllTypes()}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>All Types</span>
                </label>
                {attackTypes.map(type => (
                  <label
                    key={type}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAttackTypes.includes(type)}
                      onChange={() => toggleAttackType(type)}
                      style={{ cursor: 'pointer' }}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            )}
            {selectedAttackTypes.length > 0 && (
              <button
                onClick={() => setSelectedAttackTypes([])}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '6px',
                  background: '#334155',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Clear filters ({selectedAttackTypes.length})
              </button>
            )}
          </div>
          <div style={{ 
            padding: '20px',
            borderTop: '1px solid #334155'
          }}>
            <h2 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              margin: '0 0 12px 0',
              color: '#7876f7ff'
            }}>
              Legend
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#e74c3c',
                  borderRadius: '6px'
                }}></div>
                <div>
                  <p style={{ fontSize: '14px', margin: 0 }}>Critical</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>50+ incidents</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#f39c12',
                  borderRadius: '6px'
                }}></div>
                <div>
                  <p style={{ fontSize: '14px', margin: 0 }}>Medium</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>20-49 incidents</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '24px', 
                  height: '24px', 
                  background: '#f1c40f',
                  borderRadius: '6px'
                }}></div>
                <div>
                  <p style={{ fontSize: '14px', margin: 0 }}>Low</p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>1-19 incidents</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <MapContainer
            key={selectedAttackTypes.join(',')}
            ref={setMap}
            style={{ 
              width: '100%', 
              height: '100%', 
              backgroundColor: '#e0f2fe'
            }}
            center={[20, 0]}
            zoom={2}
            minZoom={2}
            maxZoom={6}
            scrollWheelZoom={false}
            doubleClickZoom={false}
          >
            <GeoJSON
              key={`geo-${selectedAttackTypes.join(',')}`}
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
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 24px',
          borderBottom: '1px solid #334155'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
            {timelineTitle}
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '400', 
              color: '#94a3b8', 
              marginLeft: '12px'
            }}>
              ({displayedIncidents.length} incidents)
            </span>
          </h2>
        </div>
        <div style={{ padding: '8px 24px', height: 'calc(100% - 50px)' }}>
          <Timeline incidents={displayedIncidents} />
        </div>
      </div>
    </div>
  );
}
