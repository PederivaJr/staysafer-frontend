// Helper function to convert "DD.MM.YYYY" to "YYYY-MM-DD", needed to sort by date functions
const convertDateString = (dateStr) => {
  const [day, month, year] = dateStr.split(".");
  return `${year}-${month}-${day}`;
};
export const AVAILABLE_LANGUAGES = ["en", "it", "fr", "de", "es", "pt"];
export const SAFETY_METHODS = ["manual", "gps", "nfc"];
export const PHONE_REGEX = new RegExp(/^\+?[0-9\s-.()]{6,20}$/gm);
export const COMPARE_NAMES = (a, b) => {
  if (a.name < b.name) {
    return -1;
  }
  if (a.name > b.name) {
    return 1;
  }
  return 0;
};
export const COMPARE_DATE = (a, b) => {
  const dateA = new Date(convertDateString(a.invite_created_at));
  const dateB = new Date(convertDateString(b.invite_created_at));
  // sort dates from newest to oldest
  if (dateA > dateB) {
    return -1;
  }
  if (dateA < dateB) {
    return 1;
  }
  return 0;
};

export const COMPARE_DATE_EVENTS = (a, b) => {
  const dateA = new Date(convertDateString(a.date));
  const dateB = new Date(convertDateString(b.date));
  // sort dates from newest to oldest
  if (dateA > dateB) {
    return -1;
  }
  if (dateA < dateB) {
    return 1;
  }
  return 0;
};
export const COMPARE_ID = (a, b) => {
  if (a.id < b.id) {
    return -1;
  }
  if (a.id > b.id) {
    return 1;
  }
  return 0;
};
export const COMPARE_DURATIONS = (a, b) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};
export const INIT_FOR_KICK = {
  id: false,
  user: true,
  plan: false,
  settings: true,
  evacuation: false,
  evac_points: true,
  selected_users: true,
  company_users: true,
  temp_contacts: true,
  local_contacts: false,
  selected_users_checkins: false,
  invites: false,
};
// beacons
export const ALLOWED_BEACONS = [
  "AC:23:3F:F1:FE:47",
  "AC:23:3F:F1:FE:48",
  "C3:00:00:34:78:80",
  "C3:00:00:34:78:81",
  "C3:00:00:34:78:88",
  "C3:00:00:34:78:91",
];
export const RSSI_1M = -59; // RSSI value at 1 meter (adjust based on your testing)
export const PATH_LOSS = 2.5; // Path-loss exponent (adjust based on your environment)
export const BLE_DIRECTION_THRESHOLD = 20; // defines the cone of tollerance (degrees) to show a certain direction (N,S,W,E)
export const DEFAULT_DISTANCE_THRESHOLD = 3; // defines the radius of tollerance to consider a beacon as reached

/* export const NAVIGATION_TREE = {
  NorthOffice: {
    id: "1",
    beaconId: "AC:23:3F:F1:FE:48",
    name: "Ufficio segretario comunale",
    connectedTo: ["Intersection"],
  },
  SouthOffice: {
    id: "2",
    beaconId: "AC:23:3F:F1:FE:47",
    name: "Cucina",
    connectedTo: ["Intersection"],
  },
  EastOffice: {
    id: "3",
    beaconId: null,
    name: "Sala riunioni 1",
    connectedTo: ["Intersection"],
  },
  WestOffice: {
    id: "4",
    beaconId: null,
    name: "Sala riunioni 2",
    connectedTo: ["Intersection"],
  },
  Intersection: {
    id: "5",
    beaconId: "C3:00:00:34:78:91",
    name: "stairs",
    connectedTo: ["NorthOffice", "SouthOffice", "EastOffice", "WestOffice"],
  },
}; */
export const NAVIGATION_TREE = {
  NorthOffice: {
    //beaconId: "AC:23:3F:F1:FE:48",
    beaconId: "C3:00:00:34:78:80",
    name: "Ufficio segretario comunale",
    connectedTo: ["SouthOffice", "Intersection"],
    directions: {
      Intersection: "Esci. Corridoio a sinistra. Sulla sinistra.",
      SouthOffice: "Esci. Corridoio a sinistra. Prima porta a sinistra.",
    },
    directionIcons: {
      Intersection: "left",
      SouthOffice: "left",
    },
  },
  SouthOffice: {
    //beaconId: "AC:23:3F:F1:FE:47",
    beaconId: "C3:00:00:34:78:88",
    name: "Cucina",
    connectedTo: ["NorthOffice", "Intersection"],
    directions: {
      Intersection: "Esci. Corridoio a sinistra. Sulla sinistra.",
      NorthOffice: "Esci. Corridoio a destra. Prima porta a destra.",
    },
    directionIcons: {
      Intersection: "left",
      NorthOffice: "right",
    },
  },
  Intersection: {
    //beaconId: "AC:23:3F:F1:FE:48",
    beaconId: "C3:00:00:34:78:81",
    name: "Scale",
    connectedTo: ["NorthOffice", "SouthOffice"],
    directions: {
      NorthOffice: "Gira a destra. Seconda porta a destra.",
      SouthOffice: "Gira a destra. Prima porta a destra.",
    },
    directionIcons: {
      NorthOffice: "right",
      SouthOffice: "right",
    },
  },
};
export const NAVIGATION_TREE_2 = {
  nodes: {
    NorthOffice: {
      beaconId: "AC:23:3F:F1:FE:48",
      name: "Ufficio segretario comunale",
      position: { x: 0, y: 20 },
      distanceThreshold: 3,
      customText: "Ufficio segretario comunale",
    },
    SouthOffice: {
      beaconId: "AC:23:3F:F1:FE:47",
      name: "Cucina",
      position: { x: 0, y: 0 },
      distanceThreshold: 3,
      customText: "Cucina",
    },
    GatheringPoint: {
      beaconId: "BEACON_GP",
      position: { x: 10, y: -10 },
      distanceThreshold: 5,
      customText: "You are safe.",
    },
  },
  edges: [
    {
      from: "NorthOffice",
      to: "SouthOffice",
      estimatedDistance: 20,
      weight: 10,
      direction: "South",
      customText: "Esci dall'ufficio. Prima porta a sinistra.",
      icon: "arrow-up",
    },
    {
      from: "SouthOffice",
      to: "GatheringPoint",
      estimatedDistance: 15,
      weight: 5,
      direction: "South-East",
      customText: "Esci dalla sala. Gira a sinistra. Scendi le scale.",
      icon: "arrow-left",
    },
    {
      from: "SouthOffice",
      to: "GatheringPoint",
      estimatedDistance: 15,
      weight: 5,
      direction: "South-East",
      customText: "Esci dall'ufficio. Gira a sinistra. Scendi le scale.",
      icon: "arrow-left",
    },
  ],
  user: {
    currentBeacon: null,
    orientation: 0,
    stepsTaken: 0,
    lastBeaconRSSI: -60,
    emergencyMode: false,
    targetDestination: null,
  },
};

export const EVAC_POINT_RADII = {
  small: 5,
  medium: 10,
  large: 20,
  extraLarge: 50,
};
