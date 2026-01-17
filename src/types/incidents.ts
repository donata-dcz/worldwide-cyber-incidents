export interface Incidents {
  id: string;
  organization: string;
  reported_by: string;
  inserted_at: string;
  status: string;
  event: {
    date: string;
    startDate: string;
    name: string;
    description: string;
    primaryLocation: string;
    primaryCity: string;
    eventTrustLevel: string;
  }
  attack: {
    type: string;
    vector: string;
    impact: {
      cia: string;
      type: string;
      description: string;
    };
    harms: {
      groupName: string;
    }
  }
  source: {
    name: string;
    url: string;
  }
  target_name_embed: any[];
  threat_actor_name_embed: any[];
  tags: string[];
}

export interface TimelineProps {
  incidents: Incidents[];
}

export interface MapControlsProps {
  map: any;
}

export interface RegionButton {
  label: string;
  coords: [number, number, number];
  gradient: string;
}
