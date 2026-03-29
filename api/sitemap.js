const SITE_URL = 'https://brokenandburied.com';

module.exports = async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    // Fetch published posts directly via Supabase REST API — no package needed
    const response = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=slug,updated_at,created_at&published=eq.true&order=created_at.desc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        }
      }
    );

    const posts = await response.json();

    const staticPages = [
      { url: '/',     changefreq: 'daily',  priority: '1.0' },
      { url: '/blog', changefreq: 'daily',  priority: '0.9' },
    ];

    const postPages = (Array.isArray(posts) ? posts : []).map(p => ({
      url: `/post/${p.slug}`,
      lastmod: (p.updated_at || p.created_at || '').split('T')[0],
      changefreq: 'weekly',
      priority: '0.8',
    }));

    const allPages = [...staticPages, ...postPages];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(p => `  <url>
    <loc>${SITE_URL}${p.url}</loc>
    ${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).send(xml);

  } catch (err) {
    res.status(500).send('Sitemap error: ' + err.message);
  }
};
