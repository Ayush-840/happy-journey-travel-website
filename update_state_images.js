const fs = require('fs');
const https = require('https');

const queries = {
  // North
  "Himachal Pradesh": "manali-snow-mountains-pine-forest",
  "Uttarakhand": "kedarnath-temple-himalayan",
  "Punjab": "golden-temple-night",
  "Haryana": "sultanpur-national-park-birds",
  "Rajasthan": "hawa-mahal",
  "Uttar Pradesh": "taj-mahal",
  "Chandigarh (UT)": "rock-garden-chandigarh",
  "Delhi (UT)": "india-gate",
  "Ladakh (UT)": "pangong-lake",
  "Jammu & Kashmir (UT)": "dal-lake",

  // South
  "Kerala": "alleppey-backwaters-houseboat-coconut",
  "Tamil Nadu": "meenakshi-temple",
  "Karnataka": "hampi",
  "Andhra Pradesh": "tirupati-temple",
  "Telangana": "charminar",
  "Puducherry (UT)": "promenade-beach-pondicherry",
  "Lakshadweep (UT)": "agatti-island",
  "Andaman & Nicobar (UT)": "radhanagar-beach",

  // West
  "Maharashtra": "gateway-of-india",
  "Goa": "baga-beach",
  "Gujarat": "statue-of-unity",
  "Dadra and Nagar Haveli & Daman and Diu (UT)": "diu-fort",

  // Central
  "Madhya Pradesh": "khajuraho-temple",
  "Chhattisgarh": "chitrakote-falls",

  // East
  "Bihar": "mahabodhi-temple",
  "West Bengal": "howrah-bridge",
  "Odisha": "jagannath-temple",

  // Northeast
  "Arunachal Pradesh": "tawang-monastery",
  "Assam": "kaziranga",
  "Meghalaya": "living-root-bridge",
  "Sikkim": "gurudongmar-lake",
  "Manipur": "loktak-lake",
  "Mizoram": "aizawl-hills",
  "Nagaland": "hornbill-festival",
  "Tripura": "ujjayanta-palace"
};

async function fetchUnsplashId(query) {
  return new Promise((resolve) => {
    https.get(`https://unsplash.com/s/photos/${query}`, (res) => {
      let data = '';
      if (res.statusCode === 301 || res.statusCode === 302) {
          // Unsplash might redirect
          https.get(`https://unsplash.com${res.headers.location}`, (res2) => {
              res2.on('data', chunk => data += chunk);
              res2.on('end', () => {
                  const match = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/);
                  resolve(match ? match[0] : null);
              });
          }).on('error', () => resolve(null));
          return;
      }

      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const match = data.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/);
        resolve(match ? match[0] : null);
      });
    }).on('error', () => resolve(null));
  });
}

// Fallback images array if totally not found
const fallbacks = [
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da',
  'https://images.unsplash.com/photo-1564507592333-c60657eea523',
  'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2',
  'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23'
];

async function updateDbFile() {
  const dbPath = './lib/db.js';
  let content = fs.readFileSync(dbPath, 'utf8');

  for (const [stateName, q] of Object.entries(queries)) {
    console.log(`Searching for: ${stateName} (${q})...`);
    let url = await fetchUnsplashId(q) || await fetchUnsplashId(q.split('-')[0]); // try simpler term
    
    // Hardcode some ones that might fail purely
    if (!url) url = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    
    url += '?w=1200'; // add formatting
    console.log(`Found: ${url}`);
    
    // Regex to replace the hero_image string for that state
    // Make sure we match the state name precisely
    const regex = new RegExp(`(\\{ name: '${stateName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}',.*?hero_image: ')([^']+)(')`, 'g');
    content = content.replace(regex, `$1${url}$3`);
  }

  fs.writeFileSync(dbPath, content, 'utf8');
  console.log('Successfully updated lib/db.js!');
}

updateDbFile();
