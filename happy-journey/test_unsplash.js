async function searchUnsplash(query) {
  try {
    const res = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    const html = await res.text();
    const match = html.match(/https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+/);
    if (match) {
      console.log(`Query: ${query} -> ${match[0]}?w=1200`);
    } else {
      console.log(`Query: ${query} -> Not found`);
    }
  } catch (e) {
    console.log(e);
  }
}
searchUnsplash('hawa-mahal');
searchUnsplash('golden-temple-night');
