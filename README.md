# Worldwide Cyber Incidents

An interactive web application for visualizing and tracking cyber security incidents across the globe. This application is currently available on laptop and mobile, but the mobile view isn't well presented. I'm currently working on it !

## Context

During this hackathon, an NGO challenged us to propose an alternative to their current interactive map display, which shows countries most impacted by cyber attacks.
The NGO needed a more intuitive and visually appealing way to visualize global cyber security incidents and help users navigate through different geographic regions to identify areas most affected by cyber threats. This hackathon lasted five days from 12/01/2025 to 16/01/2025, and on the last day, we presented our pitch to demonstrate our project (you can retrieve our powerpoint with the 'Cyberpeace Trace.pdf' file).
And I decided to add more features to this web-app after the hackathon, so please enjoy this updated version !

## Features

- **Interactive World Map**: Visualize cyber incidents on an interactive map with country-level data
- **Color-Coded Severity**: Countries are color-coded based on incident severity (Critical, Medium, Low)
- **Regional Navigation**: Quick navigation buttons for different world regions
- **Incident Timeline**: View incidents chronologically and its details with filtering by country
- **Responsive Design**: Optimized layout with a sidebar for controls and legend
- **Filter Management**: Allows you to filter the map with different types of incidents

## Severity Levels

| Level | Color | Criteria |
|-------|-------|----------|
| **Critical** | 🟥 Red | 50+ incidents |
| **Medium** | 🟧 Orange | 20-49 incidents |
| **Low** | 🟨 Yellow | 1-19 incidents |
| **None** | ⬜ White | 0 incidents |

## Tech Stack

- **Frontend**: React with TypeScript, Astor
- **Libraries**: Leaflet & React-Leaflet
- **Data**: JSON files
- **Deployment**: Vercel

## Web-App

Retrieve this web-app on this current link : https://worldwide-cyber-incidents.vercel.app/

## Project Structure

```
src/
├── assets/
│   ├── astro.svg
├── components/
│   ├── IncidentsMap.tsx
│   ├── MapControls.tsx
│   └── Timeline.tsx
├── data/
│   ├── countries.json
│   └── incidents.json
├── pages/
│   └── index.astro
├── types/
│   └── incidents.ts
├── utils/
│   └── countries.tsx
```

## Components

### MapControls
Navigation component with preset views for different regions:
- Worldwide
- Europe
- North America
- South America
- Africa
- Oceania
- South Asia
- East Asia

### Timeline
Displays incidents in chronological order all the incidents in a timeline.
It also shows incidents depending on the current country selected or on the current continent.

### Filters
Allows you to filter the current map with different types of attacks :
- All types
- Code injection
- DDoS
- Hack and leak operations
- Identity-based
- IoT-based
- Malware
- Ransomware
- Social engineering
- Spoofing
- Supply chain
- Unknown
- Website defacements

### Map Container
Interactive Leaflet map with:
- Custom country styling based on incident count
- Click handlers for country selection
- Zoom controls

## Developpers
- Donata Contant
