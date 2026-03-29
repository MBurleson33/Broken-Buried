import { createClient } from '@supabase/supabase-js';

const SITE_URL = 'https://broken-buried.vercel.app';

export default async function handler(req, res) {
  const sb = createClient(
    process.env.https://olhpiqxxofcwlkpvimug.supabase.co,
    process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9saHBpcXh4b2Zjd2xrcHZpbXVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NzgxMzgsImV4cCI6MjA5MDE1NDEzOH0.7t8CE_VxXzHCEpLIFOiwRFbgsWQWRQ42QxlESgE1tGQ
  );

  const { data: posts } = await sb
    .from('posts')
    .select('slug, updated_at, created_at')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const staticPages = [
    { url: '/',     changefreq: 'daily',   priority: '1.0' },
    { url: '/blog', changefreq: 'daily',   priority: '0.9' },
  ];

  const postPages = (posts || []).map(p => ({
    url: `/post/${p.slug}`,
    lastmod: (p.updated_at || p.created_at).split('T')[0],
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
}
