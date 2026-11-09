import { db, initDatabase } from "./schema.js";

export function seedMasterData() {
  initDatabase();

  const insertTeam = db.prepare(`
    INSERT OR REPLACE INTO teams (id, name, short_name, color, accent_color, logo_text)
    VALUES (@id, @name, @short_name, @color, @accent_color, @logo_text)
  `);

  const insertPlayer = db.prepare(`
    INSERT OR REPLACE INTO players (id, name, role, country, is_overseas, default_price, starting_team_id, acquisition_type, base_price)
    VALUES (@id, @name, @role, @country, @is_overseas, @default_price, @starting_team_id, @acquisition_type, @base_price)
  `);

  const teams = [
    { id: "CSK", name: "Chennai Super Kings", short_name: "CSK", color: "#FACC15", accent_color: "#1E3A8A", logo_text: "🦁" },
    { id: "MI", name: "Mumbai Indians", short_name: "MI", color: "#004BA0", accent_color: "#D1A153", logo_text: "🌀" },
    { id: "KKR", name: "Kolkata Knight Riders", short_name: "KKR", color: "#3B1E73", accent_color: "#F59E0B", logo_text: "⚔️" },
    { id: "RCB", name: "Royal Challengers Bengaluru", short_name: "RCB", color: "#DA1818", accent_color: "#000000", logo_text: "🦅" },
    { id: "SRH", name: "Sunrisers Hyderabad", short_name: "SRH", color: "#F97316", accent_color: "#000000", logo_text: "🦅" },
    { id: "GT", name: "Gujarat Titans", short_name: "GT", color: "#1B2133", accent_color: "#FCD34D", logo_text: "⚡" },
    { id: "RR", name: "Rajasthan Royals", short_name: "RR", color: "#EA1B8C", accent_color: "#2563EB", logo_text: "👑" },
    { id: "PBKS", name: "Punjab Kings", short_name: "PBKS", color: "#D31515", accent_color: "#E5E7EB", logo_text: "🦁" },
    { id: "DC", name: "Delhi Capitals", short_name: "DC", color: "#002B49", accent_color: "#DC2626", logo_text: "🐯" },
    { id: "LSG", name: "Lucknow Super Giants", short_name: "LSG", color: "#0057B8", accent_color: "#EF4444", logo_text: "🛡️" }
  ];

  // Raw starting 2026 squads from the official PDF (25 players per team)
  const squadsData = {
    CSK: [
      { name: "Ruturaj Gaikwad", role: "Batter", price: 18.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Dewald Brevis", role: "Batter", price: 2.20, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Ayush Mhatre", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Sarfaraz Khan", role: "Batter", price: 0.75, acq: "Auction", os: 0, cty: "India" },
      { name: "Matthew Short", role: "Batter", price: 1.50, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Sanju Samson", role: "Wicketkeeper", price: 18.00, acq: "Trade", os: 0, cty: "India" },
      { name: "MS Dhoni", role: "Wicketkeeper", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Urvil Patel", role: "Wicketkeeper", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Kartik Sharma", role: "Wicketkeeper", price: 14.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Shivam Dube", role: "All-Rounder", price: 12.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Zak Foulkes", role: "All-Rounder", price: 0.75, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Ramakrishna Ghosh", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Shreyas Gopal", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Jamie Overton", role: "All-Rounder", price: 1.50, acq: "Retained", os: 1, cty: "England" },
      { name: "Akeal Hosein", role: "All-Rounder", price: 2.00, acq: "Auction", os: 1, cty: "West Indies" },
      { name: "Aman Khan", role: "All-Rounder", price: 0.40, acq: "Auction", os: 0, cty: "India" },
      { name: "Prashant Veer", role: "All-Rounder", price: 14.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Noor Ahmad", role: "Bowler", price: 10.00, acq: "Retained", os: 1, cty: "Afghanistan" },
      { name: "Rahul Chahar", role: "Bowler", price: 5.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Khaleel Ahmed", role: "Bowler", price: 4.80, acq: "Retained", os: 0, cty: "India" },
      { name: "Nathan Ellis", role: "Bowler", price: 2.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Matt Henry", role: "Bowler", price: 2.00, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Gurjapneet Singh", role: "Bowler", price: 2.20, acq: "Retained", os: 0, cty: "India" },
      { name: "Anshul Kamboj", role: "Bowler", price: 3.40, acq: "Retained", os: 0, cty: "India" },
      { name: "Mukesh Choudhary", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" }
    ],
    MI: [
      { name: "Rohit Sharma", role: "Batter", price: 16.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Suryakumar Yadav", role: "Batter", price: 16.35, acq: "Retained", os: 0, cty: "India" },
      { name: "Danish Malewar", role: "Batter", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Robin Minz", role: "Wicketkeeper", price: 0.65, acq: "Retained", os: 0, cty: "India" },
      { name: "Ryan Rickelton", role: "Wicketkeeper", price: 1.00, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Quinton de Kock", role: "Wicketkeeper", price: 1.00, acq: "Auction", os: 1, cty: "South Africa" },
      { name: "Hardik Pandya", role: "All-Rounder", price: 16.35, acq: "Retained", os: 0, cty: "India" },
      { name: "Tilak Varma", role: "All-Rounder", price: 8.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Naman Dhir", role: "All-Rounder", price: 5.25, acq: "Retained", os: 0, cty: "India" },
      { name: "Will Jacks", role: "All-Rounder", price: 5.25, acq: "Retained", os: 1, cty: "England" },
      { name: "Shardul Thakur", role: "All-Rounder", price: 2.00, acq: "Trade", os: 0, cty: "India" },
      { name: "Sherfane Rutherford", role: "All-Rounder", price: 2.60, acq: "Trade", os: 1, cty: "West Indies" },
      { name: "Mitchell Santner", role: "All-Rounder", price: 2.00, acq: "Retained", os: 1, cty: "New Zealand" },
      { name: "Corbin Bosch", role: "All-Rounder", price: 0.75, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Raj Angad Bawa", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Atharva Ankolekar", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Mayank Rawat", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Jasprit Bumrah", role: "Bowler", price: 18.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Trent Boult", role: "Bowler", price: 12.50, acq: "Retained", os: 1, cty: "New Zealand" },
      { name: "Deepak Chahar", role: "Bowler", price: 9.25, acq: "Retained", os: 0, cty: "India" },
      { name: "AM Ghazanfar", role: "Bowler", price: 4.80, acq: "Retained", os: 1, cty: "Afghanistan" },
      { name: "Mayank Markande", role: "Bowler", price: 0.30, acq: "Trade", os: 0, cty: "India" },
      { name: "Raghu Sharma", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Ashwani Kumar", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Mohammad Izhar", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    KKR: [
      { name: "Rinku Singh", role: "Batter", price: 13.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Angkrish Raghuvanshi", role: "Batter", price: 3.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Ajinkya Rahane", role: "Batter", price: 1.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Rovman Powell", role: "Batter", price: 1.50, acq: "Retained", os: 1, cty: "West Indies" },
      { name: "Manish Pandey", role: "Batter", price: 0.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Rahul Tripathi", role: "Batter", price: 0.75, acq: "Auction", os: 0, cty: "India" },
      { name: "Tejasvi Singh Dahiya", role: "Wicketkeeper", price: 3.00, acq: "Auction", os: 0, cty: "India" },
      { name: "Finn Allen", role: "Wicketkeeper", price: 2.00, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Tim Seifert", role: "Wicketkeeper", price: 1.50, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Cameron Green", role: "All-Rounder", price: 25.20, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Sunil Narine", role: "All-Rounder", price: 12.00, acq: "Retained", os: 1, cty: "West Indies" },
      { name: "Ramandeep Singh", role: "All-Rounder", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Rachin Ravindra", role: "All-Rounder", price: 2.00, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Anukul Roy", role: "All-Rounder", price: 0.40, acq: "Retained", os: 0, cty: "India" },
      { name: "Daksh Kamra", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Sarthak Ranjan", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Matheesha Pathirana", role: "Bowler", price: 18.00, acq: "Auction", os: 1, cty: "Sri Lanka" },
      { name: "Varun Chakravarthy", role: "Bowler", price: 12.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Mustafizur Rahman", role: "Bowler", price: 9.20, acq: "Auction", os: 1, cty: "Bangladesh" },
      { name: "Harshit Rana", role: "Bowler", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Vaibhav Arora", role: "Bowler", price: 1.80, acq: "Retained", os: 0, cty: "India" },
      { name: "Akash Deep", role: "Bowler", price: 1.00, acq: "Auction", os: 0, cty: "India" },
      { name: "Umran Malik", role: "Bowler", price: 0.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Kartik Tyagi", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Prashant Solanki", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    RCB: [
      { name: "Virat Kohli", role: "Batter", price: 21.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Rajat Patidar", role: "Batter", price: 11.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Tim David", role: "Batter", price: 3.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Devdutt Padikkal", role: "Batter", price: 2.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Phil Salt", role: "Wicketkeeper", price: 11.50, acq: "Retained", os: 1, cty: "England" },
      { name: "Jitesh Sharma", role: "Wicketkeeper", price: 11.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Jordan Cox", role: "Wicketkeeper", price: 0.75, acq: "Auction", os: 1, cty: "England" },
      { name: "Venkatesh Iyer", role: "All-Rounder", price: 7.00, acq: "Auction", os: 0, cty: "India" },
      { name: "Krunal Pandya", role: "All-Rounder", price: 5.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Jacob Bethell", role: "All-Rounder", price: 2.60, acq: "Retained", os: 1, cty: "England" },
      { name: "Romario Shepherd", role: "All-Rounder", price: 1.50, acq: "Retained", os: 1, cty: "West Indies" },
      { name: "Swapnil Singh", role: "All-Rounder", price: 0.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Satwik Deswal", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Kanishk Chouhan", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Vihaan Malhotra", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Vicky Ostwal", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Josh Hazlewood", role: "Bowler", price: 12.50, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Bhuvneshwar Kumar", role: "Bowler", price: 10.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Rasikh Salam", role: "Bowler", price: 6.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Mangesh Yadav", role: "Bowler", price: 5.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Yash Dayal", role: "Bowler", price: 5.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Suyash Sharma", role: "Bowler", price: 2.60, acq: "Retained", os: 0, cty: "India" },
      { name: "Jacob Duffy", role: "Bowler", price: 2.00, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Nuwan Thushara", role: "Bowler", price: 1.60, acq: "Retained", os: 1, cty: "Sri Lanka" },
      { name: "Abhinandan Singh", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" }
    ],
    SRH: [
      { name: "Travis Head", role: "Batter", price: 14.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Aniket Verma", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "R Smaran", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Heinrich Klaasen", role: "Wicketkeeper", price: 23.00, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Ishan Kishan", role: "Wicketkeeper", price: 11.25, acq: "Retained", os: 0, cty: "India" },
      { name: "Salil Arora", role: "Wicketkeeper", price: 1.50, acq: "Auction", os: 0, cty: "India" },
      { name: "Pat Cummins", role: "All-Rounder", price: 18.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Abhishek Sharma", role: "All-Rounder", price: 14.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Liam Livingstone", role: "All-Rounder", price: 13.00, acq: "Auction", os: 1, cty: "England" },
      { name: "Harshal Patel", role: "All-Rounder", price: 8.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Nitish Kumar Reddy", role: "All-Rounder", price: 6.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Jack Edwards", role: "All-Rounder", price: 3.00, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Brydon Carse", role: "All-Rounder", price: 1.00, acq: "Retained", os: 1, cty: "England" },
      { name: "Kamindu Mendis", role: "All-Rounder", price: 0.75, acq: "Retained", os: 1, cty: "Sri Lanka" },
      { name: "Shivam Mavi", role: "All-Rounder", price: 0.75, acq: "Auction", os: 0, cty: "India" },
      { name: "Harsh Dubey", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Shivang Kumar", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Krains Fuletra", role: "All-Rounder", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Eshan Malinga", role: "Bowler", price: 1.20, acq: "Retained", os: 1, cty: "Sri Lanka" },
      { name: "Jaydev Unadkat", role: "Bowler", price: 1.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Zeeshan Ansari", role: "Bowler", price: 0.40, acq: "Retained", os: 0, cty: "India" },
      { name: "Amit Kumar", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Onkar Tarmale", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Sakib Hussain", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Praful Hinge", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    GT: [
      { name: "Shubman Gill", role: "Batter", price: 16.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Sai Sudharsan", role: "Batter", price: 8.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Shahrukh Khan", role: "Batter", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Glenn Phillips", role: "Batter", price: 2.00, acq: "Retained", os: 1, cty: "New Zealand" },
      { name: "Tom Banton", role: "Batter", price: 2.00, acq: "Auction", os: 1, cty: "England" },
      { name: "Jos Buttler", role: "Wicketkeeper", price: 15.75, acq: "Retained", os: 1, cty: "England" },
      { name: "Kumar Kushagra", role: "Wicketkeeper", price: 0.65, acq: "Retained", os: 0, cty: "India" },
      { name: "Anuj Rawat", role: "Wicketkeeper", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Rashid Khan", role: "All-Rounder", price: 18.00, acq: "Retained", os: 1, cty: "Afghanistan" },
      { name: "Jason Holder", role: "All-Rounder", price: 7.00, acq: "Auction", os: 1, cty: "West Indies" },
      { name: "Rahul Tewatia", role: "All-Rounder", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Washington Sundar", role: "All-Rounder", price: 3.20, acq: "Retained", os: 0, cty: "India" },
      { name: "Arshad Khan", role: "All-Rounder", price: 1.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Jayant Yadav", role: "All-Rounder", price: 0.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Manav Suthar", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Nishant Sindhu", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Mohammed Siraj", role: "Bowler", price: 12.25, acq: "Retained", os: 0, cty: "India" },
      { name: "Kagiso Rabada", role: "Bowler", price: 10.75, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Prasidh Krishna", role: "Bowler", price: 9.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Sai Kishore", role: "Bowler", price: 2.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Gurnoor Brar", role: "Bowler", price: 1.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Ashok Sharma", role: "Bowler", price: 0.90, acq: "Auction", os: 0, cty: "India" },
      { name: "Ishant Sharma", role: "Bowler", price: 0.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Luke Wood", role: "Bowler", price: 0.75, acq: "Auction", os: 1, cty: "England" },
      { name: "Prithvi Raj Yarra", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    RR: [
      { name: "Yashasvi Jaiswal", role: "Batter", price: 18.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Shimron Hetmyer", role: "Batter", price: 11.00, acq: "Retained", os: 1, cty: "West Indies" },
      { name: "Vaibhav Suryavanshi", role: "Batter", price: 1.10, acq: "Retained", os: 0, cty: "India" },
      { name: "Shubham Dubey", role: "Batter", price: 0.80, acq: "Retained", os: 0, cty: "India" },
      { name: "Lhuan-dre Pretorius", role: "Batter", price: 0.30, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Aman Rao", role: "Batter", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Dhruv Jurel", role: "Wicketkeeper", price: 14.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Ravi Singh", role: "Wicketkeeper", price: 0.95, acq: "Auction", os: 1, cty: "England" },
      { name: "Ravindra Jadeja", role: "All-Rounder", price: 14.00, acq: "Trade", os: 0, cty: "India" },
      { name: "Riyan Parag", role: "All-Rounder", price: 14.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Sam Curran", role: "All-Rounder", price: 2.40, acq: "Trade", os: 1, cty: "England" },
      { name: "Donovan Ferreira", role: "All-Rounder", price: 1.00, acq: "Trade", os: 1, cty: "South Africa" },
      { name: "Yudhvir Singh Charak", role: "All-Rounder", price: 0.35, acq: "Retained", os: 0, cty: "India" },
      { name: "Jofra Archer", role: "Bowler", price: 12.50, acq: "Retained", os: 1, cty: "England" },
      { name: "Ravi Bishnoi", role: "Bowler", price: 7.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Tushar Deshpande", role: "Bowler", price: 6.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Sandeep Sharma", role: "Bowler", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Nandre Burger", role: "Bowler", price: 3.50, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Adam Milne", role: "Bowler", price: 2.40, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Kwena Maphaka", role: "Bowler", price: 1.50, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Sushant Mishra", role: "Bowler", price: 0.90, acq: "Auction", os: 0, cty: "India" },
      { name: "Kuldeep Sen", role: "Bowler", price: 0.75, acq: "Auction", os: 0, cty: "India" },
      { name: "Yash Raj Punja", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Vignesh Puthur", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Brijesh Sharma", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    PBKS: [
      { name: "Shreyas Iyer", role: "Batter", price: 26.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Nehal Wadhera", role: "Batter", price: 4.20, acq: "Retained", os: 0, cty: "India" },
      { name: "Priyansh Arya", role: "Batter", price: 3.80, acq: "Retained", os: 0, cty: "India" },
      { name: "Harnoor Singh Pannu", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Pyla Avinash", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Prabhsimran Singh", role: "Wicketkeeper", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Vishnu Vinod", role: "Wicketkeeper", price: 0.95, acq: "Retained", os: 0, cty: "India" },
      { name: "Marcus Stoinis", role: "All-Rounder", price: 11.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Marco Jansen", role: "All-Rounder", price: 7.00, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Shashank Singh", role: "All-Rounder", price: 5.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Ben Dwarshuis", role: "All-Rounder", price: 4.40, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Cooper Connolly", role: "All-Rounder", price: 3.00, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Mitchell Owen", role: "All-Rounder", price: 3.00, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Azmatullah Omarzai", role: "All-Rounder", price: 2.40, acq: "Retained", os: 1, cty: "Afghanistan" },
      { name: "Harpreet Brar", role: "All-Rounder", price: 1.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Musheer Khan", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Suryansh Shedge", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Arshdeep Singh", role: "Bowler", price: 18.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Yuzvendra Chahal", role: "Bowler", price: 18.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Lockie Ferguson", role: "Bowler", price: 2.00, acq: "Retained", os: 1, cty: "New Zealand" },
      { name: "Vyshak Vijaykumar", role: "Bowler", price: 1.80, acq: "Retained", os: 0, cty: "India" },
      { name: "Yash Thakur", role: "Bowler", price: 1.60, acq: "Retained", os: 0, cty: "India" },
      { name: "Xavier Bartlett", role: "Bowler", price: 0.80, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Praveen Dubey", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "Vishal Nishad", role: "Bowler", price: 0.30, acq: "Auction", os: 0, cty: "India" }
    ],
    DC: [
      { name: "Nitish Rana", role: "Batter", price: 4.20, acq: "Trade", os: 0, cty: "India" },
      { name: "Pathum Nissanka", role: "Batter", price: 4.00, acq: "Auction", os: 1, cty: "Sri Lanka" },
      { name: "Ashutosh Sharma", role: "Batter", price: 3.80, acq: "Retained", os: 0, cty: "India" },
      { name: "David Miller", role: "Batter", price: 2.00, acq: "Auction", os: 1, cty: "South Africa" },
      { name: "Sameer Rizvi", role: "Batter", price: 0.95, acq: "Retained", os: 0, cty: "India" },
      { name: "Prithvi Shaw", role: "Batter", price: 0.75, acq: "Auction", os: 0, cty: "India" },
      { name: "Karun Nair", role: "Batter", price: 0.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Sahil Parakh", role: "Batter", price: 0.30, acq: "Auction", os: 0, cty: "India" },
      { name: "KL Rahul", role: "Wicketkeeper", price: 14.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Tristan Stubbs", role: "Wicketkeeper", price: 10.00, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Abishek Porel", role: "Wicketkeeper", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Ben Duckett", role: "Wicketkeeper", price: 2.00, acq: "Auction", os: 1, cty: "England" },
      { name: "Axar Patel", role: "All-Rounder", price: 16.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Auqib Nabi Dar", role: "All-Rounder", price: 8.40, acq: "Auction", os: 0, cty: "India" },
      { name: "Kyle Jamieson", role: "All-Rounder", price: 2.00, acq: "Auction", os: 1, cty: "New Zealand" },
      { name: "Vipraj Nigam", role: "All-Rounder", price: 0.50, acq: "Retained", os: 0, cty: "India" },
      { name: "Madhav Tiwari", role: "All-Rounder", price: 0.40, acq: "Retained", os: 0, cty: "India" },
      { name: "T Vijay", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Ajay Mandal", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Kuldeep Yadav", role: "Bowler", price: 13.25, acq: "Retained", os: 0, cty: "India" },
      { name: "Mitchell Starc", role: "Bowler", price: 11.75, acq: "Retained", os: 1, cty: "Australia" },
      { name: "T Natarajan", role: "Bowler", price: 10.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Mukesh Kumar", role: "Bowler", price: 8.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Lungi Ngidi", role: "Bowler", price: 2.00, acq: "Auction", os: 1, cty: "South Africa" },
      { name: "Dushmantha Chameera", role: "Bowler", price: 0.75, acq: "Retained", os: 1, cty: "Sri Lanka" }
    ],
    LSG: [
      { name: "Abdul Samad", role: "Batter", price: 4.20, acq: "Retained", os: 0, cty: "India" },
      { name: "Ayush Badoni", role: "Batter", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Akshat Raghuwanshi", role: "Batter", price: 2.20, acq: "Auction", os: 0, cty: "India" },
      { name: "Aiden Markram", role: "Batter", price: 2.00, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Matthew Breetzke", role: "Batter", price: 0.75, acq: "Retained", os: 1, cty: "South Africa" },
      { name: "Himmat Singh", role: "Batter", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Rishabh Pant", role: "Wicketkeeper", price: 27.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Nicholas Pooran", role: "Wicketkeeper", price: 21.00, acq: "Retained", os: 1, cty: "West Indies" },
      { name: "Josh Inglis", role: "Wicketkeeper", price: 8.60, acq: "Auction", os: 1, cty: "Australia" },
      { name: "Mukul Choudhary", role: "Wicketkeeper", price: 2.60, acq: "Auction", os: 0, cty: "India" },
      { name: "Mitchell Marsh", role: "All-Rounder", price: 3.40, acq: "Retained", os: 1, cty: "Australia" },
      { name: "Shahbaz Ahmed", role: "All-Rounder", price: 2.40, acq: "Retained", os: 0, cty: "India" },
      { name: "Wanindu Hasaranga", role: "All-Rounder", price: 2.00, acq: "Auction", os: 1, cty: "Sri Lanka" },
      { name: "Arshin Kulkarni", role: "All-Rounder", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Mayank Yadav", role: "Bowler", price: 11.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Mohammed Shami", role: "Bowler", price: 10.00, acq: "Trade", os: 0, cty: "India" },
      { name: "Avesh Khan", role: "Bowler", price: 9.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Mohsin Khan", role: "Bowler", price: 4.00, acq: "Retained", os: 0, cty: "India" },
      { name: "Anrich Nortje", role: "Bowler", price: 2.00, acq: "Auction", os: 1, cty: "South Africa" },
      { name: "Naman Tiwari", role: "Bowler", price: 1.00, acq: "Auction", os: 0, cty: "India" },
      { name: "M Siddharth", role: "Bowler", price: 0.75, acq: "Retained", os: 0, cty: "India" },
      { name: "Digvesh Rathi", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Akash Singh", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Prince Yadav", role: "Bowler", price: 0.30, acq: "Retained", os: 0, cty: "India" },
      { name: "Arjun Tendulkar", role: "Bowler", price: 0.30, acq: "Trade", os: 0, cty: "India" }
    ]
  };

  // Unsold candidates from 2026 Auction Pool
  const unsoldCandidates = [
    { name: "Jake Fraser-McGurk", role: "Batter", cty: "Australia", os: 1, base: 2.00 },
    { name: "Devon Conway", role: "Wicketkeeper", cty: "New Zealand", os: 1, base: 2.00 },
    { name: "Gus Atkinson", role: "Bowler", cty: "England", os: 1, base: 2.00 },
    { name: "Wiaan Mulder", role: "All-Rounder", cty: "South Africa", os: 1, base: 1.00 },
    { name: "Deepak Hooda", role: "All-Rounder", cty: "India", os: 0, base: 0.75 },
    { name: "KS Bharat", role: "Wicketkeeper", cty: "India", os: 0, base: 0.75 },
    { name: "Rahmanullah Gurbaz", role: "Wicketkeeper", cty: "Afghanistan", os: 1, base: 1.50 },
    { name: "Jonny Bairstow", role: "Wicketkeeper", cty: "England", os: 1, base: 1.00 },
    { name: "Jamie Smith", role: "Wicketkeeper", cty: "England", os: 1, base: 2.00 },
    { name: "Gerald Coetzee", role: "Bowler", cty: "South Africa", os: 1, base: 2.00 },
    { name: "Spencer Johnson", role: "Bowler", cty: "Australia", os: 1, base: 1.50 },
    { name: "Fazalhaq Farooqi", role: "Bowler", cty: "Afghanistan", os: 1, base: 1.00 },
    { name: "Maheesh Theekshana", role: "Bowler", cty: "Sri Lanka", os: 1, base: 2.00 },
    { name: "Mujeeb Ur Rahman", role: "Bowler", cty: "Afghanistan", os: 1, base: 2.00 },
    { name: "Atharva Taide", role: "Batter", cty: "India", os: 0, base: 0.30 },
    { name: "Anmolpreet Singh", role: "Batter", cty: "India", os: 0, base: 0.30 },
    { name: "Abhinav Manohar", role: "Batter", cty: "India", os: 0, base: 0.30 },
    { name: "Yash Dhull", role: "Batter", cty: "India", os: 0, base: 0.30 },
    { name: "Vijay Shankar", role: "All-Rounder", cty: "India", os: 0, base: 0.30 },
    { name: "Rajvardhan Hangargekar", role: "All-Rounder", cty: "India", os: 0, base: 0.40 },
    { name: "Mahipal Lomror", role: "All-Rounder", cty: "India", os: 0, base: 0.50 },
    { name: "Tanush Kotian", role: "All-Rounder", cty: "India", os: 0, base: 0.30 },
    { name: "Sanvir Singh", role: "All-Rounder", cty: "India", os: 0, base: 0.30 },
    { name: "Kamlesh Nagarkoti", role: "All-Rounder", cty: "India", os: 0, base: 0.30 },
    { name: "Simarjeet Singh", role: "Bowler", cty: "India", os: 0, base: 0.30 },
    { name: "Akash Madhwal", role: "Bowler", cty: "India", os: 0, base: 0.30 },
    { name: "Karn Sharma", role: "Bowler", cty: "India", os: 0, base: 0.50 },
    { name: "Kumar Kartikeya Singh", role: "Bowler", cty: "India", os: 0, base: 0.30 },
    { name: "Sean Abbott", role: "All-Rounder", cty: "Australia", os: 1, base: 2.00 },
    { name: "Michael Bracewell", role: "All-Rounder", cty: "New Zealand", os: 1, base: 2.00 },
    { name: "Daryl Mitchell", role: "All-Rounder", cty: "New Zealand", os: 1, base: 2.00 },
    { name: "Dasun Shanaka", role: "All-Rounder", cty: "Sri Lanka", os: 1, base: 0.75 },
    { name: "Chetan Sakariya", role: "Bowler", cty: "India", os: 0, base: 0.75 },
    { name: "Waqar Salamkheil", role: "Bowler", cty: "Afghanistan", os: 1, base: 1.00 },
    { name: "Dan Lawrence", role: "All-Rounder", cty: "England", os: 1, base: 2.00 },
    { name: "Taskin Ahmed", role: "Bowler", cty: "Bangladesh", os: 1, base: 0.75 },
    { name: "Alzarri Joseph", role: "Bowler", cty: "West Indies", os: 1, base: 2.00 },
    { name: "Riley Meredith", role: "Bowler", cty: "Australia", os: 1, base: 1.50 },
    { name: "Jhye Richardson", role: "Bowler", cty: "Australia", os: 1, base: 1.50 },
    { name: "William Sutherland", role: "All-Rounder", cty: "Australia", os: 1, base: 1.00 }
  ];

  const transaction = db.transaction(() => {
    // 1. Seed Teams
    for (const t of teams) {
      insertTeam.run(t);
    }

    // 2. Seed Starting Squad Players (250 players)
    let pCount = 0;
    for (const [teamId, pList] of Object.entries(squadsData)) {
      for (const p of pList) {
        pCount++;
        const pId = `p26-${teamId.toLowerCase()}-${pCount}`;
        insertPlayer.run({
          id: pId,
          name: p.name,
          role: p.role,
          country: p.cty,
          is_overseas: p.os,
          default_price: p.price,
          starting_team_id: teamId,
          acquisition_type: p.acq,
          base_price: p.price >= 2.0 ? 2.0 : (p.price >= 1.0 ? 1.0 : (p.price >= 0.5 ? 0.5 : 0.3))
        });
      }
    }

    // 3. Seed Unsold / New Pool Candidates
    let uCount = 0;
    for (const u of unsoldCandidates) {
      uCount++;
      const uId = `pool-new-${uCount}`;
      insertPlayer.run({
        id: uId,
        name: u.name,
        role: u.role,
        country: u.cty,
        is_overseas: u.os,
        default_price: u.base,
        starting_team_id: null,
        acquisition_type: "NewPoolCandidate",
        base_price: u.base
      });
    }
  });

  transaction();
  console.log("Seeded 10 teams, 250 starting squad players, and 40 new auction pool candidates into SQLite!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedMasterData();
}

