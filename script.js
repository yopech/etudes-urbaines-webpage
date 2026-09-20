'use strict';

(() => {
  const { works, sizes, dimensions, formatNumber, formatDimensions, formatPrice, orderText } = PrintCatalog;
  const $ = (selector) => document.querySelector(selector);
  const state = { work: null, size: 'small', preview: 'print' };
  const homeTitle = document.title;
  const homeDescription = $('meta[name="description"]').content;
  let previousHash = '';
  let copyVersion = 0;

  function card(work, index) {
    const link = document.createElement('a');
    link.className = 'art-card';
    link.href = `#work/${work.id}`;
    link.innerHTML = `<div class="art-image-wrap ${work.height > work.width ? 'portrait' : ''}"><span class="art-card-number" aria-hidden="true">0${index + 1}</span><img src="assets/web/${work.id}-800.jpg" srcset="assets/web/${work.id}-800.jpg 800w, assets/web/${work.id}-1280.jpg 1280w" sizes="(max-width: 420px) 90vw, 44vw" width="${work.width}" height="${work.height}" alt="${work.alt}" loading="lazy" decoding="async"><span class="image-error" hidden>Фотография не загрузилась. Откройте карточку работы.</span></div><div class="art-card-meta"><div><h2 class="art-card-title">${work.title}</h2><p class="art-card-location">${work.location}</p></div><p class="art-card-price">от ≈ ${formatPrice(sizes.small.price)}<span>без рамы</span></p></div>`;
    const img = link.querySelector('img');
    img.addEventListener('error', () => { img.hidden = true; link.querySelector('.image-error').hidden = false; });
    return link;
  }
  works.forEach((work, index) => $('#catalog-grid').append(card(work, index)));
  $('#catalog-grid img').loading = 'eager';
  $('#catalog-grid img').fetchPriority = 'high';

  function updatePreview() {
    $('#preview-stage').dataset.finish = state.preview;
    document.querySelectorAll('[data-preview]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.preview === state.preview)));
    const hasMargins = dimensions(state.work, state.size).margin > 0.1;
    $('#preview-caption').textContent = state.preview === 'print'
      ? `Визуализация отпечатка на листе. ${hasMargins ? 'Белые поля — часть бумаги. ' : ''}Рама не входит в заказ.`
      : 'Визуализация. Пример оформления. Рама и паспарту не входят в заказ.';
  }
  function updateSize() {
    const work = state.work;
    const layout = dimensions(work, state.size);
    document.querySelectorAll('[data-size]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.size === state.size)));
    $('#image-dimensions').textContent = `Изображение ≈ ${formatDimensions(layout.imageWidth, layout.imageHeight)} см. Лист ${formatDimensions(layout.sheetWidth, layout.sheetHeight)} см.`;
    $('#margin-note').textContent = layout.margin > 0.1 ? `Белые поля ${layout.marginAxis}, примерно по ${formatNumber(layout.margin)} см. Это часть листа, не паспарту.` : 'Кадр практически совпадает с пропорциями листа. Макет согласуем перед печатью.';
    $('#sheet-caption').textContent = `Лист ${formatDimensions(layout.sheetWidth, layout.sheetHeight)} см`;
    $('#work-price').textContent = `≈ ${formatPrice(sizes[state.size].price)}`;
    $('#order-message').value = orderText(work, state.size, `${location.href.split('#')[0]}#work/${work.id}`);
    $('#copy-status').textContent = '';
    $('#copy-order').textContent = 'Скопировать текст';
    copyVersion += 1;
  }
  function showWork(work) {
    const changed = state.work?.id !== work.id;
    state.work = work;
    if (changed) { state.size = 'small'; state.preview = 'print'; }
    $('#works').hidden = true;
    $('#work-page').hidden = false;
    $('#work-number').textContent = `0${works.indexOf(work) + 1} / 04`;
    $('#work-title').textContent = work.title;
    $('#work-location').textContent = work.location;
    $('#work-description').textContent = work.description;
    document.title = `${work.title} — авторский отпечаток | Études urbaines`;
    $('meta[name="description"]').content = `${work.title}. ${work.description} Фотопечать на Silk, без рамы, два размера.`;
    const img = $('#work-image');
    img.hidden = false;
    $('#preview-stage .image-error').hidden = true;
    img.alt = work.alt; img.width = work.width; img.height = work.height;
    img.srcset = `assets/web/${work.id}-800.jpg 800w, assets/web/${work.id}-1280.jpg 1280w, assets/web/${work.id}-2000.jpg 2000w`;
    img.sizes = '(max-width: 760px) 85vw, 49vw';
    img.src = `assets/web/${work.id}-1280.jpg`;
    const portrait = work.height > work.width;
    $('#print-sheet').classList.toggle('portrait', portrait);
    $('#preview-frame').classList.toggle('portrait', portrait);
    $('#size-options').replaceChildren();
    Object.keys(sizes).forEach((key) => {
      const layout = dimensions(work, key);
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'size-button'; button.dataset.size = key;
      button.innerHTML = `${formatDimensions(layout.sheetWidth, layout.sheetHeight)}<span>≈ ${formatPrice(sizes[key].price)}</span>`;
      button.addEventListener('click', () => { state.size = key; updateSize(); });
      $('#size-options').append(button);
    });
    $('#related-grid').replaceChildren(...works.filter((item) => item.id !== work.id).map((item) => card(item, works.indexOf(item))));
    updateSize(); updatePreview();
  }
  function route() {
    const hash = location.hash || '#works';
    const match = /^#work\/([a-z0-9-]+)$/.exec(hash);
    const work = match && works.find((item) => item.id === match[1]);
    if ($('#image-dialog').open) $('#image-dialog').close();
    if (work) {
      showWork(work); window.scrollTo({ top: 0, behavior: 'instant' }); $('#work-title').focus({ preventScroll: true });
    } else {
      $('#works').hidden = false; $('#work-page').hidden = true;
      document.title = homeTitle; $('meta[name="description"]').content = homeDescription;
      const destinations = { '#works': 'works', '#print': 'print', '#author': 'author', '#designers': 'designers', '#main': 'main' };
      const target = destinations[hash];
      if (!target) history.replaceState(null, '', '#works');
      requestAnimationFrame(() => {
        if (target === 'works' || !target) window.scrollTo({ top: 0, behavior: 'instant' });
        else document.getElementById(target).scrollIntoView({ behavior: 'instant' });
        if (previousHash.startsWith('#work/') && (!target || target === 'works')) {
          const returnLink = document.querySelector(`#catalog-grid a[href="${previousHash}"]`);
          if (returnLink) returnLink.focus({ preventScroll: true });
        }
        previousHash = location.hash || '#works';
      });
    }
    document.querySelectorAll('nav a').forEach((link) => {
      const selected = link.hash === hash || (work && link.hash === '#works');
      if (selected) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    if (work) previousHash = hash;
  }
  document.querySelectorAll('[data-preview]').forEach((button) => button.addEventListener('click', () => { state.preview = button.dataset.preview; updatePreview(); }));
  $('#work-image').addEventListener('error', () => { $('#work-image').hidden = true; $('#preview-stage .image-error').hidden = false; });
  $('#work-image').addEventListener('load', () => { $('#work-image').hidden = false; $('#preview-stage .image-error').hidden = true; });
  $('#copy-order').addEventListener('click', async () => {
    const version = copyVersion;
    try {
      await navigator.clipboard.writeText($('#order-message').value);
      if (version === copyVersion) $('#copy-status').textContent = 'Текст скопирован. Вставьте его в чат с Игорем и отправьте.';
    } catch {
      if (version !== copyVersion) return;
      $('#order-message').focus(); $('#order-message').select();
      $('#copy-status').textContent = 'Автоматическое копирование недоступно. Текст выделен — скопируйте его вручную.';
    }
  });
  const dialog = $('#image-dialog');
  $('#preview-stage').addEventListener('click', () => {
    $('#zoom-title').textContent = `${state.work.title} / ${state.work.location}`;
    $('#zoom-error').hidden = true; $('#zoom-image').hidden = false;
    $('#zoom-image').alt = state.work.alt;
    $('#zoom-image').src = `assets/web/${state.work.id}-2000.jpg`;
    dialog.showModal(); document.body.classList.add('modal-open'); $('#close-zoom').focus();
  });
  $('#zoom-image').addEventListener('error', () => { $('#zoom-image').hidden = true; $('#zoom-error').hidden = false; });
  $('#close-zoom').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); if (!$('#work-page').hidden) $('#preview-stage').focus({ preventScroll: true }); });
  $('.author-portrait img').addEventListener('error', (event) => { event.target.hidden = true; });
  $('#current-year').textContent = new Date().getFullYear();
  window.addEventListener('hashchange', route);
  route();
})();
