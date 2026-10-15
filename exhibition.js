(() => {
  "use strict";
  const body = document.body;
  const sections = [...document.querySelectorAll(".exhibit-section")];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const works = sections.map((section) => ({
    id: Number(section.dataset.work),
    title: section.querySelector("h2").textContent,
    place: section.querySelector(".catalog-number span").textContent,
    section,
    artwork: section.querySelector(".framed-artwork"),
    placard: section.querySelector(".museum-placard"),
  }));
  const wall = document.querySelector(".concrete-wall");
  const hero = document.querySelector(".hero");
  const navigation = [...document.querySelectorAll(".hall-navigation a")];
  const cue = document.querySelector(".scroll-cue");
  let open = false,
    dirty = true,
    pointer = null,
    pointerUntil = 0,
    frameId = 0;
  let geometry = [];
  function measure() {
    const scroll = window.scrollY;
    geometry = works.map((work) => {
      const section = work.section.getBoundingClientRect();
      const art = work.artwork.getBoundingClientRect();
      const currentShift =
        parseFloat(work.section.style.getPropertyValue("--frame-y")) || 0;
      const placard = work.placard.getBoundingClientRect();
      const lamp = work.section
        .querySelector(".spotlight")
        .getBoundingClientRect();
      return {
        top: section.top + scroll,
        height: section.height,
        x: art.left + art.width / 2,
        artTop: art.top + scroll - currentShift,
        artWidth: art.width,
        artHeight: art.height,
        labelX: placard.left + placard.width / 2,
        labelTop: placard.top + scroll,
        labelHeight: placard.height,
        lampWidth: lamp.width,
        right: work.section.classList.contains("light-right"),
      };
    });
    dirty = true;
    schedule();
  }
  function schedule() {
    if (!frameId) frameId = requestAnimationFrame(render);
  }
  function render(now) {
    frameId = 0;
    if (!open || document.hidden) return;
    if (!dirty && (!pointer || now > pointerUntil)) return;
    dirty = false;
    const scroll = window.scrollY,
      height = innerHeight,
      width = innerWidth;
    const masks = [];
    const heroRect = hero.getBoundingClientRect();
    if (heroRect.bottom > -height * 0.5) {
      const y = heroRect.top + heroRect.height * 0.44;
      masks.push(
        `radial-gradient(ellipse ${width * 0.52}px ${height * 0.7}px at ${width * 0.5}px ${y}px,#000b 0%,#0004 40%,transparent 90%)`,
      );
    }
    let closest = -1,
      distance = Infinity;
    geometry.forEach((g, i) => {
      const offset = g.top - scroll + g.height / 2 - height / 2;
      const proximity = Math.max(0, 1 - Math.abs(offset) / (height * 0.95));
      const light = 0.25 + 0.8 * proximity;
      const lampY = reduced.matches
        ? 0
        : Math.max(-16, Math.min(35, -offset * 0.28));
      const artY = reduced.matches ? 0 : offset * 0.05;
      const section = works[i].section;
      section.style.setProperty("--light", light.toFixed(3));
      section.style.setProperty("--lamp-y", `${lampY.toFixed(1)}px`);
      section.style.setProperty("--frame-y", `${artY.toFixed(1)}px`);
      section.style.setProperty("--shine", `${30 + (offset / height) * 70}%`);
      const artCenterY = g.artTop - g.top + g.artHeight * 0.52 + artY;
      section.style.setProperty("--pool-x", `${g.x}px`);
      section.style.setProperty("--pool-y", `${artCenterY}px`);
      section.style.setProperty(
        "--pool-rx",
        `${Math.max(260, g.artWidth * 0.9)}px`,
      );
      section.style.setProperty(
        "--pool-ry",
        `${Math.max(300, g.artHeight * 0.9)}px`,
      );
      const mouthX = g.right ? width - g.lampWidth * 0.27 : g.lampWidth * 0.27;
      const mouthY =
        g.height * 0.02 + g.lampWidth * (1024 / 1536) * 0.36 + lampY;
      const dx = g.x - mouthX,
        dy = artCenterY - mouthY;
      section.style.setProperty("--beam-x", `${mouthX}px`);
      section.style.setProperty("--beam-y", `${mouthY}px`);
      section.style.setProperty(
        "--beam-length",
        `${Math.hypot(dx, dy) * 1.3}px`,
      );
      section.style.setProperty(
        "--beam-width",
        `${Math.max(150, g.artWidth * 0.55)}px`,
      );
      section.style.setProperty(
        "--beam-angle",
        `${(Math.atan2(dy, dx) * 180) / Math.PI}deg`,
      );
      if (
        g.top - scroll < height * 1.5 &&
        g.top + g.height - scroll > -height * 0.5
      ) {
        const x = g.x,
          y = g.artTop - scroll + g.artHeight * 0.52;
        const rx = Math.max(260, g.artWidth * 0.9),
          ry = Math.max(300, g.artHeight * 0.75 + g.labelHeight * 0.2);
        masks.push(
          `radial-gradient(ellipse ${rx}px ${ry}px at ${x}px ${y}px,rgba(0,0,0,${(0.73 * light).toFixed(2)}) 0%,#0005 30%,transparent 90%)`,
        );
        masks.push(
          `radial-gradient(ellipse ${width < 701 ? 200 : 280}px 280px at ${g.labelX}px ${g.labelTop - scroll + g.labelHeight * 0.5}px,#0007,transparent 90%)`,
        );
      }
      if (Math.abs(offset) < distance) {
        distance = Math.abs(offset);
        closest = i;
      }
    });
    if (pointer) {
      const strength = Math.max(0, Math.min(1, (pointerUntil - now) / 650));
      if (strength)
        masks.push(
          `radial-gradient(circle 280px at ${pointer.x}px ${pointer.y}px,rgba(0,0,0,${(0.46 * strength).toFixed(2)}),transparent 100%)`,
        );
      if (now < pointerUntil) schedule();
      else pointer = null;
    }
    wall.style.setProperty(
      "--wall-mask",
      masks.join(",") || "linear-gradient(transparent,transparent)",
    );
    body.classList.toggle("in-hall", scroll > hero.offsetHeight * 0.72);
    navigation.forEach((link, i) =>
      link.setAttribute("aria-current", String(i === closest)),
    );
  }
  window.addEventListener("exhibitionpower", (event) => {
    open = event.detail.active;
    cue.tabIndex = open ? 0 : -1;
    if (!open) body.classList.remove("in-hall");
    measure();
  });
  window.addEventListener(
    "scroll",
    () => {
      dirty = true;
      schedule();
    },
    { passive: true },
  );
  window.addEventListener("resize", measure, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      if (!open) return;
      pointer = { x: event.clientX, y: event.clientY };
      pointerUntil =
        performance.now() + (event.pointerType === "touch" ? 900 : 1800);
      dirty = true;
      schedule();
    },
    { passive: true },
  );
  window.addEventListener(
    "pointerdown",
    (event) => {
      if (!open) return;
      pointer = { x: event.clientX, y: event.clientY };
      pointerUntil = performance.now() + 1200;
      dirty = true;
      schedule();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      dirty = true;
      schedule();
    }
  });
  reduced.addEventListener("change", measure);
  new ResizeObserver(measure).observe(document.querySelector("#exhibition"));
  document.fonts.ready.then(measure);
  measure();
  document.querySelector("#exit-exhibition").addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reduced.matches ? "instant" : "smooth",
    });
    document.querySelector("#breaker").focus({ preventScroll: true });
  });

  const inspection = document.querySelector("#inspection");
  const order = document.querySelector("#order");
  const image = document.querySelector("#inspection-photo");
  const paper = document.querySelector(".inspection-paper");
  const zoom = document.querySelector("#zoom-toggle");
  const size = document.querySelector("#order-size");
  const catalog = globalThis.PrintCatalog;
  const drafts = new Map();
  const focusOrigins = new WeakMap();
  const inspectionStatus = document.querySelector("#inspection-status");
  const retryPhoto = document.querySelector("#retry-photo");
  let modalHistory = false,
    restoringHistory = false;
  let currentWork = works[0],
    returnFocus = null,
    orderMessage = "";
  function show(dialog, trigger) {
    returnFocus = trigger;
    focusOrigins.set(dialog, trigger);
    const route = `${dialog === inspection ? "view" : "order"}/${currentWork.id}`;
    if (restoringHistory) {
      /* Existing browser history entry owns this route. */
    } else if (modalHistory)
      history.replaceState({ exhibitionDialog: route }, "", `#${route}`);
    else {
      history.pushState({ exhibitionDialog: route }, "", `#${route}`);
      modalHistory = true;
    }
    dialog.showModal();
    body.classList.add("dialog-open");
  }
  function close(dialog) {
    if (modalHistory) history.back();
    else dialog.close();
  }
  for (const dialog of [inspection, order]) {
    dialog
      .querySelector("[data-close]")
      .addEventListener("click", () => close(dialog));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        const rect = dialog.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX > rect.right ||
          event.clientY < rect.top ||
          event.clientY > rect.bottom
        )
          close(dialog);
      }
    });
    dialog.addEventListener("close", () => {
      if (inspection.open || order.open) return;
      body.classList.remove("dialog-open");
      focusOrigins.get(dialog)?.focus({ preventScroll: true });
    });
    dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      close(dialog);
    });
  }
  window.addEventListener("popstate", () => {
    const route = location.hash.match(/^#(view|order)\/([1-4])$/);
    if (route) {
      modalHistory = true;
      restoringHistory = true;
      const work = works[Number(route[2]) - 1];
      if (route[1] === "view") {
        order.close();
        if (!inspection.open) inspect(work, work.artwork);
      } else {
        inspection.close();
        if (!order.open)
          requestOrder(work, work.section.querySelector("[data-order]"));
      }
      restoringHistory = false;
      return;
    }
    modalHistory = false;
    inspection.close();
    order.close();
  });
  function loadInspectionPhoto() {
    image.hidden = true;
    inspectionStatus.hidden = false;
    inspectionStatus.textContent = "Загрузка фотографии…";
    retryPhoto.hidden = true;
    zoom.disabled = true;
    image.src = `photo-${currentWork.id}.jpg`;
  }
  image.addEventListener("load", () => {
    image.hidden = false;
    inspectionStatus.hidden = true;
    zoom.disabled = false;
  });
  image.addEventListener("error", () => {
    image.hidden = true;
    inspectionStatus.hidden = false;
    inspectionStatus.textContent =
      "Фотография не загрузилась. Проверьте соединение и повторите попытку.";
    retryPhoto.hidden = false;
    zoom.disabled = true;
  });
  retryPhoto.addEventListener("click", loadInspectionPhoto);
  function inspect(work, trigger) {
    currentWork = work;
    document.querySelector("#inspection-title").textContent =
      `ÉTUDE 0${work.id} / ${work.title} · ${work.place}`;
    loadInspectionPhoto();
    image.alt = work.artwork.querySelector(".photo-window img").alt;
    paper.classList.remove("is-zoomed");
    zoom.setAttribute("aria-pressed", "false");
    zoom.textContent = "Увеличить +";
    show(inspection, trigger);
    document.querySelector(".inspection-viewport").scrollTo(0, 0);
  }
  zoom.addEventListener("click", () => {
    const zoomed = paper.classList.toggle("is-zoomed");
    zoom.setAttribute("aria-pressed", String(zoomed));
    zoom.textContent = zoomed ? "Уменьшить −" : "Увеличить +";
  });
  function updateOrder() {
    const framed =
      order.querySelector('input[name="order-edition"]:checked').value ===
      "frame";
    const item = catalog.works[currentWork.id - 1];
    const geometry = catalog.dimensions(item, size.value);
    const dimensions = catalog.formatDimensions(
      geometry.sheetWidth,
      geometry.sheetHeight,
    );
    const price = catalog.formatNumber(catalog.sizes[size.value].price);
    drafts.set(currentWork.id, {
      size: size.value,
      edition: framed ? "frame" : "print",
    });
    currentWork.section.querySelector(
      `.edition-choice input[value="${framed ? "frame" : "print"}"]`,
    ).checked = true;
    syncEdition(currentWork);
    const imageDimensions = catalog.formatDimensions(
      geometry.imageWidth,
      geometry.imageHeight,
    );
    document.querySelector("#order-summary").textContent =
      `Лист ${dimensions} см · изображение ≈ ${imageDimensions} см, без обрезки. Отпечаток ≈ ${price} ₽. ${framed ? "Рама и сборка рассчитываются отдельно." : "Защитная упаковка и тубус включены."} Доставка отдельно. Срок подтвердит автор.`;
    orderMessage = `Здравствуйте, Игорь! Хочу заказать «${currentWork.title}» (${currentWork.place}).\nЛист: ${dimensions} см, с сохранением пропорций оригинала.\nFujicolor Crystal Archive DPII Silk.\nКомплектация: ${framed ? "в кастомной раме, прошу рассчитать оформление и сборку" : "только отпечаток, без рамы и паспарту, доставка в тубусе"}.\nПредварительная цена отпечатка: ≈ ${price} ₽.\nПодскажите итоговую стоимость, срок и доставку.`;
    document.querySelector("#telegram-order").href =
      `https://t.me/yopech?text=${encodeURIComponent(orderMessage)}`;
  }
  function requestOrder(work, trigger) {
    currentWork = work;
    document.querySelector("#order-work").textContent =
      `«${work.title}» · ${work.place}`;
    const edition = work.section.querySelector(
      'input[type="radio"]:checked',
    ).value;
    size.value = drafts.get(work.id)?.size || "small";
    for (const option of size.options) {
      const d = catalog.dimensions(catalog.works[work.id - 1], option.value);
      option.textContent = `${catalog.formatDimensions(d.sheetWidth, d.sheetHeight)} см — ≈ ${catalog.formatPrice(catalog.sizes[option.value].price)}`;
    }
    order.querySelector(`input[value="${edition}"]`).checked = true;
    document.querySelector("#copy-status").textContent = "";
    updateOrder();
    show(order, trigger);
  }
  document
    .querySelectorAll("[data-inspect]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        inspect(works[Number(button.dataset.inspect) - 1], button),
      ),
    );
  document
    .querySelectorAll("[data-order]")
    .forEach((button) =>
      button.addEventListener("click", () =>
        requestOrder(works[Number(button.dataset.order) - 1], button),
      ),
    );
  document.querySelector("#inspect-order").addEventListener("click", () => {
    const trigger = returnFocus;
    inspection.close();
    requestOrder(currentWork, trigger);
  });
  document.querySelector("#order-form").addEventListener("change", updateOrder);
  document
    .querySelector("#order-form")
    .addEventListener("submit", (event) => event.preventDefault());
  document.querySelector("#copy-order").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(orderMessage);
      document.querySelector("#copy-status").textContent = "Запрос скопирован.";
    } catch {
      document.querySelector("#copy-status").textContent =
        "Не удалось скопировать. Откройте запрос в Telegram.";
    }
  });
  function syncEdition(work) {
    const framed =
      work.section.querySelector("input:checked").value === "frame";
    work.section.querySelector("[data-price]").textContent = framed
      ? "Оформление по запросу"
      : `от ≈ ${catalog.formatPrice(catalog.sizes.small.price)}`;
    work.section.querySelector("[data-order]").firstChild.textContent = framed
      ? "Обсудить оформление "
      : "Запросить отпечаток ";
  }
  works.forEach((work) =>
    work.section
      .querySelector(".edition-choice")
      .addEventListener("change", () => {
        syncEdition(work);
      }),
  );
  const directRoute = location.hash.match(
    /^#(?:etude-([1-4])|(view|order)\/([1-4]))$/,
  );
  if (directRoute) {
    const openRoute = () => {
      globalThis.ExhibitionPower.openSilently();
      const work = works[Number(directRoute[1] || directRoute[3]) - 1];
      requestAnimationFrame(() => {
        work.section.scrollIntoView({ behavior: "instant", block: "center" });
        if (directRoute[2]) {
          history.replaceState(null, "", `#etude-${work.id}`);
          if (directRoute[2] === "view") inspect(work, work.artwork);
          else requestOrder(work, work.section.querySelector("[data-order]"));
        }
      });
    };
    if (globalThis.ExhibitionPower.ready) openRoute();
    else window.addEventListener("exhibitionready", openRoute, { once: true });
  }
})();
