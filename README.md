# Worldwide Cyber Incidents

An interactive web application for visualizing and tracking cyber security incidents across the globe.

## Context

During this hackathon, an NGO challenged us to propose an alternative to their current interactive map display, which shows countries most impacted by cyber attacks.
The NGO needed a more intuitive and visually appealing way to visualize global cyber security incidents and help users navigate through different geographic regions to identify areas most affected by cyber threats.


## Features

- **Interactive World Map**: Visualize cyber incidents on an interactive map with country-level data
- **Color-Coded Severity**: Countries are color-coded based on incident severity (Critical, Medium, Low)
- **Regional Navigation**: Quick navigation buttons for different world regions
- **Incident Timeline**: View incidents chronologically and its details with filtering by country
- **Responsive Design**: Optimized layout with a sidebar for controls and legend

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

## Installation

```bash
git clone git@github.com:donata-dcz/worldwide-cyber-incidents.git
cd worldwide-cyber-incidents
npm install
npm run dev
```

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
│   └── countryCodes.tsx
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
Displays incidents in chronological order with filtering capabilities.

### Map Container
Interactive Leaflet map with:
- Custom country styling based on incident count
- Click handlers for country selection
- Zoom controls

## Developpers
- Donata Contant
- Mohammad Amin Hammami
