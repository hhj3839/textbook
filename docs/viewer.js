(() => {
  const viewer = document.createElement('dialog');
  viewer.className = 'art-viewer';
  viewer.setAttribute('aria-label', '그림 크게 보기');
  viewer.innerHTML = '<div class="viewer-bar"><strong aria-live="polite"></strong><button type="button" autofocus>닫기</button></div><div class="viewer-stage"><img alt=""></div><div class="viewer-controls"><button type="button" aria-label="이전 그림">← 이전</button><output></output><button type="button" aria-label="다음 그림">다음 →</button></div>';
  document.body.append(viewer);
  const photo = viewer.querySelector('img');
  const [close, prev, next] = viewer.querySelectorAll('button');
  let items = [], index = 0, start = null;
  const frontOnly = document.querySelector('#front-only');
  function updateCoverSources() {
    for (const link of document.querySelectorAll('a[data-front]')) {
      const img = link.querySelector('img');
      img.dataset.spreadSources ||= img.srcset;
      img.srcset = frontOnly.checked ? link.dataset.front : img.dataset.spreadSources;
      img.classList.toggle('front-page', frontOnly.checked);
    }
  }
  if (frontOnly) {
    frontOnly.closest('fieldset').addEventListener('change', updateCoverSources);
    window.addEventListener('pageshow', updateCoverSources);
    updateCoverSources();
  }
  function show() {
    const link = items[index];
    const name = link.querySelector('img').alt;
    photo.alt = name;
    const front = frontOnly?.checked && link.dataset.front;
    photo.classList.toggle('front-page', Boolean(front));
    photo.src = front || link.href;
    viewer.querySelector('strong').textContent = name;
    viewer.querySelector('output').textContent = (index + 1) + ' / ' + items.length;
    prev.disabled = next.disabled = items.length < 2;
  }
  function move(step) {
    index = (index + step + items.length) % items.length;
    show();
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('.grid a');
    if (!link || !link.querySelector('img') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const scope = link.closest('dialog') || document.querySelector('main');
    items = [...scope.querySelectorAll('.grid a')].filter(a => !a.closest('[hidden]'));
    index = items.indexOf(link);
    show();
    viewer.showModal();
  });
  prev.onclick = () => move(-1);
  next.onclick = () => move(1);
  close.onclick = () => viewer.close();
  viewer.onkeydown = event => {
    if (['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  };
  photo.ontouchstart = event => { start = event.touches.length === 1 ? event.touches[0] : null; };
  photo.ontouchcancel = () => { start = null; };
  photo.ontouchend = event => {
    if (!start) return;
    const dx = event.changedTouches[0].clientX - start.clientX;
    const dy = event.changedTouches[0].clientY - start.clientY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1);
    start = null;
  };
})();
