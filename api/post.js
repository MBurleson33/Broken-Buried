const SITE_URL = 'https://brokenandburied.com';
const DEFAULT_OG = `${SITE_URL}/images/og-default.jpg`;
const SOCIAL_CRAWLERS = [
  'facebookexternalhit','twitterbot','linkedinbot','whatsapp',
  'telegrambot','slackbot','discordbot','googlebot','bingbot',
  'applebot','pinterest','iframely','embedly','vkshare',
];
module.exports = async function handler(req, res) {
  const slug = (req.query.slug || '').trim();
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  const isCrawler = SOCIAL_CRAWLERS.some(bot => userAgent.includes(bot));

  // Fetch post data for both crawlers and real visitors
  let title = 'Broken + Buried';
  let description = 'Broken + Buried — we bury ourselves daily so that we may start new every day.';
  let image = DEFAULT_OG;
  const url = `${SITE_URL}/post/${slug}`;

  if (slug) {
    try {
      const response = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/posts?select=title,excerpt,cover_image_url&slug=eq.${encodeURIComponent(slug)}&published=eq.true&limit=1`,
        {
          headers: {
            'apikey': process.env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          }
        }
      );
      const posts = await response.json();
      if (Array.isArray(posts) && posts.length > 0) {
        const post = posts[0];
        title = `${post.title} — Broken + Buried`;
        description = post.excerpt || description;
        image = post.cover_image_url || DEFAULT_OG;
      }
    } catch(e) {}
  }

  // For crawlers — return OG tags only, no redirect
  if (isCrawler) {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Broken + Buried" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
</head>
<body></body>
</html>`;
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
  }

  // For real visitors — full page with OG tags + JS that loads the SPA
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Broken + Buried" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${image}" />
  <style>body{margin:0;background:#0a0a0a;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Georgia,serif;color:#7a7670;font-size:.8rem;letter-spacing:.1em}</style>
</head>
<body>
  <p>Loading…</p>
  <script>
    // Replace current history entry so back button works correctly
    history.replaceState({target:'post',slug:'${slug}'}, '', '/post/${slug}');
    window.location.replace('/?_post=${encodeURIComponent(slug)}');
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(html);
};
