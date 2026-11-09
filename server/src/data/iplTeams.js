// IPL 2026 Starting Retained Squads & Baseline Purses (Total Purse Cap: ₹120.00 Cr)
export const INITIAL_TEAMS = [
  {
    id: "CSK",
    name: "Chennai Super Kings",
    shortName: "CSK",
    color: "#FACC15", // Yellow
    accentColor: "#1E3A8A",
    logoText: "🦁",
    totalPurse: 120.0,
    purseRemaining: 55.0,
    players: [
      { id: "csk-1", name: "Ruturaj Gaikwad", role: "Batter", country: "India", isOverseas: false, price: 18.0, retained: true },
      { id: "csk-2", name: "Ravindra Jadeja", role: "All-Rounder", country: "India", isOverseas: false, price: 18.0, retained: true },
      { id: "csk-3", name: "Matheesha Pathirana", role: "Bowler", country: "Sri Lanka", isOverseas: true, price: 13.0, retained: true },
      { id: "csk-4", name: "Shivam Dube", role: "All-Rounder", country: "India", isOverseas: false, price: 12.0, retained: true },
      { id: "csk-5", name: "MS Dhoni", role: "Wicketkeeper", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "MI",
    name: "Mumbai Indians",
    shortName: "MI",
    color: "#004BA0", // Blue
    accentColor: "#D1A153",
    logoText: "🌀",
    totalPurse: 120.0,
    purseRemaining: 45.0,
    players: [
      { id: "mi-1", name: "Jasprit Bumrah", role: "Bowler", country: "India", isOverseas: false, price: 18.0, retained: true },
      { id: "mi-2", name: "Suryakumar Yadav", role: "Batter", country: "India", isOverseas: false, price: 16.35, retained: true },
      { id: "mi-3", name: "Hardik Pandya", role: "All-Rounder", country: "India", isOverseas: false, price: 16.35, retained: true },
      { id: "mi-4", name: "Rohit Sharma", role: "Batter", country: "India", isOverseas: false, price: 16.3, retained: true },
      { id: "mi-5", name: "Tilak Varma", role: "Batter", country: "India", isOverseas: false, price: 8.0, retained: true }
    ]
  },
  {
    id: "RCB",
    name: "Royal Challengers Bengaluru",
    shortName: "RCB",
    color: "#DA1818", // Red
    accentColor: "#000000",
    logoText: "🦅",
    totalPurse: 120.0,
    purseRemaining: 83.0,
    players: [
      { id: "rcb-1", name: "Virat Kohli", role: "Batter", country: "India", isOverseas: false, price: 21.0, retained: true },
      { id: "rcb-2", name: "Rajat Patidar", role: "Batter", country: "India", isOverseas: false, price: 11.0, retained: true },
      { id: "rcb-3", name: "Yash Dayal", role: "Bowler", country: "India", isOverseas: false, price: 5.0, retained: true }
    ]
  },
  {
    id: "SRH",
    name: "Sunrisers Hyderabad",
    shortName: "SRH",
    color: "#F97316", // Orange
    accentColor: "#000000",
    logoText: "🦅",
    totalPurse: 120.0,
    purseRemaining: 45.0,
    players: [
      { id: "srh-1", name: "Heinrich Klaasen", role: "Wicketkeeper", country: "South Africa", isOverseas: true, price: 23.0, retained: true },
      { id: "srh-2", name: "Pat Cummins", role: "All-Rounder", country: "Australia", isOverseas: true, price: 18.0, retained: true },
      { id: "srh-3", name: "Abhishek Sharma", role: "All-Rounder", country: "India", isOverseas: false, price: 14.0, retained: true },
      { id: "srh-4", name: "Travis Head", role: "Batter", country: "Australia", isOverseas: true, price: 14.0, retained: true },
      { id: "srh-5", name: "Nitish Kumar Reddy", role: "All-Rounder", country: "India", isOverseas: false, price: 6.0, retained: true }
    ]
  },
  {
    id: "KKR",
    name: "Kolkata Knight Riders",
    shortName: "KKR",
    color: "#3B1E73", // Purple
    accentColor: "#F59E0B",
    logoText: "⚔️",
    totalPurse: 120.0,
    purseRemaining: 51.0,
    players: [
      { id: "kkr-1", name: "Rinku Singh", role: "Batter", country: "India", isOverseas: false, price: 13.0, retained: true },
      { id: "kkr-2", name: "Varun Chakaravarthy", role: "Bowler", country: "India", isOverseas: false, price: 12.0, retained: true },
      { id: "kkr-3", name: "Sunil Narine", role: "All-Rounder", country: "West Indies", isOverseas: true, price: 12.0, retained: true },
      { id: "kkr-4", name: "Andre Russell", role: "All-Rounder", country: "West Indies", isOverseas: true, price: 12.0, retained: true },
      { id: "kkr-5", name: "Harshit Rana", role: "Bowler", country: "India", isOverseas: false, price: 4.0, retained: true },
      { id: "kkr-6", name: "Ramandeep Singh", role: "All-Rounder", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "RR",
    name: "Rajasthan Royals",
    shortName: "RR",
    color: "#EA1B8C", // Pink
    accentColor: "#2563EB",
    logoText: "👑",
    totalPurse: 120.0,
    purseRemaining: 41.0,
    players: [
      { id: "rr-1", name: "Sanju Samson", role: "Wicketkeeper", country: "India", isOverseas: false, price: 18.0, retained: true },
      { id: "rr-2", name: "Yashasvi Jaiswal", role: "Batter", country: "India", isOverseas: false, price: 18.0, retained: true },
      { id: "rr-3", name: "Riyan Parag", role: "All-Rounder", country: "India", isOverseas: false, price: 14.0, retained: true },
      { id: "rr-4", name: "Dhruv Jurel", role: "Wicketkeeper", country: "India", isOverseas: false, price: 14.0, retained: true },
      { id: "rr-5", name: "Shimron Hetmyer", role: "Batter", country: "West Indies", isOverseas: true, price: 11.0, retained: true },
      { id: "rr-6", name: "Sandeep Sharma", role: "Bowler", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "GT",
    name: "Gujarat Titans",
    shortName: "GT",
    color: "#1B2133", // Dark Navy
    accentColor: "#FCD34D",
    logoText: "⚡",
    totalPurse: 120.0,
    purseRemaining: 69.0,
    players: [
      { id: "gt-1", name: "Rashid Khan", role: "Bowler", country: "Afghanistan", isOverseas: true, price: 18.0, retained: true },
      { id: "gt-2", name: "Shubman Gill", role: "Batter", country: "India", isOverseas: false, price: 16.5, retained: true },
      { id: "gt-3", name: "Sai Sudharsan", role: "Batter", country: "India", isOverseas: false, price: 8.5, retained: true },
      { id: "gt-4", name: "Rahul Tewatia", role: "All-Rounder", country: "India", isOverseas: false, price: 4.0, retained: true },
      { id: "gt-5", name: "Shahrukh Khan", role: "Batter", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "LSG",
    name: "Lucknow Super Giants",
    shortName: "LSG",
    color: "#0057B8", // Blue
    accentColor: "#EF4444",
    logoText: "🛡️",
    totalPurse: 120.0,
    purseRemaining: 69.0,
    players: [
      { id: "lsg-1", name: "Nicholas Pooran", role: "Wicketkeeper", country: "West Indies", isOverseas: true, price: 21.0, retained: true },
      { id: "lsg-2", name: "Ravi Bishnoi", role: "Bowler", country: "India", isOverseas: false, price: 11.0, retained: true },
      { id: "lsg-3", name: "Mayank Yadav", role: "Bowler", country: "India", isOverseas: false, price: 11.0, retained: true },
      { id: "lsg-4", name: "Mohsin Khan", role: "Bowler", country: "India", isOverseas: false, price: 4.0, retained: true },
      { id: "lsg-5", name: "Ayush Badoni", role: "Batter", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "DC",
    name: "Delhi Capitals",
    shortName: "DC",
    color: "#002B49", // Deep Navy
    accentColor: "#DC2626",
    logoText: "🐯",
    totalPurse: 120.0,
    purseRemaining: 76.25,
    players: [
      { id: "dc-1", name: "Axar Patel", role: "All-Rounder", country: "India", isOverseas: false, price: 16.5, retained: true },
      { id: "dc-2", name: "Kuldeep Yadav", role: "Bowler", country: "India", isOverseas: false, price: 13.25, retained: true },
      { id: "dc-3", name: "Tristan Stubbs", role: "Batter", country: "South Africa", isOverseas: true, price: 10.0, retained: true },
      { id: "dc-4", name: "Abishek Porel", role: "Wicketkeeper", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  },
  {
    id: "PBKS",
    name: "Punjab Kings",
    shortName: "PBKS",
    color: "#D31515", // Crimson
    accentColor: "#E5E7EB",
    logoText: "🦁",
    totalPurse: 120.0,
    purseRemaining: 110.5,
    players: [
      { id: "pbks-1", name: "Shashank Singh", role: "Batter", country: "India", isOverseas: false, price: 5.5, retained: true },
      { id: "pbks-2", name: "Prabhsimran Singh", role: "Wicketkeeper", country: "India", isOverseas: false, price: 4.0, retained: true }
    ]
  }
];

