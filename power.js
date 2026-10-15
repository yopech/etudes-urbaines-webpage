(() => {
  "use strict";
  const stage = document.querySelector("#neon-stage");
  const button = document.querySelector("#breaker");
  const caption = document.querySelector("#caption");
  const soundButton = document.querySelector("#sound");
  const status = document.querySelector("#status");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 2.4;
  let active = false,
    soundEnabled = true,
    version = 0;
  let context, master;
  let decodedIgnition;
  const ignitionData = fetch("assets/audio/power-on.mp3")
    .then((response) => {
      if (!response.ok) throw new Error("Audio unavailable");
      return response.arrayBuffer();
    })
    .catch(() => null);
  const sources = new Set();
  stage.style.setProperty("--ignition", `${duration}s`);
  function stopAudio() {
    if (!context) return;
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setValueAtTime(0, context.currentTime);
    for (const source of sources) {
      try {
        source.stop();
      } catch {}
    }
    sources.clear();
  }
  function connectSource(source, gain, filter) {
    source.connect(filter || gain);
    if (filter) filter.connect(gain);
    gain.connect(master);
    sources.add(source);
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      filter?.disconnect();
      sources.delete(source);
    };
  }
  function noise(time, length, volume, frequency) {
    const buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * length),
      context.sampleRate,
    );
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.2));
    const source = context.createBufferSource();
    source.buffer = buffer;
    const gain = context.createGain();
    gain.gain.value = volume;
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = frequency;
    filter.Q.value = 0.65;
    connectSource(source, gain, filter);
    source.start(time);
    source.stop(time + length);
  }
  function mechanicalClick(time) {
    noise(time, 0.045, 0.6, 1300);
    const source = context.createOscillator(),
      gain = context.createGain();
    source.type = "triangle";
    source.frequency.setValueAtTime(220, time);
    source.frequency.exponentialRampToValueAtTime(65, time + 0.035);
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.06);
    connectSource(source, gain);
    source.start(time);
    source.stop(time + 0.065);
  }
  function hum(time) {
    const source = context.createOscillator(),
      gain = context.createGain();
    source.type = "sine";
    source.frequency.value = 50;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.045, time + 0.6);
    connectSource(source, gain);
    source.start(time);
  }
  async function recordedIgnition(token) {
    try {
      const data = await ignitionData;
      if (!data) throw new Error("Audio unavailable");
      decodedIgnition ||= context.decodeAudioData(data.slice(0));
      const buffer = await decodedIgnition;
      if (token !== version || !active || !soundEnabled || document.hidden)
        return;
      const source = context.createBufferSource();
      source.buffer = buffer;
      const gain = context.createGain();
      const now = context.currentTime;
      const playbackLength = Math.min(2, buffer.duration);
      const fadeLength = Math.min(1.5, playbackLength);
      gain.gain.setValueAtTime(0.8, now);
      gain.gain.setValueAtTime(0.8, now + playbackLength - fadeLength);
      gain.gain.linearRampToValueAtTime(0, now + playbackLength);
      connectSource(source, gain);
      source.start(now);
      source.stop(now + playbackLength);
    } catch {
      if (token === version && active)
        document.querySelector("#notice").textContent =
          "Дополнительный звук не загрузился. Основной звук работает.";
    }
  }
  async function audio(on, ignition, token) {
    if (!soundEnabled || document.hidden) return;
    try {
      if (!context) {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        context = new Audio();
        master = context.createGain();
        master.gain.value = 0;
        master.connect(context.destination);
      }
      await context.resume();
      if (token !== version || !soundEnabled || document.hidden) return;
      const now = context.currentTime;
      master.gain.setValueAtTime(0.22, now);
      if (ignition) mechanicalClick(now);
      if (!on) return;
      if (ignition) void recordedIgnition(token);
      if (ignition && !reduced.matches) {
        // Match the four visible strikes: 5%, 35%, 57%, 65%.
        [0.05, 0.35, 0.57, 0.65].forEach((fraction, i) =>
          noise(
            now + duration * fraction,
            0.06 + i * 0.008,
            0.18,
            2200 + i * 330,
          ),
        );
      }
      hum(now + (ignition && !reduced.matches ? duration * 0.7 : 0));
    } catch {
      document.querySelector("#notice").textContent =
        "Браузер не разрешил звук. Вывеска работает без него.";
    }
  }
  function toggle(silent = false) {
    active = !active;
    const token = ++version;
    stopAudio();
    stage.style.setProperty("--hum-time", `${4.7 + Math.random() * 2.2}s`);
    stage.classList.toggle("is-active", active);
    document.body.classList.toggle("room-lit", active);
    document.body.classList.toggle("exhibition-open", active);
    document.querySelector("#exhibition").inert = !active;
    document
      .querySelector("#exhibition")
      .setAttribute("aria-hidden", String(!active));
    if (!active) globalThis.ExhibitionScroll.to(0, { immediate: true });
    window.dispatchEvent(
      new CustomEvent("exhibitionpower", { detail: { active } }),
    );
    button.setAttribute("aria-checked", String(active));
    caption.textContent = active ? "Погасить свет" : "Включить свет";
    status.textContent = active ? "Вывеска включена." : "Свет выключен.";
    if (!silent) void audio(active, true, token);
  }
  button.addEventListener("click", () => toggle());
  globalThis.ExhibitionPower = {
    openSilently() {
      if (!active) toggle(true);
    },
  };
  soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    const token = ++version;
    stopAudio();
    soundButton.setAttribute("aria-pressed", String(soundEnabled));
    soundButton.textContent = soundEnabled ? "Звук: вкл." : "Звук: выкл.";
    if (active && soundEnabled) void audio(true, false, token);
  });
  document.addEventListener("visibilitychange", () => {
    const token = ++version;
    document.body.classList.toggle("is-paused", document.hidden);
    stopAudio();
    if (document.hidden) context?.suspend().catch(() => {});
    else if (active && soundEnabled) void audio(true, false, token);
  });
  window.addEventListener("pagehide", () => {
    ++version;
    stopAudio();
    context?.suspend().catch(() => {});
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && active && soundEnabled)
      void audio(true, false, ++version);
  });
  reduced.addEventListener("change", () => {
    const token = ++version;
    stopAudio();
    if (active && soundEnabled) void audio(true, false, token);
  });
  const loading = setTimeout(() => {
    document.querySelector("#notice").textContent = "Загружаем выставку…";
  }, 1200);
  Promise.all(
    [...stage.querySelectorAll("img"), ...button.querySelectorAll("img")].map(
      (image) => image.decode(),
    ),
  )
    .then(() => {
      globalThis.ExhibitionPower.ready = true;
      clearTimeout(loading);
      document.querySelector("#notice").textContent = "";
      button.disabled = false;
      caption.textContent = "Включить свет";
      window.dispatchEvent(new Event("exhibitionready"));
    })
    .catch(() => {
      globalThis.ExhibitionPower.ready = true;
      clearTimeout(loading);
      caption.textContent = "Не удалось загрузить вывеску";
      document.querySelector("#notice").textContent =
        "Не удалось загрузить вход в выставку. Повторите попытку или откройте зал без анимации.";
      document.querySelector("#entry-recovery").hidden = false;
      window.dispatchEvent(new Event("exhibitionready"));
    });
  document
    .querySelector("#retry-entry")
    .addEventListener("click", () => location.reload());
  document.querySelector("#skip-entry").addEventListener("click", () => {
    button.disabled = false;
    globalThis.ExhibitionPower.openSilently();
    document.querySelector("#entry-recovery").hidden = true;
    document.querySelector("#notice").textContent = "";
    globalThis.ExhibitionScroll.to("#etude-1");
  });
})();
