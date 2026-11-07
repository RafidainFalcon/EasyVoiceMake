// Vercel Serverless Function — Fish Audio proxy
const ALLOWED_VOICES = new Set([
  '6843639bb79c4b0ba2c15307280465ca',
  'baeba69bf83d47f9adb0e66e8f8f1658',
  '8ea1c102258b4496b2234e6e7d20b5c2',
  '060bb46361764a668119db1f06f00982'
]);
module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'POST only' });
  }
  const key = process.env.FISH_API_KEY;
  if (!key) return res.status(500).json({ error: 'FISH_API_KEY غير مضبوط في Vercel' });
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({error:'JSON غير صالح'}); }
  }
  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const voice = body?.reference_id;
  if (!text || text.length > 500 || !ALLOWED_VOICES.has(voice))
    return res.status(400).json({error:'النص أو الصوت غير صالح'});
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55000);
  try {
    const upstream = await fetch('https://api.fish.audio/v1/tts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        model: 's2.1-pro-free'
      },
      body: JSON.stringify({text, reference_id:voice, format:'mp3'}),
      signal: controller.signal
    });
    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 350);
      return res.status(upstream.status).json({error: `Fish Audio: ${detail}`});
    }
    const audio = Buffer.from(await upstream.arrayBuffer());
    if (!audio.length) return res.status(502).json({error:'استجابة صوتية فارغة'});
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audio);
  } catch (e) {
    return res.status(e.name === 'AbortError' ? 504 : 502).json({error: e.name === 'AbortError' ? 'انتهت مهلة Fish Audio' : 'تعذر الاتصال بـ Fish Audio'});
  } finally { clearTimeout(timeout); }
};
