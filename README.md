# G80-Inspired Speedometer HUD

Speedometer HUD transparan untuk browser/NUI, terinspirasi dari dashboard sport BMW G80 tetapi memakai layout dan grafis orisinal. Dibuat sebagai paket HTML/CSS/JS mandiri.

## Isi file
- `index.html` — struktur HUD.
- `style.css` — desain, warna, layout responsif.
- `app.js` — telemetry listener, indikator, dan API publik.

## Preview di browser
Buka `index.html?demo=1` untuk demo lokal. Demo ini hanya simulasi tampilan, bukan data dari FiveM.

## Format telemetry yang didukung
HUD mendengarkan `window.postMessage` dengan objek JSON. Contoh payload yang didukung oleh sisi tampilan:

```js
window.postMessage({
  action: "vehicle",
  data: {
    speed: 12.5,          // default dianggap meter/detik
    speedUnit: "m/s",     // opsional: "m/s", "mph", "km/h"
    rpm: 0.65,            // rasio 0-1, atau 65 untuk 65%
    fuel: 75,             // 0-100 atau rasio 0-1
    health: 92,            // 0-100 atau rasio 0-1
    gear: 3,
    engine: true,
    headlights: true,
    locked: false,
    leftIndicator: false,
    rightIndicator: true,
    seatbelt: true,
    odometer: 1234.5,
    visible: true
  }
}, "*");
```

**Penting:** format di atas adalah format yang diterima oleh `app.js`, bukan jaminan bahwa JG Garage/JGVRP mengirim data dengan format ini. HUD HTML eksternal tidak dapat membaca data kendaraan GTA/FiveM dengan sendirinya. Integrasi FiveM/JG Garage perlu mengirim telemetry ke halaman ini melalui bridge/event yang memang didukung resource/server Anda.

## API publik
Jika integrasi Anda dapat menjalankan JavaScript di halaman HUD, fungsi tersedia pada `window.G80Speedometer`:
- `update(data)`
- `setSpeed(value, unit?)`
- `setRPM(value)`
- `setFuel(value)`
- `setHealth(value)`
- `setGear(value)`
- `setEngine(value)`
- `setLights(value)`
- `setLocked(value)`
- `setIndicators(left, right)`
- `setSeatbelt(value)`
- `setOdometer(value)`
- `setUnit("MPH" | "KMH")`
- `show()` / `hide()`

## Catatan nilai
- Kecepatan default dianggap meter/detik lalu dikonversi ke MPH. Untuk sumber km/h, sertakan `speedUnit: "km/h"`.
- RPM diterima sebagai rasio 0–1 (atau angka 0–100 yang dianggap persen).
- Fuel dan health diterima sebagai 0–100 atau rasio 0–1.
- `seatbelt: true` berarti sabuk terpasang; peringatan menyala jika `false`.
- `locked: true` berarti kendaraan terkunci.
- `leftIndicator` dan `rightIndicator` masing-masing mengaktifkan indikator sein.
