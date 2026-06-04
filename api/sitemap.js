const SITE_URL = 'https://brokenandburied.com';

module.exports = async function handler(req, res) {
  try {
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/posts?select=slug,updated_at&published=eq.true&order=sort_order.desc`,
      { headers: { 'apikey': process.env.SUPABASE_ANON_KEY, 'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}` } }
    );
    const posts = await response.json();

    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/blog', priority: '0.9', changefreq: 'daily' },
      { url: '/prayer', priority: '0.7', changefreq: 'monthly' },
    ];

    const urls = [
      ...staticPages.map(p => `
  <url>
    <loc>${SITE_URL}${p.url}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
      ...(Array.isArray(posts) ? posts.map(p => `
  <url>
    <loc>${SITE_URL}/post/${p.slug}</loc>
    <lastmod>${p.updated_at ? p.updated_at.split('T')[0] : new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`) : [])
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(xml);
  } catch(e) {
    res.status(500).send('Error generating sitemap');
  }
};
