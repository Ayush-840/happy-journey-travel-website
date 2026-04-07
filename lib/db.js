import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let db;

export function getDB() {
  if (!db) {
    const dbPath = path.join(process.cwd(), 'happy_journey.db');
    
    if (process.env.VERCEL || process.env.NETLIFY) {
      // On Vercel/Netlify, copy the database to the writeable /tmp directory
      const tmpPath = path.join('/tmp', 'happy_journey.db');
      if (!fs.existsSync(tmpPath) && fs.existsSync(dbPath)) {
        fs.copyFileSync(dbPath, tmpPath);
      }
      db = new Database(tmpPath);
    } else {
      db = new Database(dbPath);
    }

    db.pragma('journal_mode = WAL');
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      hero_image TEXT,
      region TEXT
    );

    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      hero_image TEXT,
      lat REAL,
      lng REAL,
      FOREIGN KEY (state_id) REFERENCES states(id)
    );

    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      highlights TEXT,
      hero_image TEXT,
      gallery TEXT,
      lat REAL,
      lng REAL,
      best_time TEXT,
      tags TEXT,
      rating REAL DEFAULT 4.5,
      budget_per_day TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS nearby_attractions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      place_id INTEGER,
      name TEXT,
      type TEXT,
      distance_km REAL,
      description TEXT,
      FOREIGN KEY (place_id) REFERENCES places(id)
    );

    CREATE TABLE IF NOT EXISTS transport_options (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      type TEXT,
      provider TEXT,
      price_min INTEGER,
      price_max INTEGER,
      icon TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS stays (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER,
      name TEXT,
      stars INTEGER,
      price_per_night INTEGER,
      photo TEXT,
      amenities TEXT,
      address TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    );

    CREATE TABLE IF NOT EXISTS transport_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      user_phone TEXT,
      from_city TEXT,
      to_city TEXT,
      transport_type TEXT,
      travel_date TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS stay_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_name TEXT,
      user_phone TEXT,
      stay_id INTEGER,
      check_in TEXT,
      check_out TEXT,
      guests INTEGER,
      status TEXT DEFAULT 'confirmed',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      location_name TEXT NOT NULL,
      image_url TEXT NOT NULL,
      review TEXT,
      likes_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS likes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (post_id) REFERENCES posts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      base_currency TEXT DEFAULT 'INR',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS trip_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      paid_by_user_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      exchange_rate REAL DEFAULT 1.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trip_id) REFERENCES trips(id),
      FOREIGN KEY (paid_by_user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS expense_splits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      FOREIGN KEY (expense_id) REFERENCES expenses(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      host_name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      price_per_person REAL NOT NULL,
      duration TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      total_slots INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS exp_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      booking_date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (experience_id) REFERENCES experiences(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM states').get();
  if (count.c > 0) {
    // Check if social data exists
    const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
    if (userCount.c === 0) {
      // Seed default users
      const users = [
        { username: 'Ayush', avatar_url: 'https://i.pravatar.cc/150?u=ayush' },
        { username: 'Priya', avatar_url: 'https://i.pravatar.cc/150?u=priya' },
        { username: 'Rohit', avatar_url: 'https://i.pravatar.cc/150?u=rohit' }
      ];
      const insertUser = db.prepare('INSERT INTO users (username, avatar_url) VALUES (@username, @avatar_url)');
      users.forEach(u => insertUser.run(u));

      // Seed default posts
      const posts = [
        { user_id: 1, location_name: 'Jaipur, Rajasthan', image_url: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=800', review: 'The Pink City never fails to amaze! Stunning architecture everywhere.' },
        { user_id: 2, location_name: 'Alleppey, Kerala', image_url: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800', review: 'Floating on the backwaters was a dream. So peaceful and green!' },
        { user_id: 3, location_name: 'Tawang, Arunachal', image_url: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=800', review: 'Breathtaking mountains and spiritual peace at the monastery.' }
      ];
      const insertPost = db.prepare('INSERT INTO posts (user_id, location_name, image_url, review) VALUES (@user_id, @location_name, @image_url, @review)');
      posts.forEach(p => insertPost.run(p));

      // Seed default experiences
      const experiences = [
        { title: 'Old Delhi Food Crawl', host_name: 'Amit Sharma', price_per_person: 1200, duration: '4 Hours', lat: 28.6562, lng: 77.2300, total_slots: 12, image_url: 'https://images.unsplash.com/photo-1585932231552-19817ecd385c?w=800', description: 'Explore the hidden culinary gems of Chandni Chowk with a local expert.' },
        { title: 'Jaipur Heritage Walk', host_name: 'Meera Singh', price_per_person: 800, duration: '3 Hours', lat: 26.9124, lng: 75.7873, total_slots: 15, image_url: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=800', description: 'Walk through the pink city and learn about its royal architectural history.' },
        { title: 'Kerala Backwater Kayaking', host_name: 'Rahul Varma', price_per_person: 1500, duration: '5 Hours', lat: 9.4981, lng: 76.3388, total_slots: 8, image_url: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800', description: 'Experience the serene backwaters from a unique, low-impact perspective.' }
      ];
      const insertExp = db.prepare('INSERT INTO experiences (title, host_name, price_per_person, duration, lat, lng, total_slots, image_url, description) VALUES (@title, @host_name, @price_per_person, @duration, @lat, @lng, @total_slots, @image_url, @description)');
      experiences.forEach(e => insertExp.run(e));
    }
    return; // already seeded everything else
  }

  const states = [
    // North
    { name: 'Rajasthan', slug: 'rajasthan', description: 'The Land of Kings — a mesmerizing tapestry of golden deserts, majestic forts, and vibrant culture.', hero_image: 'https://images.unsplash.com/photo-1650530777057-3a7dbc24bf6c?w=1200', region: 'North' },
    { name: 'Himachal Pradesh', slug: 'himachal-pradesh', description: 'The Himalayan jewel — snow-capped peaks, verdant valleys, and thrilling adventure sports.', hero_image: 'https://images.unsplash.com/photo-1630303449525-01901c3f65c0?w=1200', region: 'North' },
    { name: 'Uttarakhand', slug: 'uttarakhand', description: 'Devbhoomi (Land of the Gods) — sacred rivers, Himalayan treks, and spiritual serenity.', hero_image: 'https://images.unsplash.com/photo-1649147313351-c86537fda0eb?w=1200', region: 'North' },
    { name: 'Uttar Pradesh', slug: 'uttar-pradesh', description: 'The heart of ancient India — home to the Taj Mahal, Varanasi ghats, and sacred temples.', hero_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200', region: 'North' },
    { name: 'Punjab', slug: 'punjab', description: 'The land of five rivers — golden wheat fields, vibrant culture, and the sacred Golden Temple.', hero_image: 'https://images.unsplash.com/photo-1623059508779-2542c6e83753?w=1200', region: 'North' },
    { name: 'Haryana', slug: 'haryana', description: 'A blend of ancient history and agricultural richness, bordering the national capital.', hero_image: 'https://images.unsplash.com/photo-1696247139933-bdbe04c9b4db?w=1200', region: 'North' },
    { name: 'Jammu & Kashmir (UT)', slug: 'jammu-kashmir', description: 'Paradise on Earth — stunning alpine valleys, serene lakes, and snow-clad mountains.', hero_image: 'https://images.unsplash.com/photo-1564329494258-3f72215ba175?w=1200', region: 'North' },
    { name: 'Ladakh (UT)', slug: 'ladakh', description: 'The land of high passes — stark desert mountains, ancient monasteries, and azure lakes.', hero_image: 'https://images.unsplash.com/photo-1606857090627-27ca46667290?w=1200', region: 'North' },
    { name: 'Delhi (UT)', slug: 'delhi', description: 'A mesmerizing mix of centuries-old monuments, bustling bazaars, and modern infrastructure.', hero_image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200', region: 'North' },
    { name: 'Chandigarh (UT)', slug: 'chandigarh', description: 'India’s first planned city — renowned for its architecture, gardens, and high quality of life.', hero_image: 'https://images.unsplash.com/photo-1672799768719-c2d41c309bef?w=1200', region: 'North' },

    // South
    { name: 'Kerala', slug: 'kerala', description: "God's Own Country — serene backwaters, lush hill stations, and ancient Ayurvedic traditions.", hero_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200', region: 'South' },
    { name: 'Tamil Nadu', slug: 'tamil-nadu', description: 'Land of temples and traditions — Dravidian architecture, classical dance, and coastal grandeur.', hero_image: 'https://images.unsplash.com/photo-1692173248120-59547c3d4653?w=1200', region: 'South' },
    { name: 'Karnataka', slug: 'karnataka', description: 'A timeless odyssey through Mysore palaces, Coorg coffee estates, and the ruins of Hampi.', hero_image: 'https://images.unsplash.com/photo-1694190075655-e588fb9e48a4?w=1200', region: 'South' },
    { name: 'Andhra Pradesh', slug: 'andhra-pradesh', description: 'The land of spicy flavors, magnificent temples like Tirupati, and scenic Vizag coastline.', hero_image: 'https://images.unsplash.com/photo-1590133322241-115f5c88926d?w=1200', region: 'South' },
    { name: 'Telangana', slug: 'telangana', description: 'A vibrant modern state rooted in history, home to the iconic Charminar and Deccan heritage.', hero_image: 'https://images.unsplash.com/photo-1696941515998-d83f24967aca?w=1200', region: 'South' },
    { name: 'Puducherry (UT)', slug: 'puducherry', description: 'The French Riviera of the East — quaint colonial streets, serene ashrams, and sunny beaches.', hero_image: 'https://images.unsplash.com/photo-1566303052303-b2d2a9f16f0a?w=1200', region: 'South' },
    { name: 'Lakshadweep (UT)', slug: 'lakshadweep', description: 'Pristine coral atolls, turquoise lagoons, and untouched island tranquility.', hero_image: 'https://images.unsplash.com/photo-1683228265513-f4e28f032959?w=1200', region: 'South' },
    { name: 'Andaman and Nicobar Islands', slug: 'andaman-and-nicobar', description: 'Tropical paradise — turquoise waters, white sand beaches, and deep historical roots.', hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', region: 'South' },

    // West
    { name: 'Goa', slug: 'goa', description: 'India\'s pearl of the west — pristine beaches, colonial charm, and vibrant nightlife await.', hero_image: 'https://images.unsplash.com/photo-1757702244726-00198554c4a0?w=1200', region: 'West' },
    { name: 'Maharashtra', slug: 'maharashtra', description: 'Where ancient caves meet modern glamour — from Ajanta to Mumbai, Maharashtra astonishes at every turn.', hero_image: 'https://images.unsplash.com/photo-1598434192043-71111c1b3f41?w=1200', region: 'West' },
    { name: 'Gujarat', slug: 'gujarat', description: 'The land where the sun sets into the sea — ancient stepwells, the white Rann, and warm hospitality.', hero_image: 'https://images.unsplash.com/photo-1631983097767-099c77bf880d?w=1200', region: 'West' },
    { name: 'Dadra and Nagar Haveli & Daman and Diu (UT)', slug: 'dnh-dd', description: 'Coastal forts, Portuguese churches, and lush green landscapes along the Arabian Sea.', hero_image: 'https://images.unsplash.com/photo-1569776186059-f26b84be14b0?w=1200', region: 'West' },

    // East
    { name: 'West Bengal', slug: 'west-bengal', description: 'The cultural capital of India — the ghats of the Ganges, the Sundarbans, and the spirit of Kolkata.', hero_image: 'https://images.unsplash.com/photo-1536421469767-80559bb6f5e1?w=1200', region: 'East' },
    { name: 'Odisha', slug: 'odisha', description: 'The soul of Incredible India — ancient sun temples, pristine beaches, and tribal culture.', hero_image: 'https://images.unsplash.com/photo-1706790574525-d218c4c52b5c?w=1200', region: 'East' },
    { name: 'Bihar', slug: 'bihar', description: 'The cradle of Buddhism — ancient universities, sacred bodhi trees, and historical depth.', hero_image: 'https://images.unsplash.com/photo-1679806893392-29f024308936?w=1200', region: 'East' },
    { name: 'Jharkhand', slug: 'jharkhand', description: 'The land of forests — cascading waterfalls, wildlife sanctuaries, and rich tribal heritage.', hero_image: 'https://images.unsplash.com/photo-1616149457630-36eebad9e285?w=1200', region: 'East' },

    // Central
    { name: 'Madhya Pradesh', slug: 'madhya-pradesh', description: 'The heart of India — dense tiger reserves, Khajuraho temples, and magnificent forts.', hero_image: 'https://images.unsplash.com/photo-1606298855672-3efb63017be8?w=1200', region: 'Central' },
    { name: 'Chhattisgarh', slug: 'chhattisgarh', description: 'Untouched nature, powerful waterfalls like Chitrakote, and vibrant indigenous culture.', hero_image: 'https://images.unsplash.com/photo-1673462107499-97848ff888b9?w=1200', region: 'Central' },

    // Northeast
    { name: 'Assam', slug: 'assam', description: 'Emerald tea gardens, the mighty Brahmaputra river, and the home of the one-horned rhino.', hero_image: 'https://images.unsplash.com/photo-1675296098616-53e3d4a1dd57?w=1200', region: 'Northeast' },
    { name: 'Meghalaya', slug: 'meghalaya', description: 'The abode of clouds — living root bridges, mystical caves, and endless waterfalls.', hero_image: 'https://images.unsplash.com/photo-1742494267580-e026d3737f65?w=1200', region: 'Northeast' },
    { name: 'Sikkim', slug: 'sikkim', description: 'A Himalayan wonderland — Buddhist monasteries, alpine lakes, and the majestic Khangchendzonga.', hero_image: 'https://images.unsplash.com/photo-1613339027986-b94d85708995?w=1200', region: 'Northeast' },
    { name: 'Arunachal Pradesh', slug: 'arunachal-pradesh', description: 'The land of dawn-lit mountains — unexplored tribal territories and pristine alpine valleys.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', region: 'Northeast' },
    { name: 'Nagaland', slug: 'nagaland', description: 'The land of festivals — fierce warrior tribes, verdant hills, and rich cultural traditions.', hero_image: 'https://images.unsplash.com/photo-1752949870145-cff615625110?w=1200', region: 'Northeast' },
    { name: 'Manipur', slug: 'manipur', description: 'The jeweled land — famous for the floating islands of Loktak Lake and classical dance.', hero_image: 'https://images.unsplash.com/photo-1674722612663-c34ad2c24648?w=1200', region: 'Northeast' },
    { name: 'Mizoram', slug: 'mizoram', description: 'The land of hill people — rolling mountains, pleasant climate, and deep gorges.', hero_image: 'https://images.unsplash.com/photo-1770553643365-09e53220cd78?w=1200', region: 'Northeast' },
    { name: 'Tripura', slug: 'tripura', description: 'A blend of royal heritage, magnificent palaces, and deeply rooted continuous culture.', hero_image: 'https://images.unsplash.com/photo-1773249822619-defdabd4f83c?w=1200', region: 'Northeast' },
  ];

  const insertState = db.prepare('INSERT INTO states (name, slug, description, hero_image, region) VALUES (@name, @slug, @description, @hero_image, @region)');
  const insertCity = db.prepare('INSERT INTO cities (state_id, name, slug, description, hero_image, lat, lng) VALUES (@state_id, @name, @slug, @description, @hero_image, @lat, @lng)');
  const insertPlace = db.prepare('INSERT INTO places (city_id, name, slug, description, highlights, hero_image, gallery, lat, lng, best_time, tags, rating, budget_per_day) VALUES (@city_id, @name, @slug, @description, @highlights, @hero_image, @gallery, @lat, @lng, @best_time, @tags, @rating, @budget_per_day)');
  const insertNearby = db.prepare('INSERT INTO nearby_attractions (place_id, name, type, distance_km, description) VALUES (@place_id, @name, @type, @distance_km, @description)');
  const insertTransport = db.prepare('INSERT INTO transport_options (city_id, type, provider, price_min, price_max, icon) VALUES (@city_id, @type, @provider, @price_min, @price_max, @icon)');
  const insertStay = db.prepare('INSERT INTO stays (city_id, name, stars, price_per_night, photo, amenities, address) VALUES (@city_id, @name, @stars, @price_per_night, @photo, @amenities, @address)');

  const stateIds = {};
  for (const s of states) {
    const info = insertState.run(s);
    stateIds[s.slug] = info.lastInsertRowid;
  }

  // ---------- RAJASTHAN ----------
  const jaipur = insertCity.run({ state_id: stateIds['rajasthan'], name: 'Jaipur', slug: 'jaipur', description: 'The Pink City — a royal blend of palaces, forts, and bazaars bursting with color.', hero_image: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?w=1200', lat: 26.9124, lng: 75.7873 });
  const jodhpur = insertCity.run({ state_id: stateIds['rajasthan'], name: 'Jodhpur', slug: 'jodhpur', description: 'The Blue City rising from the Thar Desert, dominated by the mighty Mehrangarh Fort.', hero_image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200', lat: 26.2389, lng: 73.0243 });
  const udaipur = insertCity.run({ state_id: stateIds['rajasthan'], name: 'Udaipur', slug: 'udaipur', description: 'The City of Lakes — a romantically beautiful city of shimmering lakes and grand palaces.', hero_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', lat: 24.5854, lng: 73.7125 });

  const amberFort = insertPlace.run({ 
    city_id: jaipur.lastInsertRowid, name: 'Amber Fort', slug: 'amber-fort', 
    description: 'A magnificent hilltop fortress blending Rajput and Mughal architecture, overlooking the Maota Lake.', 
    highlights: JSON.stringify(['Sheesh Mahal (Mirror Palace)', 'Ganesh Pol gateway', 'Elephant rides']), 
    hero_image: 'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=800']), 
    lat: 26.9855, lng: 75.8513, best_time: 'October to March', 
    tags: JSON.stringify(['Fort', 'Heritage', 'UNESCO']),
    rating: 4.8, budget_per_day: '₹500 for entry'
  });
  insertPlace.run({ 
    city_id: jaipur.lastInsertRowid, name: 'Hawa Mahal', slug: 'hawa-mahal', 
    description: 'The iconic Palace of Winds — a honeycomb of 953 windows.', 
    highlights: JSON.stringify(['953 latticed windows', 'Bazaar street below']), 
    hero_image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800']), 
    lat: 26.9239, lng: 75.8267, best_time: 'October to March', 
    tags: JSON.stringify(['Palace', 'Heritage', 'Photography']),
    rating: 4.6, budget_per_day: '₹200 for entry'
  });

  // ---------- ANDHRA PRADESH ----------
  const vizag = insertCity.run({ state_id: stateIds['andhra-pradesh'], name: 'Visakhapatnam', slug: 'visakhapatnam', description: 'The Jewel of the East Coast — a beautiful port city known for its pristine beaches and naval heritage.', hero_image: 'https://images.unsplash.com/photo-1590133322241-115f5c88926d?w=1200', lat: 17.6868, lng: 83.2185 });
  const tirupati = insertCity.run({ state_id: stateIds['andhra-pradesh'], name: 'Tirupati', slug: 'tirupati', description: 'The Spiritual Capital of Andhra Pradesh — home to the world-famous Lord Venkateswara Temple.', hero_image: 'https://images.unsplash.com/photo-1620311316492-d96f9a72138a?w=1200', lat: 13.6288, lng: 79.4192 });
  const araku = insertCity.run({ state_id: stateIds['andhra-pradesh'], name: 'Araku Valley', slug: 'araku-valley', description: 'A scenic hill station in the Eastern Ghats, famous for its coffee plantations and tribal culture.', hero_image: 'https://images.unsplash.com/photo-1618179267204-6295551c68e1?w=1200', lat: 18.3333, lng: 82.8667 });

  insertPlace.run({ 
    city_id: vizag.lastInsertRowid, name: 'RK Beach', slug: 'rk-beach', 
    description: 'Ramakrishna Mission Beach — a popular coastal stretch with museums, parks, and naval memorials.', 
    highlights: JSON.stringify(['INS Kursura Submarine Museum', 'War Memorial', 'Sunset walks']), 
    hero_image: 'https://images.unsplash.com/photo-1590133322241-115f5c88926d?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1590133322241-115f5c88926d?w=800']), 
    lat: 17.7142, lng: 83.3235, best_time: 'October to March', 
    tags: JSON.stringify(['Beach', 'Museum', 'Family']),
    rating: 4.6, budget_per_day: '₹300'
  });

  insertPlace.run({ 
    city_id: tirupati.lastInsertRowid, name: 'Tirumala Venkateswara Temple', slug: 'tirumala-temple', 
    description: 'One of the most visited and richest temples in the world, located on the Tirumala Hills.', 
    highlights: JSON.stringify(['Spiritual energy', 'Seven Hills view', 'Laddu Prasadam']), 
    hero_image: 'https://images.unsplash.com/photo-1620311316492-d96f9a72138a?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1620311316492-d96f9a72138a?w=800']), 
    lat: 13.6833, lng: 79.3500, best_time: 'September to February', 
    tags: JSON.stringify(['Spiritual', 'Temple', 'Heritage']),
    rating: 5.0, budget_per_day: '₹1000'
  });

  insertPlace.run({ 
    city_id: araku.lastInsertRowid, name: 'Borra Caves', slug: 'borra-caves', 
    description: 'Million-year-old limestone caves featuring stunning stalactite and stalagmite formations.', 
    highlights: JSON.stringify(['Natural rock formations', 'Speleothem lighting', 'Tribal area nearby']), 
    hero_image: 'https://images.unsplash.com/photo-1618179267204-6295551c68e1?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1618179267204-6295551c68e1?w=800']), 
    lat: 18.2800, lng: 83.0300, best_time: 'Winter months', 
    tags: JSON.stringify(['Nature', 'Caves', 'Adventure']),
    rating: 4.8, budget_per_day: '₹400'
  });

  // ---------- ANDAMAN & NICOBAR ----------
  const havelock = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Havelock Island', slug: 'havelock-island', description: 'Andaman\'s most famous island and a premier beach tourism hub with luxury resorts and pristine shores.', hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', lat: 12.0163, lng: 92.9975 });
  const portBlair = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Port Blair', slug: 'port-blair', description: 'The gateway to Andaman islands with rich colonial history and iconic landmarks.', hero_image: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?w=1200', lat: 11.6234, lng: 92.7265 });
  const neilIsland = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Neil Island', slug: 'neil-island', description: 'A peaceful tropical paradise with serene, calm beaches and natural rock formations.', hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', lat: 11.8340, lng: 93.0470 });
  const baratang = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Baratang Island', slug: 'baratang-island', description: 'Famous for its limestone caves, mangrove forests, and unique mud volcanoes.', hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', lat: 12.1100, lng: 92.7800 });
  const northBay = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'North Bay Island', slug: 'north-bay-island', description: 'A hub for water sports, scuba diving, and stunning coral reef views.', hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', lat: 11.7100, lng: 92.7500 });
  const rossIsland = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Ross Island', slug: 'ross-island', description: 'A fascinating blend of nature and history, featuring British-era colonial ruins.', hero_image: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?w=1200', lat: 11.6700, lng: 92.7600 });
  const nicobar = insertCity.run({ state_id: stateIds['andaman-and-nicobar'], name: 'Nicobar Islands', slug: 'nicobar-islands', description: 'The remote and pristine southern part of the archipelago, home to Indira Point.', hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', lat: 7.0000, lng: 93.8000 });

  insertPlace.run({ 
    city_id: havelock.lastInsertRowid, name: 'Radhanagar Beach', slug: 'radhanagar-beach', 
    description: 'Consistently ranked as one of Asia\'s best beaches, famous for its white sand and turquoise water.', 
    highlights: JSON.stringify(['Asia\'s best beaches', 'White sand + turquoise water', 'Famous for sunset photography']), 
    hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1589135410974-dc4423718622?w=800']), 
    lat: 12.0000, lng: 92.9800, best_time: 'October to May', 
    tags: JSON.stringify(['Beach', 'Nature', 'Photography']),
    rating: 5.0, budget_per_day: '₹2000'
  });

  insertPlace.run({ 
    city_id: havelock.lastInsertRowid, name: 'Elephant Beach', slug: 'elephant-beach', 
    description: 'Famous for its vibrant coral reefs and world-class snorkeling in crystal clear water.', 
    highlights: JSON.stringify(['Snorkeling hub', 'Coral reefs', 'Crystal clear water']), 
    hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=800']), 
    lat: 12.0100, lng: 92.9900, best_time: 'October to May', 
    tags: JSON.stringify(['Adventure', 'Coral Reef', 'Snorkeling']),
    rating: 4.8, budget_per_day: '₹1500 for activities'
  });

  insertPlace.run({ 
    city_id: havelock.lastInsertRowid, name: 'Havelock Island Hub', slug: 'havelock-island-hub', 
    description: 'The primary tourism hub of Andaman, famous for luxury resorts and being the gateway to Radhanagar Beach.', 
    highlights: JSON.stringify(['Andaman\'s most famous island', 'Luxury resorts', 'Beach tourism hub']), 
    hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1589135410974-dc4423718622?w=800']), 
    lat: 12.0163, lng: 92.9975, best_time: 'October to May', 
    tags: JSON.stringify(['Island', 'Luxury', 'Hub']),
    rating: 4.9, budget_per_day: '₹3000'
  });

  insertPlace.run({ 
    city_id: portBlair.lastInsertRowid, name: 'Cellular Jail', slug: 'cellular-jail', 
    description: 'A historic British-era prison that serves as a reminder of India\'s freedom struggle.', 
    highlights: JSON.stringify(['Historic British-era prison', 'India\'s freedom struggle', 'Evening Light & Sound show']), 
    hero_image: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1518384401463-d3876163c195?w=800']), 
    lat: 11.6738, lng: 92.7480, best_time: 'Year-round', 
    tags: JSON.stringify(['History', 'Memorial', 'Culture']),
    rating: 4.9, budget_per_day: '₹500'
  });

  insertPlace.run({ 
    city_id: portBlair.lastInsertRowid, name: 'Mount Harriet', slug: 'mount-harriet', 
    description: 'The highest peak near Port Blair, offering lush jungle trekking and scenic viewpoints.', 
    highlights: JSON.stringify(['Highest peak near Port Blair', 'Jungle trekking', 'Scenic viewpoints']), 
    hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=800']), 
    lat: 11.7100, lng: 92.7300, best_time: 'October to May', 
    tags: JSON.stringify(['Nature', 'Trekking', 'Views']),
    rating: 4.7, budget_per_day: '₹800'
  });

  insertPlace.run({ 
    city_id: rossIsland.lastInsertRowid, name: 'British Colonial Ruins', slug: 'ross-island-ruins', 
    description: 'Explore the hauntingly beautiful ruins of a bygone British colonial era on Ross Island.', 
    highlights: JSON.stringify(['British colonial ruins', 'Nature + History', 'Historical landmark']), 
    hero_image: 'https://images.unsplash.com/photo-1518384401463-d3876163c195?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1518384401463-d3876163c195?w=800']), 
    lat: 11.6700, lng: 92.7600, best_time: 'Year-round', 
    tags: JSON.stringify(['History', 'Ruins', 'Nature']),
    rating: 4.8, budget_per_day: '₹600'
  });

  insertPlace.run({ 
    city_id: baratang.lastInsertRowid, name: 'Limestone Caves', slug: 'limestone-caves', 
    description: 'Venture into the mysterious limestone caves after a boat ride through mangrove forests.', 
    highlights: JSON.stringify(['Limestone caves', 'Mangrove forests', 'Mud volcano']), 
    hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1589135410974-dc4423718622?w=800']), 
    lat: 12.1100, lng: 92.7800, best_time: 'October to May', 
    tags: JSON.stringify(['Nature', 'Adventure', 'Caves']),
    rating: 4.7, budget_per_day: '₹1500 for ferry'
  });

  insertPlace.run({ 
    city_id: baratang.lastInsertRowid, name: 'Baratang Nature Trails', slug: 'baratang-nature', 
    description: 'Explore the raw nature of Baratang, including mud volcanoes and lush mangrove forests.', 
    highlights: JSON.stringify(['Mangrove forests', 'Mud volcano', 'Untouched nature']), 
    hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1589135410974-dc4423718622?w=800']), 
    lat: 12.1100, lng: 92.7800, best_time: 'October to May', 
    tags: JSON.stringify(['Nature', 'Adventure', 'Offbeat']),
    rating: 4.6, budget_per_day: '₹1000'
  });

  insertPlace.run({ 
    city_id: neilIsland.lastInsertRowid, name: 'Natural Rock Bridge', slug: 'natural-bridge-neil', 
    description: 'A stunning natural rock formation on Neil Island, perfect for photography and calm beach walks.', 
    highlights: JSON.stringify(['Natural rock bridge', 'Calm beaches', 'Perfect for photography']), 
    hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=800']), 
    lat: 11.8340, lng: 93.0470, best_time: 'October to May', 
    tags: JSON.stringify(['Nature', 'Photography', 'Beach']),
    rating: 4.8, budget_per_day: '₹1000'
  });

  insertPlace.run({ 
    city_id: northBay.lastInsertRowid, name: 'Coral Reef North Bay', slug: 'north-bay-coral', 
    description: 'The best spot for scuba diving and viewing extensive coral reefs near Port Blair.', 
    highlights: JSON.stringify(['Scuba diving', 'Coral reef view', 'Water sports hub']), 
    hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=800']), 
    lat: 11.7100, lng: 92.7500, best_time: 'October to May', 
    tags: JSON.stringify(['Scuba Diving', 'Coral Reef', 'Adventure']),
    rating: 4.7, budget_per_day: '₹2500 for diving'
  });

  insertPlace.run({ 
    city_id: nicobar.lastInsertRowid, name: 'Indira Point', slug: 'indira-point', 
    description: 'The southernmost point of India, featuring a remote lighthouse and a truly unique travel experience.', 
    highlights: JSON.stringify(['India\'s southernmost point', 'Lighthouse view', 'Rare tourist destination']), 
    hero_image: 'https://images.unsplash.com/photo-1589135410974-dc4423718622?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1589135410974-dc4423718622?w=800']), 
    lat: 6.7500, lng: 93.8400, best_time: 'October to April', 
    tags: JSON.stringify(['Landmark', 'Nature', 'Point']),
    rating: 4.9, budget_per_day: '₹5000 (Expedition)'
  });

  // ---------- ARUNACHAL PRADESH ----------
  const tawang = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Tawang', slug: 'tawang', description: 'Holy town and home of monks, famous for the majestic Tawang Monastery and stunning Himalayan vistas.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 27.5878, lng: 91.8594 });
  const ziro = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Ziro Valley', slug: 'ziro-valley', description: 'A beautiful UNESCO tentative site famous for its green valleys, tribal culture, and the Ziro Music Festival.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 27.5922, lng: 93.8384 });
  const selapass = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Sela Pass', slug: 'sela-pass', description: 'A high-altitude mountain pass at 13,700 ft, known for its snow-capped mountains and the serene Sela Lake.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 27.5100, lng: 92.1100 });
  const dirang = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Dirang Valley', slug: 'dirang-valley', description: 'A scenic river valley known for its apple orchards, hot springs, and Himalayan landscapes.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 27.3500, lng: 92.2300 });
  const bomdila = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Bomdila', slug: 'bomdila', description: 'A peaceful town offering spectacular views of the Himalayas and beautiful Buddhist monasteries.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 27.2600, lng: 92.4100 });
  const mechuka = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Mechuka Valley', slug: 'mechuka-valley', description: 'A hidden valley near the China border, often called the "Switzerland of Arunachal" for its snow peaks and rivers.', hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', lat: 28.6000, lng: 94.1200 });
  const namdapha = insertCity.run({ state_id: stateIds['arunachal-pradesh'], name: 'Namdapha National Park', slug: 'namdapha', description: 'A massive national park featuring dense rainforests and some of the rarest wildlife in India.', hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', lat: 27.4800, lng: 96.4800 });

  insertPlace.run({ 
    city_id: tawang.lastInsertRowid, name: 'Tawang Monastery', slug: 'tawang-monastery', 
    description: 'The largest Buddhist monastery in India, perched at 10,000 ft in the Himalayas.', 
    highlights: JSON.stringify(['India\'s largest monastery', 'Himalayan mountain views', 'Iconic tourist photography spot']), 
    hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=800']), 
    lat: 27.5850, lng: 91.8550, best_time: 'April to October', 
    tags: JSON.stringify(['Monastery', 'Himalayas', 'Culture']),
    rating: 4.9, budget_per_day: '₹500 for entry'
  });

  insertPlace.run({ 
    city_id: tawang.lastInsertRowid, name: 'Gorichen Peak', slug: 'gorichen-peak', 
    description: 'The highest peak in Arunachal Pradesh, a premier adventure trekking destination.', 
    highlights: JSON.stringify(['Highest peak of the state', 'Adventure trekking', 'Snow peaks']), 
    hero_image: 'https://images.unsplash.com/photo-1630303449525-01901c3f65c0?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1630303449525-01901c3f65c0?w=800']), 
    lat: 27.8000, lng: 92.5000, best_time: 'April to June, September to October', 
    tags: JSON.stringify(['Trekking', 'Adventure', 'Peak']),
    rating: 4.8, budget_per_day: '₹2000 for trekking'
  });

  insertPlace.run({ 
    city_id: ziro.lastInsertRowid, name: 'Ziro Valley Landscape', slug: 'ziro-landscape', 
    description: 'Beautiful green valley with tribal villages and stunning landscape photography opportunities.', 
    highlights: JSON.stringify(['Green valley + tribal villages', 'UNESCO tentative site', 'Beautiful landscape photography']), 
    hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=800']), 
    lat: 27.5922, lng: 93.8384, best_time: 'September to March', 
    tags: JSON.stringify(['Nature', 'Culture', 'Photography']),
    rating: 4.7, budget_per_day: '₹1000 per day'
  });

  insertPlace.run({ 
    city_id: selapass.lastInsertRowid, name: 'Sela Lake', slug: 'sela-lake', 
    description: 'Crystal clear lake at Sela Pass, offering breathtaking views of the snow-clad mountains.', 
    highlights: JSON.stringify(['13,700 ft mountain pass', 'Snow mountains + lake', 'Scenic drive']), 
    hero_image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800']), 
    lat: 27.5050, lng: 92.1050, best_time: 'March to October', 
    tags: JSON.stringify(['Pass', 'Lake', 'Snow']),
    rating: 4.9, budget_per_day: '₹0'
  });

  insertPlace.run({ 
    city_id: namdapha.lastInsertRowid, name: 'Namdapha Wildlife', slug: 'namdapha-wildlife', 
    description: 'Explore the diverse biodiversity of Namdapha National Park, home to rare wildlife.', 
    highlights: JSON.stringify(['Dense rainforest', 'Rare wildlife (Red Panda, Snow Leopard)', 'Biodiversity hotspot']), 
    hero_image: 'https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1544273621-0c58a8aeb24e?w=800']), 
    lat: 27.4800, lng: 96.4800, best_time: 'October to April', 
    tags: JSON.stringify(['Wildlife', 'Nature', 'Park']),
    rating: 4.6, budget_per_day: '₹1500 for safari'
  });

  insertPlace.run({ 
    city_id: bomdila.lastInsertRowid, name: 'Bomdila Monastery', slug: 'bomdila-monastery', 
    description: 'A peaceful Buddhist monastery offering a serene atmosphere and panoramic Himalayan views.', 
    highlights: JSON.stringify(['Peaceful Buddhist monastery', 'Himalayan view', 'Local handicrafts']), 
    hero_image: 'https://images.unsplash.com/photo-1613339027986-b94d85708995?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1613339027986-b94d85708995?w=800']), 
    lat: 27.2650, lng: 92.4150, best_time: 'Year-round', 
    tags: JSON.stringify(['Monastery', 'Culture', 'Views']),
    rating: 4.5, budget_per_day: '₹200'
  });

  insertPlace.run({ 
    city_id: dirang.lastInsertRowid, name: 'Dirang Landscapes', slug: 'dirang-landscapes', 
    description: 'Beautiful river valley with rolling hills and scenic landscapes perfect for relaxation.', 
    highlights: JSON.stringify(['River valley + hills', 'Scenic landscapes', 'Apple orchards']), 
    hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=800']), 
    lat: 27.3550, lng: 92.2350, best_time: 'October to April', 
    tags: JSON.stringify(['Valley', 'Scenic', 'Nature']),
    rating: 4.6, budget_per_day: '₹800'
  });

  insertPlace.run({ 
    city_id: mechuka.lastInsertRowid, name: 'Mechuka Hidden Valley', slug: 'mechuka-hidden-valley', 
    description: 'An untouched paradise near the China border with snow peaks and the Yargyap Chu river.', 
    highlights: JSON.stringify(['Hidden valley near China border', 'Snow peaks + river', 'Switzerland of the East']), 
    hero_image: 'https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=1200', 
    gallery: JSON.stringify(['https://images.unsplash.com/photo-1628443266300-e8490ee38875?w=800']), 
    lat: 28.6050, lng: 94.1250, best_time: 'March to June, September to November', 
    tags: JSON.stringify(['Valley', 'Adventure', 'Snow']),
    rating: 4.8, budget_per_day: '₹1200'
  });

  const cityPalaceJaipur = insertPlace.run({ city_id: jaipur.lastInsertRowid, name: 'City Palace', slug: 'city-palace-jaipur', description: 'A vast palatial complex housing royal museums, the famous Mubarak Mahal, and the Chandra Mahal where the royal family still resides.', highlights: JSON.stringify(['Mubarak Mahal', 'Chandra Mahal', 'Royal Museum', 'Peacock Gate']), hero_image: 'https://images.unsplash.com/photo-1576487503451-6acd3da69de7?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1576487503451-6acd3da69de7?w=800']), lat: 26.9258, lng: 75.8237, best_time: 'October to March', tags: JSON.stringify(['Palace', 'Museum', 'Heritage']), rating: 4.7, budget_per_day: '₹700 for entry' });


  const mehrangarh = insertPlace.run({ city_id: jodhpur.lastInsertRowid, name: 'Mehrangarh Fort', slug: 'mehrangarh-fort', description: 'One of the largest forts in India, perched 400 feet above the Blue City with awe-inspiring views of Jodhpur.', highlights: JSON.stringify(['Panoramic views of Jodhpur', 'Museum with royal artifacts', 'Intricate carved screens', 'Walking tours']), hero_image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800', 'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=800']), lat: 26.2979, lng: 73.0187, best_time: 'October to February', tags: JSON.stringify(['Fort', 'Museum', 'Views']), rating: 4.8, budget_per_day: '₹500 for entry' });
  insertPlace.run({ city_id: jodhpur.lastInsertRowid, name: 'Umaid Bhawan Palace', slug: 'umaid-bhawan-palace', description: 'One of the world\'s largest private residences — a golden sandstone marvel, part royal home, part heritage hotel, part museum.', highlights: JSON.stringify(['Art deco interiors', 'Palace museum', 'Luxury hotel wing', 'Vintage car collection']), hero_image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800']), lat: 26.2759, lng: 73.0486, best_time: 'November to February', tags: JSON.stringify(['Palace', 'Luxury', 'Museum']), rating: 4.7, budget_per_day: '₹1000 for museum' });

  const cityPalaceUdaipur = insertPlace.run({ city_id: udaipur.lastInsertRowid, name: 'City Palace Udaipur', slug: 'city-palace-udaipur', description: 'The largest palace complex in Rajasthan, rising grandly from the shores of Lake Pichola with stunning lake and mountain views.', highlights: JSON.stringify(['Lake Pichola views', 'Balconies and turrets', 'Crystal Gallery', 'Vintage car museum']), hero_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']), lat: 24.5789, lng: 73.6831, best_time: 'September to March', tags: JSON.stringify(['Palace', 'Lake', 'Heritage']), rating: 4.8, budget_per_day: '₹800 for entry' });
  insertPlace.run({ city_id: udaipur.lastInsertRowid, name: 'Lake Pichola', slug: 'lake-pichola', description: 'An enchanting artificial lake with island palaces, boat rides, and serene sunset vistas.', highlights: JSON.stringify(['Jag Mandir island palace', 'Evening boat cruise', 'Sunset over the Aravalli hills', 'Floating restaurant']), hero_image: 'https://images.unsplash.com/photo-1512100356956-c1227c3464d1?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1512100356956-c1227c3464d1?w=800']), lat: 24.5770, lng: 73.6754, best_time: 'October to March', tags: JSON.stringify(['Lake', 'Boat Ride', 'Sunset']), rating: 4.9, budget_per_day: '₹500 for boat ride' });


  // nearby for amber fort
  insertNearby.run({ place_id: amberFort.lastInsertRowid, name: 'Jaigarh Fort', type: 'Fort', distance_km: 1.4, description: 'Hilltop fort with the world\'s largest cannon on wheels.' });
  insertNearby.run({ place_id: amberFort.lastInsertRowid, name: 'Nahargarh Fort', type: 'Fort', distance_km: 6.2, description: 'Scenic fort with panoramic views of Jaipur city.' });
  insertNearby.run({ place_id: amberFort.lastInsertRowid, name: 'Panna Meena Ka Kund', type: 'Stepwell', distance_km: 0.5, description: 'Ancient geometric stepwell perfect for photography.' });

  // transport for jaipur
  insertTransport.run({ city_id: jaipur.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 200, price_max: 800, icon: '🚕' });
  insertTransport.run({ city_id: jaipur.lastInsertRowid, type: 'Auto Rickshaw', provider: 'Local Auto', price_min: 80, price_max: 300, icon: '🛺' });
  insertTransport.run({ city_id: jaipur.lastInsertRowid, type: 'Bike Rental', provider: 'HJ Bikes', price_min: 300, price_max: 600, icon: '🏍️' });
  insertTransport.run({ city_id: jaipur.lastInsertRowid, type: 'Bus', provider: 'RSRTC', price_min: 30, price_max: 100, icon: '🚌' });

  // stays for jaipur
  insertStay.run({ city_id: jaipur.lastInsertRowid, name: 'The Raj Palace', stars: 5, price_per_night: 12000, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'WiFi', 'Heritage Tours']), address: 'Chomu Haveli, Jaipur' });
  insertStay.run({ city_id: jaipur.lastInsertRowid, name: 'ITC Rajputana', stars: 5, price_per_night: 8500, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Pool', 'Gym', 'Restaurant', 'WiFi', 'Bar']), address: 'Palace Rd, Jaipur' });
  insertStay.run({ city_id: jaipur.lastInsertRowid, name: 'Zostel Jaipur', stars: 2, price_per_night: 600, photo: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', amenities: JSON.stringify(['WiFi', 'Common Kitchen', 'Lockers', 'Social Events']), address: 'Near Hawa Mahal, Jaipur' });

  // stays for jodhpur
  insertTransport.run({ city_id: jodhpur.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 250, price_max: 900, icon: '🚕' });
  insertTransport.run({ city_id: jodhpur.lastInsertRowid, type: 'Bike Rental', provider: 'HJ Bikes', price_min: 350, price_max: 700, icon: '🏍️' });
  insertStay.run({ city_id: jodhpur.lastInsertRowid, name: 'Raas Jodhpur', stars: 5, price_per_night: 15000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'WiFi', 'Fort Views']), address: 'Tunwarji ka Jhalra, Jodhpur' });
  insertStay.run({ city_id: jodhpur.lastInsertRowid, name: 'Blue House Hostel', stars: 2, price_per_night: 500, photo: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', amenities: JSON.stringify(['WiFi', 'Terrace', 'Common Area']), address: 'Old City, Jodhpur' });

  // stays & transport for Udaipur
  insertTransport.run({ city_id: udaipur.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 250, price_max: 900, icon: '🚕' });
  insertTransport.run({ city_id: udaipur.lastInsertRowid, type: 'Boat/Ferry', provider: 'Lake Cruises', price_min: 400, price_max: 1200, icon: '⛴️' });
  insertStay.run({ city_id: udaipur.lastInsertRowid, name: 'The Leela Palace Udaipur', stars: 5, price_per_night: 35000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'Lake View', 'Spa', 'Fine Dining']), address: 'Lake Pichola, Udaipur' });
  insertStay.run({ city_id: udaipur.lastInsertRowid, name: 'Lake Pichola Hotel', stars: 4, price_per_night: 6000, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['WiFi', 'Restaurant', 'Lake View']), address: 'Udaipur' });

  // ---------- GOA ----------
  const panaji = insertCity.run({ state_id: stateIds['goa'], name: 'Panaji', slug: 'panaji', description: 'Goa\'s charming capital — a Portuguese-influenced town with colorful houses, a lively riverfront, and excellent food.', hero_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', lat: 15.4989, lng: 73.8278 });
  const calangute = insertCity.run({ state_id: stateIds['goa'], name: 'Calangute', slug: 'calangute', description: 'The Queen of Beaches — North Goa\'s most popular stretch with water sports, shacks, and golden sands.', hero_image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200', lat: 15.5440, lng: 73.7552 });

  const baga = insertPlace.run({ city_id: calangute.lastInsertRowid, name: 'Baga Beach', slug: 'baga-beach', description: 'Goa\'s most vibrant beach — famous for water sports, beach shacks, and an electric nightlife scene.', highlights: JSON.stringify(['Water sports (parasailing, jet ski)', 'Famous Britto\'s restaurant', 'Tito\'s nightclub', 'Flea markets nearby']), hero_image: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800', 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800']), lat: 15.5553, lng: 73.7516, best_time: 'November to February', tags: JSON.stringify(['Beach', 'Nightlife', 'Water Sports']), rating: 4.8, budget_per_day: '₹2000' });
  insertPlace.run({ city_id: calangute.lastInsertRowid, name: 'Calangute Beach', slug: 'calangute-beach', description: 'The most famous beach in Goa — wide golden sands, calm waters, and a wonderful mix of local life and tourism.', highlights: JSON.stringify(['Spacious shoreline', 'Water sports hub', 'Beachside shacks', 'Shopping stalls']), hero_image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800']), lat: 15.5440, lng: 73.7552, best_time: 'November to February', tags: JSON.stringify(['Beach', 'Family', 'Swimming']), rating: 4.7, budget_per_day: '₹1500' });

  insertNearby.run({ place_id: baga.lastInsertRowid, name: 'Anjuna Beach', type: 'Beach', distance_km: 4.5, description: 'Famous for the Wednesday flea market and psychedelic parties.' });
  insertNearby.run({ place_id: baga.lastInsertRowid, name: 'Chapora Fort', type: 'Fort', distance_km: 6, description: 'Ruins of a Portuguese fort with iconic views — setting of the movie Dil Chahta Hai.' });

  insertTransport.run({ city_id: calangute.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 200, price_max: 700, icon: '🚕' });
  insertTransport.run({ city_id: calangute.lastInsertRowid, type: 'Scooter Rental', provider: 'HJ Rides', price_min: 300, price_max: 500, icon: '🛵' });
  insertTransport.run({ city_id: calangute.lastInsertRowid, type: 'Bike Rental', provider: 'HJ Bikes', price_min: 500, price_max: 800, icon: '🏍️' });

  insertStay.run({ city_id: calangute.lastInsertRowid, name: 'Taj Holiday Village Resort', stars: 5, price_per_night: 18000, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Beach Access', 'Pool', 'Spa', 'Restaurant', 'WiFi']), address: 'Sinquerim, Calangute, Goa' });
  insertStay.run({ city_id: calangute.lastInsertRowid, name: 'Backpacker Panda Goa', stars: 2, price_per_night: 700, photo: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', amenities: JSON.stringify(['WiFi', 'Common Kitchen', 'Beach Nearby', 'Events']), address: 'Baga Road, Goa' });

  // Panaji (Goa)
  insertTransport.run({ city_id: panaji.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 200, price_max: 800, icon: '🚕' });
  insertTransport.run({ city_id: panaji.lastInsertRowid, type: 'Scooter Rental', provider: 'HJ Rides', price_min: 350, price_max: 600, icon: '🛵' });
  insertStay.run({ city_id: panaji.lastInsertRowid, name: 'Vivanta Goa, Panaji', stars: 5, price_per_night: 9000, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Pool', 'WiFi', 'Gym', 'Restaurant']), address: 'Panaji' });
  insertStay.run({ city_id: panaji.lastInsertRowid, name: 'Old Quarter Hostel', stars: 2, price_per_night: 800, photo: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600', amenities: JSON.stringify(['WiFi', 'Social', 'Cafe']), address: 'Fontainhas, Panaji' });

  // ---------- KERALA ----------
  const kochi = insertCity.run({ state_id: stateIds['kerala'], name: 'Kochi', slug: 'kochi', description: 'The Queen of the Arabian Sea — a port city where Dutch, Portuguese, Chinese, and Indian cultures beautifully collide.', hero_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200', lat: 9.9312, lng: 76.2673 });
  const munnar = insertCity.run({ state_id: stateIds['kerala'], name: 'Munnar', slug: 'munnar', description: 'A highland paradise — endless emerald tea estates, misty valleys, and waterfalls in the Western Ghats.', hero_image: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=1200', lat: 10.0889, lng: 77.0595 });
  const alleppey = insertCity.run({ state_id: stateIds['kerala'], name: 'Alleppey', slug: 'alleppey', description: 'The Venice of the East — a labyrinth of canals and backwaters best explored by houseboat.', hero_image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=1200', lat: 9.4981, lng: 76.3388 });

  const chineseFishingNets = insertPlace.run({ city_id: kochi.lastInsertRowid, name: 'Chinese Fishing Nets', slug: 'chinese-fishing-nets', description: 'Giant cantilevered fishing nets on the Fort Kochi waterfront — a symbol of Kerala and one of India\'s most photographed sights.', highlights: JSON.stringify(['Sunset silhouette photography', 'Buy fresh catch from fishermen', 'Fort Kochi waterfront stroll', 'Historical landmark from 15th century']), hero_image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800']), lat: 9.9673, lng: 76.2423, best_time: 'October to February', tags: JSON.stringify(['Heritage', 'Photography', 'Waterfront']), rating: 4.8, budget_per_day: '₹200' });
  insertPlace.run({ city_id: munnar.lastInsertRowid, name: 'Tea Gardens Munnar', slug: 'munnar-tea-gardens', description: 'Stretching over 60,000 acres, Munnar\'s emerald tea estates are among the most beautiful in the world.', highlights: JSON.stringify(['Tea factory tours', 'Scenic viewpoints', 'Wildlife sightings', 'Fresh tea tasting']), hero_image: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1571401835393-8c5f35328320?w=800']), lat: 10.0889, lng: 77.0595, best_time: 'September to March', tags: JSON.stringify(['Nature', 'Tea', 'Hills']), rating: 4.9, budget_per_day: '₹1000' });
  const houseboats = insertPlace.run({ city_id: alleppey.lastInsertRowid, name: 'Alleppey Backwaters', slug: 'alleppey-backwaters', description: 'A tranquil world of shimmering canals, rice paddies, and traditional kettuvallam (houseboat) cruises.', highlights: JSON.stringify(['Houseboat stays', 'Village canoe tours', 'Sunrise on the backwaters', 'Village life and culture']), hero_image: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=800']), lat: 9.4981, lng: 76.3388, best_time: 'November to February', tags: JSON.stringify(['Houseboat', 'Nature', 'Water']), rating: 4.8, budget_per_day: '₹5000' });

  insertNearby.run({ place_id: chineseFishingNets.lastInsertRowid, name: 'Fort Kochi Beach', type: 'Beach', distance_km: 0.5, description: 'Historic beach with colonial-era buildings and sea views.' });
  insertNearby.run({ place_id: chineseFishingNets.lastInsertRowid, name: 'Jew Town & Paradesi Synagogue', type: 'Heritage', distance_km: 2, description: 'India\'s oldest synagogue in a colourful spice-trading quarter.' });

  insertTransport.run({ city_id: kochi.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 200, price_max: 900, icon: '🚕' });
  insertTransport.run({ city_id: kochi.lastInsertRowid, type: 'Ferry', provider: 'KSWTD', price_min: 10, price_max: 50, icon: '⛴️' });
  insertTransport.run({ city_id: kochi.lastInsertRowid, type: 'Bike Rental', provider: 'HJ Bikes', price_min: 400, price_max: 700, icon: '🏍️' });

  insertStay.run({ city_id: kochi.lastInsertRowid, name: 'Brunton Boatyard', stars: 5, price_per_night: 14000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'Spa', 'Restaurant', 'WiFi', 'Heritage Building']), address: 'Fort Kochi, Kochi' });
  insertStay.run({ city_id: alleppey.lastInsertRowid, name: 'Houseboat Premium', stars: 4, price_per_night: 7000, photo: 'https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?w=600', amenities: JSON.stringify(['All meals', 'Private deck', 'AC bedroom', 'Sunset views']), address: 'Alleppey Backwaters' });

  // ---------- HIMACHAL PRADESH ----------
  const manali = insertCity.run({ state_id: stateIds['himachal-pradesh'], name: 'Manali', slug: 'manali', description: 'The adventure capital of the Himalayas — snow-peaked mountains, river valleys, and thrilling treks.', hero_image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200', lat: 32.2396, lng: 77.1887 });
  const shimla = insertCity.run({ state_id: stateIds['himachal-pradesh'], name: 'Shimla', slug: 'shimla', description: 'The Queen of Hill Stations — the colonial charm of British India with sweeping Himalayan vistas.', hero_image: 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1200', lat: 31.1048, lng: 77.1734 });

  const rohtangPass = insertPlace.run({ city_id: manali.lastInsertRowid, name: 'Rohtang Pass', slug: 'rohtang-pass', description: 'A high-altitude mountain pass at 3,978 m connecting Manali to the Lahaul and Spiti Valleys — snow-laden even in summer.', highlights: JSON.stringify(['Snow activities year-round', 'Panoramic Himalayan views', 'Gateway to Spiti Valley', 'Photography paradise']), hero_image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800']), lat: 32.3705, lng: 77.2490, best_time: 'May to October', tags: JSON.stringify(['Mountain', 'Snow', 'Adventure']), rating: 4.8, budget_per_day: '₹550 for permit' });
  insertPlace.run({ city_id: manali.lastInsertRowid, name: 'Solang Valley', slug: 'solang-valley', description: 'A panoramic valley offering skiing, paragliding, and cable car rides with breathtaking views.', highlights: JSON.stringify(['Skiing in winter', 'Paragliding', 'Cable car', 'Camping']), hero_image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800']), lat: 32.3190, lng: 77.1540, best_time: 'November to June', tags: JSON.stringify(['Skiing', 'Adventure', 'Valley']), rating: 4.7, budget_per_day: '₹1500 for paragliding' });

  insertNearby.run({ place_id: rohtangPass.lastInsertRowid, name: 'Beas River Rafting', type: 'Activity', distance_km: 15, description: 'Exciting white-water rafting on the Beas River.' });
  insertNearby.run({ place_id: rohtangPass.lastInsertRowid, name: 'Hidimba Devi Temple', type: 'Temple', distance_km: 50, description: 'Ancient 16th-century temple in a cedar forest.' });

  insertTransport.run({ city_id: manali.lastInsertRowid, type: 'Cab', provider: 'HJ Mountain Cabs', price_min: 400, price_max: 2000, icon: '🚕' });
  insertTransport.run({ city_id: manali.lastInsertRowid, type: 'Bike Rental', provider: 'HJ Bikes', price_min: 600, price_max: 1200, icon: '🏍️' });
  insertTransport.run({ city_id: manali.lastInsertRowid, type: 'Bus', provider: 'HRTC', price_min: 50, price_max: 200, icon: '🚌' });

  insertStay.run({ city_id: manali.lastInsertRowid, name: 'The Himalayan Resort', stars: 4, price_per_night: 6000, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Mountain views', 'Bonfire', 'Restaurant', 'WiFi']), address: 'Old Manali Road, Manali' });
  insertStay.run({ city_id: manali.lastInsertRowid, name: 'Snow Valley Resorts', stars: 3, price_per_night: 3000, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Mountain views', 'Restaurant', 'WiFi', 'Parking']), address: 'Hadimba Road, Manali' });

  // ---------- UTTAR PRADESH ----------
  const agra = insertCity.run({ state_id: stateIds['uttar-pradesh'], name: 'Agra', slug: 'agra', description: 'The city of the Taj Mahal — an eternal monument to love along the banks of the Yamuna.', hero_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200', lat: 27.1767, lng: 78.0081 });
  const varanasi = insertCity.run({ state_id: stateIds['uttar-pradesh'], name: 'Varanasi', slug: 'varanasi', description: 'The spiritual capital of India — one of the world\'s oldest living cities, where the Ganges carries the soul of India.', hero_image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200', lat: 25.3176, lng: 82.9739 });

  const tajMahal = insertPlace.run({ city_id: agra.lastInsertRowid, name: 'Taj Mahal', slug: 'taj-mahal', description: 'The crown jewel of India — a UNESCO World Heritage Site and one of the Seven Wonders of the World, built by Emperor Shah Jahan for his beloved Mumtaz Mahal.', highlights: JSON.stringify(['UNESCO World Heritage Site', 'Sunrise and sunset views', 'Pietra dura inlay work', 'Mughal gardens']), hero_image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800']), lat: 27.1751, lng: 78.0421, best_time: 'October to March', tags: JSON.stringify(['UNESCO', 'Wonder', 'Heritage', 'Mughal']), rating: 4.9, budget_per_day: '₹1100 for entry' });
  insertPlace.run({ city_id: varanasi.lastInsertRowid, name: 'Dasaswamedh Ghat', slug: 'dasaswamedh-ghat', description: 'The main ghat of Varanasi — the site of a spectacular Ganga Aarti ceremony every night, a deeply moving spiritual spectacle.', highlights: JSON.stringify(['Ganga Aarti ceremony at sunset', 'Morning boat ride', 'Steps leading to the Ganges', 'Ancient temples nearby']), hero_image: 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=1200', gallery: JSON.stringify(['https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800']), lat: 25.3050, lng: 83.0147, best_time: 'October to March', tags: JSON.stringify(['Spiritual', 'River', 'Ghat', 'Aarti']), rating: 4.8, budget_per_day: '₹300 for boat ride' });

  insertNearby.run({ place_id: tajMahal.lastInsertRowid, name: 'Agra Fort', type: 'Fort', distance_km: 2.5, description: 'A massive 16th-century Mughal fort and UNESCO World Heritage Site.' });
  insertNearby.run({ place_id: tajMahal.lastInsertRowid, name: 'Itmad-ud-Daulah', type: 'Tomb', distance_km: 5, description: 'Known as the "Baby Taj" — a jewel-box of a tomb with intricate marble inlay work.' });
  insertNearby.run({ place_id: tajMahal.lastInsertRowid, name: 'Mehtab Bagh', type: 'Garden', distance_km: 1.5, description: 'Mughal garden across the Yamuna offering the best view of the Taj at sunset.' });

  insertTransport.run({ city_id: agra.lastInsertRowid, type: 'Cab', provider: 'HJ Cabs', price_min: 300, price_max: 1200, icon: '🚕' });
  insertTransport.run({ city_id: agra.lastInsertRowid, type: 'Auto Rickshaw', provider: 'Local Auto', price_min: 50, price_max: 200, icon: '🛺' });
  insertTransport.run({ city_id: agra.lastInsertRowid, type: 'Tonga/Horse Carriage', provider: 'Heritage Ride', price_min: 150, price_max: 400, icon: '🐴' });

  insertStay.run({ city_id: agra.lastInsertRowid, name: 'Oberoi Amarvilas', stars: 5, price_per_night: 45000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Taj Views from every room', 'Pool', 'Spa', 'Restaurant', 'WiFi']), address: 'Taj East Gate Road, Agra' });
  insertStay.run({ city_id: agra.lastInsertRowid, name: 'Hotel Taj Resorts', stars: 3, price_per_night: 2500, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Restaurant', 'WiFi', 'Parking', 'Tour Desk']), address: 'Fatehabad Road, Agra' });

  // ANDAMAN TRANSPORT & STAYS
  [havelock, portBlair, neilIsland, baratang].forEach(city => {
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Cab', provider: 'Island Cabs', price_min: 500, price_max: 1500, icon: '🚕' });
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Scooter Rental', provider: 'Island Rides', price_min: 400, price_max: 800, icon: '🛵' });
    if (city === portBlair) {
       insertTransport.run({ city_id: city.lastInsertRowid, type: 'Ferry', provider: 'Green Ocean', price_min: 1000, price_max: 2500, icon: '⛴️' });
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Fortune Resort Bay Island', stars: 4, price_per_night: 9000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'Sea View', 'WiFi']), address: 'Port Blair' });
    } else if (city === havelock) {
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Taj Exotica Resort & Spa', stars: 5, price_per_night: 45000, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Private Beach', 'Pool', 'Fine Dining']), address: 'Radhanagar Beach, Havelock' });
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Barefoot at Havelock', stars: 4, price_per_night: 15000, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Eco-friendly', 'Beach Access', 'WiFi']), address: 'Havelock' });
    } else {
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Seashell Neil', stars: 4, price_per_night: 8000, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['WiFi', 'Pool', 'Bar']), address: city.name });
    }
  });

  // ARUNACHAL TRANSPORT & STAYS
  [tawang, ziro, bomdila, mechuka].forEach(city => {
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Sumo/SUV', provider: 'Himalayan Travel', price_min: 2000, price_max: 5000, icon: '🚙' });
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Shared Cab', provider: 'Local Shared', price_min: 500, price_max: 1000, icon: '🚐' });
    insertStay.run({ city_id: city.lastInsertRowid, name: 'Gakyi Khang Zhang', stars: 3, price_per_night: 4500, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['WiFi', 'Restaurant', 'Mountain View']), address: city.name });
  });

  // SHIMLA (Himachal)
  insertTransport.run({ city_id: shimla.lastInsertRowid, type: 'Cab', provider: 'Shimla Cabs', price_min: 300, price_max: 1200, icon: '🚕' });
  insertStay.run({ city_id: shimla.lastInsertRowid, name: 'The Oberoi Cecil', stars: 5, price_per_night: 18000, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'WiFi', 'Heritage', 'Luxury']), address: 'Shimla' });

  // VARANASI (UP)
  insertTransport.run({ city_id: varanasi.lastInsertRowid, type: 'Electric Rickshaw', provider: 'Local E-Auto', price_min: 30, price_max: 100, icon: '🛺' });
  insertTransport.run({ city_id: varanasi.lastInsertRowid, type: 'Boat Rental', provider: 'Ghat Boats', price_min: 200, price_max: 800, icon: '🛶' });
  insertStay.run({ city_id: varanasi.lastInsertRowid, name: 'Brijrama Palace', stars: 5, price_per_night: 22000, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Ghat View', 'River Access', 'WiFi', 'Fine Dining']), address: 'Varanasi' });

  // ANDHRA PRADESH TRANSPORT & STAYS
  [vizag, tirupati, araku].forEach(city => {
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Cab', provider: 'Andhra Travels', price_min: 300, price_max: 1200, icon: '🚕' });
    insertTransport.run({ city_id: city.lastInsertRowid, type: 'Local Bus', provider: 'APSRTC', price_min: 50, price_max: 200, icon: '🚌' });
    if (city === araku) {
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Haritha Valley Resort', stars: 3, price_per_night: 3500, photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600', amenities: JSON.stringify(['Nature View', 'WiFi', 'Parking']), address: 'Araku Valley' });
    } else if (city === tirupati) {
       insertStay.run({ city_id: city.lastInsertRowid, name: 'Marasa Sarovar Premiere', stars: 5, price_per_night: 7500, photo: 'https://images.unsplash.com/photo-1590073242678-70ee3fc28e8e?w=600', amenities: JSON.stringify(['Pool', 'WiFi', 'Gym', 'Temple View']), address: 'Tirupati' });
    } else {
       insertStay.run({ city_id: city.lastInsertRowid, name: 'The Gateway Hotel (Taj)', stars: 5, price_per_night: 9500, photo: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=600', amenities: JSON.stringify(['Sea View', 'WiFi', 'Pool']), address: 'Beach Road, Vizag' });
    }
  });
}
