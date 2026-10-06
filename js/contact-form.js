(function () {
	var form = document.getElementById('feedback-form');
	if (!form) return;
	var msg = form.querySelector('.feedback__msg');
	var btn = form.querySelector('button[type="submit"]');

	function show(text, ok) {
		msg.textContent = text;
		msg.className = 'feedback__msg ' + (ok ? 'feedback__msg--ok' : 'feedback__msg--err');
	}

	form.addEventListener('submit', function (e) {
		e.preventDefault();
		var f = form.elements;
		var data = {
			name: f.name.value.trim(),
			phone: f.phone.value.trim(),
			email: f.email.value.trim(),
			message: f.message.value.trim(),
			website: f.website.value
		};
		if (!data.name || !/^[+\d][\d\s()\-]{5,}$/.test(data.phone)) {
			show('Укажите имя и корректный номер телефона.', false);
			return;
		}
		if (data.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) {
			show('Проверьте адрес электронной почты.', false);
			return;
		}
		btn.disabled = true;
		show('Отправляем…', true);
		fetch(form.action, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(data)
		}).then(function (r) {
			return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, d: d }; });
		}).then(function (res) {
			if (res.ok) {
				form.reset();
				show('Спасибо! Ваше сообщение отправлено, мы свяжемся с вами.', true);
			} else {
				show(res.d.error || 'Не удалось отправить сообщение. Позвоните нам по телефону.', false);
			}
		}).catch(function () {
			show('Не удалось отправить сообщение. Проверьте соединение и попробуйте ещё раз.', false);
		}).then(function () {
			btn.disabled = false;
		});
	});
})();
