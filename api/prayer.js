module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, request } = req.body;
  if (!request) {
    return res.status(400).json({ error: 'Missing prayer request' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Broken + Buried <prayer@brokenandburied.com>',
        to: ['Burleson.Matthew@gmail.com'],
        subject: `New Prayer Request from ${name || 'Anonymous'}`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:2rem;background:#111;color:#f5f2ee;">
            <h2 style="font-family:Georgia,serif;letter-spacing:.05em;color:#b8a98a;margin-bottom:.5rem;">New Prayer Request</h2>
            <p style="color:#7a7670;font-size:.85rem;margin-bottom:2rem;border-bottom:1px solid #333;padding-bottom:1rem;">
              Received at ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })} CT
            </p>
            <p style="margin-bottom:.5rem;color:#7a7670;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;">From</p>
            <p style="margin-bottom:2rem;font-size:1.1rem;">${name || 'Anonymous'}</p>
            <p style="margin-bottom:.5rem;color:#7a7670;font-size:.8rem;text-transform:uppercase;letter-spacing:.1em;">Prayer Request</p>
            <p style="font-size:1.1rem;line-height:1.8;color:#c8c4be;padding:1.5rem;background:#1a1a1a;border-left:3px solid #8c7b5e;">${request.replace(/\n/g, '<br>')}</p>
            <p style="margin-top:2rem;font-style:italic;color:#7a7670;font-size:.9rem;">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." — Philippians 4:6</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      // Don't fail the request — prayer was saved to Supabase
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Prayer email error:', err);
    return res.status(200).json({ success: true }); // Still succeed — Supabase has the data
  }
};
