// Cloudflare Pages Function: POST /api/contact
// Sends the feedback form to an e-mail address through the Resend API.
//
// Environment variables (Pages -> Settings -> Environment variables):
//   RESEND_API_KEY  - Resend API key (secret)
//   MAIL_TO         - recipient address(es), comma separated
//   MAIL_FROM       - sender, e.g. "Eurofasad <noreply@eurofasad.com>" (domain must be verified in Resend)

const json = (data, status = 200) =>
	new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
	});

const esc = (s) =>
	String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function onRequestPost({ request, env }) {
	let data;
	try {
		const type = request.headers.get('content-type') || '';
		if (type.includes('application/json')) data = await request.json();
		else data = Object.fromEntries(await request.formData());
	} catch {
		return json({ error: 'Некорректный запрос.' }, 400);
	}

	// honeypot: bots fill the hidden field; pretend success
	if (data.website) return json({ ok: true });

	const name = String(data.name || '').trim().slice(0, 100);
	const phone = String(data.phone || '').trim().slice(0, 30);
	const email = String(data.email || '').trim().slice(0, 150);
	const message = String(data.message || '').trim().slice(0, 3000);

	if (!name || !/^[+\d][\d\s()\-]{5,}$/.test(phone)) {
		return json({ error: 'Укажите имя и корректный номер телефона.' }, 422);
	}
	if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
		return json({ error: 'Проверьте адрес электронной почты.' }, 422);
	}

	if (!env.RESEND_API_KEY || !env.MAIL_TO || !env.MAIL_FROM) {
		return json({ error: 'Отправка писем не настроена на сервере.' }, 500);
	}

	const ip = request.headers.get('CF-Connecting-IP') || '';
	const payload = {
		from: env.MAIL_FROM,
		to: env.MAIL_TO.split(',').map((s) => s.trim()).filter(Boolean),
		subject: `Сообщение с сайта eurofasad.com: ${name}`,
		text: `Имя: ${name}\nТелефон: ${phone}\nE-mail: ${email || '—'}\n\n${message || '(без сообщения)'}\n\nIP: ${ip}`,
		html:
			`<p><b>Имя:</b> ${esc(name)}</p><p><b>Телефон:</b> ${esc(phone)}</p>` +
			`<p><b>E-mail:</b> ${esc(email || '—')}</p>` +
			`<p>${esc(message || '(без сообщения)').replace(/\n/g, '<br>')}</p>` +
			`<p style="color:#888">IP: ${esc(ip)}</p>`,
	};
	if (email) payload.reply_to = email;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	});

	if (!res.ok) {
		console.error('Resend error', res.status, await res.text());
		return json({ error: 'Не удалось отправить сообщение. Позвоните нам по телефону.' }, 502);
	}
	return json({ ok: true });
}

export const onRequest = () => json({ error: 'Method not allowed' }, 405);
