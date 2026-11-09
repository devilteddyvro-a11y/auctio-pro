// IPL 2027 Mega Auction Pool
export const AUCTION_POOL = [
  // --- SET 1: MARQUEE BATSMEN & WICKETKEEPERS ---
  {
    id: "p-101",
    name: "Rishabh Pant",
    role: "Wicketkeeper",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "M1 - Marquee",
    stats: { matches: 111, runs: 3284, strikeRate: 148.9, fifties: 18 }
  },
  {
    id: "p-102",
    name: "Shreyas Iyer",
    role: "Batter",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "M1 - Marquee",
    stats: { matches: 115, runs: 3127, strikeRate: 127.5, fifties: 21 }
  },
  {
    id: "p-103",
    name: "KL Rahul",
    role: "Wicketkeeper",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "M1 - Marquee",
    stats: { matches: 132, runs: 4683, strikeRate: 134.6, centuries: 4 }
  },
  {
    id: "p-104",
    name: "Jos Buttler",
    role: "Wicketkeeper",
    country: "England",
    isOverseas: true,
    basePrice: 2.0,
    set: "M1 - Marquee",
    stats: { matches: 107, runs: 3582, strikeRate: 147.5, centuries: 7 }
  },

  // --- SET 2: MARQUEE PACERS & ALL-ROUNDERS ---
  {
    id: "p-105",
    name: "Mitchell Starc",
    role: "Bowler",
    country: "Australia",
    isOverseas: true,
    basePrice: 2.0,
    set: "M2 - Marquee Pacers",
    stats: { matches: 41, wickets: 51, economy: 8.85, bestBowling: "4/15" }
  },
  {
    id: "p-106",
    name: "Arshdeep Singh",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "M2 - Marquee Pacers",
    stats: { matches: 65, wickets: 76, economy: 8.74, bestBowling: "5/32" }
  },
  {
    id: "p-107",
    name: "Kagiso Rabada",
    role: "Bowler",
    country: "South Africa",
    isOverseas: true,
    basePrice: 2.0,
    set: "M2 - Marquee Pacers",
    stats: { matches: 80, wickets: 117, economy: 8.42, bestBowling: "4/21" }
  },
  {
    id: "p-108",
    name: "Liam Livingstone",
    role: "All-Rounder",
    country: "England",
    isOverseas: true,
    basePrice: 2.0,
    set: "M2 - Marquee All-rounders",
    stats: { matches: 39, runs: 939, strikeRate: 162.5, wickets: 11 }
  },

  // --- SET 3: CAPPED BATTERS ---
  {
    id: "p-109",
    name: "David Miller",
    role: "Batter",
    country: "South Africa",
    isOverseas: true,
    basePrice: 1.5,
    set: "BA1 - Capped Batters",
    stats: { matches: 130, runs: 2924, strikeRate: 139.3, fifties: 13 }
  },
  {
    id: "p-110",
    name: "Faf du Plessis",
    role: "Batter",
    country: "South Africa",
    isOverseas: true,
    basePrice: 1.5,
    set: "BA1 - Capped Batters",
    stats: { matches: 145, runs: 4571, strikeRate: 136.4, fifties: 37 }
  },
  {
    id: "p-111",
    name: "Devon Conway",
    role: "Batter",
    country: "New Zealand",
    isOverseas: true,
    basePrice: 2.0,
    set: "BA1 - Capped Batters",
    stats: { matches: 23, runs: 924, strikeRate: 141.3, fifties: 9 }
  },
  {
    id: "p-112",
    name: "Rahul Tripathi",
    role: "Batter",
    country: "India",
    isOverseas: false,
    basePrice: 1.0,
    set: "BA1 - Capped Batters",
    stats: { matches: 95, runs: 2236, strikeRate: 139.8, fifties: 12 }
  },

  // --- SET 4: CAPPED ALL-ROUNDERS ---
  {
    id: "p-113",
    name: "Glenn Maxwell",
    role: "All-Rounder",
    country: "Australia",
    isOverseas: true,
    basePrice: 2.0,
    set: "AL1 - Capped All-Rounders",
    stats: { matches: 134, runs: 2771, strikeRate: 156.7, wickets: 37 }
  },
  {
    id: "p-114",
    name: "Marcus Stoinis",
    role: "All-Rounder",
    country: "Australia",
    isOverseas: true,
    basePrice: 1.5,
    set: "AL1 - Capped All-Rounders",
    stats: { matches: 96, runs: 1866, strikeRate: 142.8, wickets: 43 }
  },
  {
    id: "p-115",
    name: "Washington Sundar",
    role: "All-Rounder",
    country: "India",
    isOverseas: false,
    basePrice: 1.5,
    set: "AL1 - Capped All-Rounders",
    stats: { matches: 60, runs: 378, wickets: 37, economy: 7.54 }
  },
  {
    id: "p-116",
    name: "Venkatesh Iyer",
    role: "All-Rounder",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "AL1 - Capped All-Rounders",
    stats: { matches: 50, runs: 1326, strikeRate: 137.1, centuries: 1 }
  },
  {
    id: "p-117",
    name: "Ravichandran Ashwin",
    role: "All-Rounder",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "AL1 - Capped All-Rounders",
    stats: { matches: 212, wickets: 180, economy: 7.12, runs: 800 }
  },

  // --- SET 5: CAPPED WICKETKEEPERS ---
  {
    id: "p-118",
    name: "Phil Salt",
    role: "Wicketkeeper",
    country: "England",
    isOverseas: true,
    basePrice: 1.5,
    set: "WK1 - Capped Wicketkeepers",
    stats: { matches: 21, runs: 653, strikeRate: 175.5, fifties: 6 }
  },
  {
    id: "p-119",
    name: "Ishan Kishan",
    role: "Wicketkeeper",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "WK1 - Capped Wicketkeepers",
    stats: { matches: 105, runs: 2644, strikeRate: 135.9, fifties: 16 }
  },
  {
    id: "p-120",
    name: "Quinton de Kock",
    role: "Wicketkeeper",
    country: "South Africa",
    isOverseas: true,
    basePrice: 2.0,
    set: "WK1 - Capped Wicketkeepers",
    stats: { matches: 107, runs: 3157, strikeRate: 134.2, centuries: 2 }
  },

  // --- SET 6: CAPPED FAST BOWLERS ---
  {
    id: "p-121",
    name: "Mohammed Shami",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "FA1 - Capped Fast Bowlers",
    stats: { matches: 110, wickets: 127, economy: 8.44, bestBowling: "4/11" }
  },
  {
    id: "p-122",
    name: "Mohammed Siraj",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "FA1 - Capped Fast Bowlers",
    stats: { matches: 93, wickets: 93, economy: 8.65, bestBowling: "4/21" }
  },
  {
    id: "p-123",
    name: "Trent Boult",
    role: "Bowler",
    country: "New Zealand",
    isOverseas: true,
    basePrice: 2.0,
    set: "FA1 - Capped Fast Bowlers",
    stats: { matches: 104, wickets: 121, economy: 8.29, bestBowling: "4/18" }
  },
  {
    id: "p-124",
    name: "Bhuvneshwar Kumar",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 1.5,
    set: "FA1 - Capped Fast Bowlers",
    stats: { matches: 176, wickets: 181, economy: 7.56, bestBowling: "5/19" }
  },

  // --- SET 7: CAPPED SPINNERS ---
  {
    id: "p-125",
    name: "Yuzvendra Chahal",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 2.0,
    set: "SP1 - Capped Spinners",
    stats: { matches: 160, wickets: 205, economy: 7.80, bestBowling: "5/40" }
  },
  {
    id: "p-126",
    name: "Noor Ahmad",
    role: "Bowler",
    country: "Afghanistan",
    isOverseas: true,
    basePrice: 1.0,
    set: "SP1 - Capped Spinners",
    stats: { matches: 23, wickets: 24, economy: 8.04, bestBowling: "3/37" }
  },
  {
    id: "p-127",
    name: "Rahul Chahar",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 1.0,
    set: "SP1 - Capped Spinners",
    stats: { matches: 78, wickets: 75, economy: 7.78, bestBowling: "4/27" }
  },

  // --- SET 8: UNCAPPED STARS ---
  {
    id: "p-128",
    name: "Ashutosh Sharma",
    role: "Batter",
    country: "India",
    isOverseas: false,
    basePrice: 0.3,
    set: "UC1 - Uncapped Powerhitters",
    stats: { matches: 11, runs: 189, strikeRate: 167.3, fifties: 1 }
  },
  {
    id: "p-129",
    name: "Angkrish Raghuvanshi",
    role: "Batter",
    country: "India",
    isOverseas: false,
    basePrice: 0.3,
    set: "UC1 - Uncapped Powerhitters",
    stats: { matches: 10, runs: 163, strikeRate: 155.2, fifties: 1 }
  },
  {
    id: "p-130",
    name: "Vaibhav Arora",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 0.3,
    set: "UC1 - Uncapped Fast Bowlers",
    stats: { matches: 20, wickets: 19, economy: 9.35, bestBowling: "3/27" }
  },
  {
    id: "p-131",
    name: "Rasikh Salam",
    role: "Bowler",
    country: "India",
    isOverseas: false,
    basePrice: 0.3,
    set: "UC1 - Uncapped Fast Bowlers",
    stats: { matches: 11, wickets: 10, economy: 9.94, bestBowling: "3/34" }
  },
  {
    id: "p-132",
    name: "Sameer Rizvi",
    role: "Batter",
    country: "India",
    isOverseas: false,
    basePrice: 0.3,
    set: "UC1 - Uncapped Powerhitters",
    stats: { matches: 8, runs: 51, strikeRate: 118.6 }
  }
];

