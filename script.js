(function () {
  // Nomor WhatsApp praktik (format internasional tanpa + / 0 di depan).
  var WA = "6281222906901";
  // Jam praktik: daftar [mulai, selesai] dalam menit sejak 00.00
  var SESI = [[5 * 60, 7 * 60], [15 * 60, 22 * 60]]; // Senin-Jumat
  var AKHIR_PEKAN = [[7 * 60, 22 * 60]]; // Sabtu & Minggu
  var SCHEDULE = { 0: AKHIR_PEKAN, 1: SESI, 2: SESI, 3: SESI, 4: SESI, 5: SESI, 6: AKHIR_PEKAN };
  var DAYS = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];

  function nowJakarta() {
    var p = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var m = {}; p.forEach(function (x) { m[x.type] = x.value; });
    var idx = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].indexOf(m.weekday);
    return { day: idx, min: (parseInt(m.hour, 10) % 24) * 60 + parseInt(m.minute, 10) };
  }
  function fmt(min) { var h = Math.floor(min / 60) % 24, mm = min % 60; return (h < 10 ? "0" : "") + h + "." + (mm < 10 ? "0" : "") + mm; }

  function renderStatus() {
    var n = nowJakarta(), slots = SCHEDULE[n.day] || [], open = null, next = null, i;
    for (i = 0; i < slots.length; i++) {
      if (n.min >= slots[i][0] && n.min < slots[i][1]) { open = slots[i]; break; }
      if (n.min < slots[i][0] && !next) next = slots[i];
    }
    var dot = document.getElementById("yayat_dot"), t = document.getElementById("yayat_statusText"), s = document.getElementById("yayat_statusSub");
    if (open) {
      dot.className = "yayat_dot yayat_on"; t.textContent = "Praktik buka sekarang";
      s.textContent = "Tutup pukul " + fmt(open[1]) + " WIB";
    } else {
      dot.className = "yayat_dot"; t.textContent = "Praktik sedang tutup";
      if (next) { s.textContent = "Buka lagi hari ini pukul " + fmt(next[0]) + " WIB"; }
      else {
        var d = (n.day + 1) % 7, k = 0;
        while ((SCHEDULE[d] || []).length === 0 && k < 7) { d = (d + 1) % 7; k++; }
        s.textContent = "Buka lagi " + DAYS[d] + " pukul " + fmt(SCHEDULE[d][0][0]) + " WIB";
      }
    }
    var items = document.querySelectorAll("#yayat_hours li");
    for (i = 0; i < items.length; i++) items[i].classList.toggle("yayat_today", items[i].getAttribute("data-days").split(",").indexOf(String(n.day)) >= 0);
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  var form = document.getElementById("yayat_bookForm"), msg = "";
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nameEl = document.getElementById("yayat_nama");
    var nama = nameEl.value.trim();
    if (!nama) { nameEl.focus(); nameEl.style.borderColor = "var(--closed)"; return; }
    nameEl.style.borderColor = "";
    var lay = document.getElementById("yayat_layanan_pilih").value;
    var waktu = document.getElementById("yayat_waktu").value.trim();
    var kel = document.getElementById("yayat_keluhan").value.trim();
    msg = "Halo Mantri, saya " + nama + ". Saya ingin membuat janji: " + lay + "." +
      (waktu ? " Waktu yang saya inginkan: " + waktu + "." : "") +
      (kel ? " Keluhan: " + kel + "." : "") + " Terima kasih.";
    document.getElementById("yayat_previewText").textContent = msg;
    document.getElementById("yayat_waLink").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    document.getElementById("yayat_preview").classList.add("yayat_show");
    document.getElementById("yayat_copied").hidden = true;
  });
  document.getElementById("yayat_copyBtn").addEventListener("click", function () {
    var ok = document.getElementById("yayat_copied");
    function done() { ok.hidden = false; ok.textContent = "Tersalin"; }
    function fail() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById("yayat_previewText"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      ok.hidden = false; ok.textContent = "Teks terpilih, tekan salin";
    }
    try { navigator.clipboard.writeText(msg).then(done, fail); } catch (err) { fail(); }
  });
})();

/* Navigasi antar halaman (single page, 7 sesi) */
(function () {
  var P = ["beranda","layanan","angka","tentang","tips","faq","kontak"];
  function go() {
    var h = (location.hash || "").slice(1);
    if (P.indexOf(h) < 0) h = "beranda";
    document.querySelectorAll(".yayat_page").forEach(function (s) { s.hidden = s.getAttribute("data-page") !== h; });
    document.querySelectorAll("#yayat_menu a").forEach(function (a) {
      var on = a.getAttribute("href") === "#" + h;
      a.classList.toggle("yayat_active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    window.scrollTo(0, 0);
    document.title = document.querySelector('#yayat_menu a[href="#' + h + '"]').textContent + " · Mantri Yayat Supriatna";
  }
  window.addEventListener("hashchange", go);
  go();
})();
