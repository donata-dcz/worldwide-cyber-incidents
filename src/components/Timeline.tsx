import { useMemo } from "react";
import type { TimelineProps } from "../types/incidents"

export default function Timeline({ incidents }: TimelineProps) {
  const sortedIncidents = useMemo(() => {
    if (!incidents || incidents.length === 0) return [];

    const validIncidents = incidents.filter(inc => {
      const dateStr = inc.event.startDate || inc.event.date;
      if (!dateStr) return false;
      
      const timestamp = new Date(dateStr).getTime();
      if (isNaN(timestamp)) return false;

      const year = new Date(dateStr).getFullYear();
      if (year < 2000 || year > 2030) return false;
      
      return true;
    });
    
    return validIncidents.sort((a, b) => {
      const dateA = a.event.startDate || a.event.date;
      const dateB = b.event.startDate || b.event.date;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [incidents]);

  const dateRange = useMemo(() => {
    if (sortedIncidents.length === 0)
      return { min: null, max: null };
    
    const dates = sortedIncidents.map(inc => {
      const date = inc.event.startDate || inc.event.date;
      return new Date(date).getTime();
    });
    
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const range = maxDate - minDate;
    const padding = range > 0 ? range * 0.1 : 7 * 24 * 60 * 60 * 1000;
    
    return {
      min: new Date(minDate - padding),
      max: new Date(maxDate + padding)
    };
  }, [sortedIncidents]);

  const getPositionFromDate = (dateString: string) => {
    if (!dateRange.min || !dateRange.max) return 50;
    
    const date = new Date(dateString).getTime();
    const minTime = dateRange.min.getTime();
    const maxTime = dateRange.max.getTime();
    const range = maxTime - minTime;
    
    if (range === 0) return 50;
    
    return ((date - minTime) / range) * 100;
  };

  const getAttackColor = (type: string) => {
    const typeLower = type.toLowerCase();
    if (typeLower.includes("phishing")) return "#ff6b6b";
    if (typeLower.includes("ddos")) return "#4ecdc4";
    if (typeLower.includes("malware")) return "#45b7d1";
    if (typeLower.includes("ransomware")) return "#96ceb4";
    if (typeLower.includes("data breach")) return "#feca57";
    return "#778ca3";
  };

  if (sortedIncidents.length === 0) {
    return (
      <div style={{ 
        height: "100%", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center"
      }}>
        <p style={{ color: "#888" }}>No incidents to display</p>
      </div>
    );
  }

  return (
    <div style={{ 
      position: "relative", 
      height: "100%", 
      width: "100%",
      padding: "20px 60px",
      display: "flex",
      alignItems: "center"
    }}>
      <div style={{
        position: "absolute",
        top: "50%",
        left: "60px",
        right: "60px",
        height: "3px",
        background: "linear-gradient(90deg, #444 0%, #666 50%, #444 100%)",
        transform: "translateY(-50%)",
        borderRadius: "2px"
      }} />

      {dateRange.min && dateRange.max && (
        <>
          <div style={{
            position: "absolute",
            left: "60px",
            bottom: "8px",
            fontSize: "11px",
            color: "#888",
            fontWeight: "500"
          }}>
            {dateRange.min.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
          <div style={{
            position: "absolute",
            right: "60px",
            bottom: "8px",
            fontSize: "11px",
            color: "#888",
            fontWeight: "500"
          }}>
            {dateRange.max.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
          </div>
        </>
      )}

      <div style={{
        position: "absolute",
        left: "60px",
        right: "60px",
        top: "50%",
        transform: "translateY(-50%)",
        height: "40px"
      }}>
        {sortedIncidents.map((incident, index) => {
          const dateStr = incident.event.startDate || incident.event.date;
          const position = getPositionFromDate(dateStr);
          const attackType = incident.attack.type || "Unknown";
          const date = new Date(dateStr);
          
          return (
            <div
              key={`${incident.id}-${index}`}
              style={{
                position: "absolute",
                left: `${position}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                cursor: "pointer",
                zIndex: 10
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  background: getAttackColor(attackType),
                  border: "2px solid #fff",
                  boxShadow: "0 0 8px rgba(0,0,0,0.6)",
                  transition: "all 0.2s"
                }}
                className="timeline-marker"
              />
              <div style={{
                position: "absolute",
                bottom: "28px",
                left: "50%",
                transform: "translateX(-50%)",
                background: "#2d3436",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "6px",
                fontSize: "10px",
                whiteSpace: "nowrap",
                minWidth: "100px",
                textAlign: "center",
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 0.2s",
                boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                zIndex: 1000
              }}
              className="timeline-tooltip">
                <div style={{ fontWeight: "600", marginBottom: "2px" }}>
                  {incident.event.name}
                </div>
                <div style={{ fontSize: "9px", color: "#bbb" }}>
                  {date.toLocaleDateString()}
                </div>
                <div style={{ fontSize: "8px", color: "#999", marginTop: "2px" }}>
                  {attackType}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <style>
        {`
          .timeline-marker:hover {
            transform: scale(1.4) !important;
            box-shadow: 0 0 16px rgba(255,255,255,0.8) !important;
          }
          .timeline-marker:hover + .timeline-tooltip {
            opacity: 1 !important;
          }
          
          @media (max-width: 768px) {
            .timeline-marker {
              width: 10px !important;
              height: 10px !important;
            }
          }
        `}
      </style>
    </div>
  );
}
