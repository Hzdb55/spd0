(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const el = {
    hud: $("hud"), speedValue: $("speedValue"), speedUnit: $("speedUnit"),
    speedArc: $("speedArc"), gearValue: $("gearValue"), rpmValue: $("rpmValue"),
    rpmBar: $("rpmBar"), fuelFill: $("fuelFill"), fuelValue: $("fuelValue"),
    healthValue: $("healthValue"), odoValue: $("odoValue"), engineStatus: $("engineStatus"),
    lockStatus: $("lockStatus"), lockText: $("lockText"), lightText: $("lightText"),
    vehicleState: $("vehicleState"), unitLabel: $("unitLabel"),
    seatbelt: $("seatbeltIndicator"), lock: $("lockIndicator"), light: $("lightIndicator"),
    left: $("leftIndicator"), right: $("rightIndicator"), health: $("healthIndicator")
  };

  const state = {
    speed: 0, speedMph: 0, rpm: 0, fuel: 100, health: 100, gear: "P", odo: 0,
    engine: false, headlights: false, leftIndicator: false, rightIndicator: false,
    seatbelt: false, locked: false, visible: true, unit: "MPH"
  };

  const clamp = (n, min, max) => Math.min(max, Math.max(min, Number(n) || 0));
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
  const bool = (v) => v === true || v === 1 || v === "1" || v === "true" || v === "on";
  function ratio(v) {
    let n = Number(v);
    if (!Number.isFinite(n)) return 0;
    if (n > 1) n /= 100;
    return clamp(n, 0, 1);
  }
  function normalizeGear(v) {
    if (v === undefined || v === null || v === "") return state.gear;
    const s = String(v).toUpperCase();
    if (s === "0") return "N";
    if (s === "-1" || s === "R") return "R";
    if (s === "P" || s === "N" || s === "R") return s;
    return s;
  }
  function updateSpeed(v, unit) {
    const n = Math.max(0, Number(v) || 0);
    const u = String(unit || "").toLowerCase();
    if (["mph"].includes(u)) state.speedMph = n;
    else if (["km/h", "kmh", "kph"].includes(u)) state.speedMph = n * 0.621371;
    else state.speedMph = n * 2.236936; // Default: FiveM telemetry is metres/second.
    state.speed = n;
  }
  function render() {
    const shownSpeed = state.unit === "KMH" ? state.speedMph / 0.621371 : state.speedMph;
    const maxSpeed = state.unit === "KMH" ? 320 : 200;
    const speed = clamp(shownSpeed, 0, maxSpeed);
    el.speedValue.textContent = String(Math.round(speed));
    el.speedUnit.textContent = state.unit;
    el.unitLabel.textContent = state.unit;
    const circumference = 362;
    el.speedArc.style.strokeDasharray = String(circumference);
    el.speedArc.style.strokeDashoffset = String(circumference * (1 - speed / maxSpeed));
    el.speedArc.style.stroke = speed > maxSpeed * .82 ? "#ffb547" : "#49b7ff";

    el.gearValue.textContent = state.gear;
    const rpm = clamp(state.rpm, 0, 1);
    el.rpmValue.textContent = (rpm * 8).toFixed(1);
    el.rpmBar.style.width = `${rpm * 100}%`;

    const fuel = clamp(state.fuel, 0, 100);
    el.fuelValue.textContent = String(Math.round(fuel));
    el.fuelFill.style.height = `${fuel}%`;
    el.fuelFill.style.background = fuel <= 15
      ? "linear-gradient(0deg,#ff485b,#ffb547)"
      : "linear-gradient(0deg,#49b7ff,#8df3b0)";

    const health = clamp(state.health, 0, 100);
    el.healthValue.textContent = `${Math.round(health)}%`;
    el.health.classList.toggle("active", health <= 35);
    el.health.style.color = health <= 35 ? "#ff6a74" : "";

    el.odoValue.textContent = Math.max(0, state.odo).toFixed(1);
    el.engineStatus.classList.toggle("active", state.engine);
    el.lockStatus.classList.toggle("active", state.locked);
    el.lockText.textContent = state.locked ? "LOCKED" : "UNLOCKED";
    el.lightText.textContent = state.headlights ? "ON" : "OFF";
    el.vehicleState.textContent = state.engine ? "ENGINE RUNNING" : "READY";

    el.seatbelt.classList.toggle("active", !state.seatbelt);
    el.seatbelt.title = state.seatbelt ? "Seatbelt fastened" : "Seatbelt warning";
    el.lock.classList.toggle("active", state.locked);
    el.light.classList.toggle("active", state.headlights);
    el.left.classList.toggle("active", state.leftIndicator);
    el.right.classList.toggle("active", state.rightIndicator);
    el.hud.classList.toggle("hidden", !state.visible);
  }
  function applyTelemetry(input) {
    if (!input || typeof input !== "object") return;
    let data = input.data && typeof input.data === "object" ? input.data : input;
    if (data.telemetry && typeof data.telemetry === "object") data = data.telemetry;

    if (has(data, "visible")) state.visible = data.visible !== false && data.visible !== 0;
    if (has(data, "speed")) updateSpeed(data.speed, data.speedUnit || data.speed_unit || data.unit);
    if (has(data, "speedMph")) state.speedMph = Math.max(0, Number(data.speedMph) || 0);
    if (has(data, "mph")) state.speedMph = Math.max(0, Number(data.mph) || 0);
    if (has(data, "unit") && ["mph", "kmh", "km/h", "kph"].includes(String(data.unit).toLowerCase())) {
      state.unit = String(data.unit).toLowerCase() === "mph" ? "MPH" : "KMH";
    }
    if (has(data, "rpm")) state.rpm = ratio(data.rpm);
    if (has(data, "fuel")) state.fuel = ratio(data.fuel) * 100;
    if (has(data, "health")) state.health = ratio(data.health) * 100;
    if (has(data, "vehicleHealth")) state.health = ratio(data.vehicleHealth) * 100;
    if (has(data, "gear")) state.gear = normalizeGear(data.gear);
    if (has(data, "odometer")) state.odo = Number(data.odometer) || 0;
    if (has(data, "odo")) state.odo = Number(data.odo) || 0;
    if (has(data, "engine")) state.engine = bool(data.engine);
    if (has(data, "headlights")) state.headlights = bool(data.headlights);
    if (has(data, "lights")) state.headlights = bool(data.lights);
    if (has(data, "leftIndicator")) state.leftIndicator = bool(data.leftIndicator);
    if (has(data, "left_indicator")) state.leftIndicator = bool(data.left_indicator);
    if (has(data, "rightIndicator")) state.rightIndicator = bool(data.rightIndicator);
    if (has(data, "right_indicator")) state.rightIndicator = bool(data.right_indicator);
    if (has(data, "seatbelt")) state.seatbelt = bool(data.seatbelt);
    if (has(data, "locked")) state.locked = bool(data.locked);
    if (has(data, "isLocked")) state.locked = bool(data.isLocked);
    render();
  }

  window.addEventListener("message", (event) => {
    let payload = event.data;
    if (typeof payload === "string") {
      try { payload = JSON.parse(payload); } catch (_) { return; }
    }
    if (!payload || typeof payload !== "object") return;
    const action = String(payload.action || payload.type || "").toLowerCase();
    if (["vehicle", "speedometer", "update", "telemetry", "vehicledata"].includes(action) ||
        ["speed", "rpm", "fuel", "health", "gear"].some(k => has(payload, k)) ||
        (payload.data && typeof payload.data === "object")) {
      applyTelemetry(payload);
    }
  });

  // Public API for an integration resource or browser-based testing.
  window.G80Speedometer = {
    update: applyTelemetry,
    setSpeed: (v, unit) => { updateSpeed(v, unit); render(); },
    setRPM: (v) => { state.rpm = ratio(v); render(); },
    setFuel: (v) => { state.fuel = ratio(v) * 100; render(); },
    setHealth: (v) => { state.health = ratio(v) * 100; render(); },
    setGear: (v) => { state.gear = normalizeGear(v); render(); },
    setEngine: (v) => { state.engine = bool(v); render(); },
    setLights: (v) => { state.headlights = bool(v); render(); },
    setLocked: (v) => { state.locked = bool(v); render(); },
    setIndicators: (left, right) => { state.leftIndicator = bool(left); state.rightIndicator = bool(right); render(); },
    setSeatbelt: (v) => { state.seatbelt = bool(v); render(); },
    setOdometer: (v) => { state.odo = Number(v) || 0; render(); },
    setUnit: (v) => { state.unit = String(v).toUpperCase() === "KMH" ? "KMH" : "MPH"; render(); },
    show: () => { state.visible = true; render(); },
    hide: () => { state.visible = false; render(); },
    getState: () => ({ ...state })
  };

  // Browser preview only: open index.html?demo=1 to preview the design.
  if (new URLSearchParams(location.search).has("demo")) {
    let t = 0;
    setInterval(() => {
      t += .035;
      applyTelemetry({
        action: "vehicle",
        data: {
          speed: Math.max(0, 15 + 12 * Math.sin(t)),
          speedUnit: "mph",
          rpm: .35 + .28 * (Math.sin(t * 1.7) + 1) / 2,
          fuel: 72, health: 94, gear: Math.floor(15 + 12 * Math.sin(t)) > 20 ? 4 : 3,
          engine: true, headlights: true, leftIndicator: Math.sin(t * 2) > .85,
          rightIndicator: Math.sin(t * 2) < -.85, seatbelt: true, locked: false, odometer: 12452.7
        }
      });
    }, 100);
  }
  render();
})();