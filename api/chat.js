// 잔반톡 서버 함수: 학생 화면에서 받은 대화를 Claude에 보내고 답을 돌려줍니다.
// API 키는 Vercel 환경 변수(ANTHROPIC_API_KEY)에만 두고, 학생 화면에는 절대 보이지 않아요.
const { FRIENDS, rules } = require('./_personas');

const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-5-5';
const PER_MINUTE = Number(process.env.PER_MINUTE_LIMIT || 120); // 같은 학교 와이파이를 함께 쓰므로 넉넉하게

const hits = new Map();
function limited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < 60000);
  if (recent.length >= PER_MINUTE) { hits.set(ip, recent); return true; }
  recent.push(now); hits.set(ip, recent);
  return false;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 가능해요' });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: 'ANTHROPIC_API_KEY가 설정되지 않았어요' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ error: '잠시 후 다시 시도해 주세요' });

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  body = body || {};

  const friend = FRIENDS[body.friend];
  if (!friend) return res.status(400).json({ error: '알 수 없는 친구예요' });

  const nick = String(body.nick || '친구').replace(/[\r\n]/g, ' ').slice(0, 8);

  let turns = Array.isArray(body.turns) ? body.turns.slice(-14) : [];
  turns = turns
    .filter((t) => t && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string' && t.content.trim())
    .map((t) => ({ role: t.role, content: t.content.slice(0, t.role === 'user' ? 100 : 400) }));
  while (turns.length && turns[0].role !== 'user') turns.shift();
  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    return res.status(400).json({ error: '메시지가 없어요' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: rules(friend, nick),
        messages: turns,
      }),
    });
    if (!r.ok) {
      console.error('Anthropic API error', r.status, await r.text());
      return res.status(502).json({ error: '답을 만들지 못했어요' });
    }
    const data = await r.json();
    const text = (data.content || []).filter((b) => b.type === 'text').map((b) => b.text).join('').trim();
    if (!text) return res.status(502).json({ error: '빈 답이 왔어요' });
    return res.status(200).json({ text });
  } catch (e) {
    console.error(e);
    return res.status(502).json({ error: '답을 만들지 못했어요' });
  }
};
