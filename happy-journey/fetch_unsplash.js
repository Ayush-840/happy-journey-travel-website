const fs = require('fs');

const queries = {
  // North
  "Himachal Pradesh": "manali-snow",
  "Uttarakhand": "kedarnath-temple",
  "Punjab": "golden-temple-amritsar",
  "Haryana": "sultanpur-national-park",
  "Rajasthan": "hawa-mahal",
  "Uttar Pradesh": "taj-mahal",
  "Chandigarh (UT)": "rock-garden-chandigarh",
  "Delhi (UT)": "india-gate",
  "Ladakh (UT)": "pangong-lake",
  "Jammu & Kashmir (UT)": "dal-lake",

  // South
  "Kerala": "kerala-backwaters",
  "Tamil Nadu": "meenakshi-temple",
  "Karnataka": "hampi-india",
  "Andhra Pradesh": "tirupati-temple",
  "Telangana": "charminar-hyderabad",
  "Puducherry (UT)": "pondicherry-beach",
  "Lakshadweep (UT)": "lakshadweep-islands",
  "Andaman & Nicobar (UT)": "radhanagar-beach",

  // West
  "Maharashtra": "gateway-of-india",
  "Goa": "baga-beach-goa",
  "Gujarat": "statue-of-unity",
  "Dadra and Nagar Haveli & Daman and Diu (UT)": "diu-fort",

  // Central
  "Madhya Pradesh": "khajuraho-temples",
  "Chhattisgarh": "chitrakote-falls",

  // East
  "Bihar": "mahabodhi-temple",
  "West Bengal": "howrah-bridge",
  "Odisha": "jagannath-temple",

  // Northeast
  "Arunachal Pradesh": "tawang-monastery",
  "Assam": "kaziranga-national-park",
  "Meghalaya": "living-root-bridge",
  "Sikkim": "gurudongmar-lake",
  "Manipur": "loktak-lake",
  "Mizoram": "aizawl-city",
  "Nagaland": "hornbill-festival",
  "Tripura": "ujjayanta-palace"
};

async function getUrl(query) {
    try {
        const res = await fetch(`https://unsplash.com/s/photos/${query}`);
        const html = await res.text();
        const match = html.match(/"(https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+)[?"]/);
        return match ? match[1] + '?w=1200' : null;
    } catch(e) {
        return null;
    }
}

async function run() {
    let content = fs.readFileSync('lib/db.js', 'utf8');
    for (const [state, q] of Object.entries(queries)) {
        console.log(`Fetching ${state} (${q})...`);
        const url = await getUrl(q);
        if (url) {
            console.log(`Found: ${url}`);
            const regex = new RegExp(`(\\{ name: '${state.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}',.*?hero_image: ')([^']+)(')`, 'g');
            content = content.replace(regex, `$1${url}$3`);
        } else {
            console.log(`Failed for ${state}`);
        }
    }
    fs.writeFileSync('lib/db.js', content);
    console.log('Update complete!');
}
run();
