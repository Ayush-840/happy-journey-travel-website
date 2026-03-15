const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.join(process.cwd(), 'happy_journey.db'));

// Fallback high-quality India Unsplash images
const validImages = [
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1200',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200',
    'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200',
    'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200',
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200',
    'https://images.unsplash.com/photo-1600100397608-f0a79ad6e7e4?w=1200',
    'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200',
    'https://images.unsplash.com/photo-1609920658906-8223bd289001?w=1200',
    'https://images.unsplash.com/photo-1583313214532-a5dc3a35bf0b?w=1200',
    'https://images.unsplash.com/photo-1596707371197-0fcd14f52fb0?w=1200',
    'https://images.unsplash.com/photo-1590743152542-0f1ba3e18cf4?w=1200',
    'https://images.unsplash.com/photo-1522864698516-fb472714529f?w=1200',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200',
    'https://images.unsplash.com/photo-1627063367123-01309f3ed11c?w=1200',
    'https://images.unsplash.com/photo-1606558661642-1e9bf2abefdb?w=1200',
    'https://images.unsplash.com/photo-1581793746485-04698e79a4e8?w=1200',
    'https://images.unsplash.com/photo-1610486749942-dce421ae8dff?w=1200'
];

const updateStmt = db.prepare("UPDATE states SET hero_image = ? WHERE slug = ?");
const checkStmt = db.prepare("SELECT slug, hero_image FROM states");

const https = require('https');

async function checkUrl(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            resolve(res.statusCode === 200);
        }).on('error', () => {
             resolve(false);
        });
    });
}

(async () => {
    const states = checkStmt.all();
    console.log("Checking " + states.length + " states...");
    
    let validIndex = 0;
    
    for (const state of states) {
        process.stdout.write("Checking " + state.slug + "... ");
        const isValid = await checkUrl(state.hero_image);
        if (isValid) {
            console.log("OK");
        } else {
            console.log("BROKEN! Updating...");
            // Use one of our fallback good images
            const fallback = validImages[validIndex % validImages.length];
            updateStmt.run(fallback, state.slug);
            validIndex++;
        }
    }
    console.log("Done checking all images!");
})();
