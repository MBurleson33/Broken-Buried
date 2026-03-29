export default function handler(req, res) {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Cache-Control', 's-maxage=86400');
  res.status(200).send(`User-agent: *
Allow: /

Sitemap: https://broken-buried.vercel.app/sitemap.xml`);
}
