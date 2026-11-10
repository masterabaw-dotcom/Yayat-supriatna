(function () {
  // Ganti nomor ini (format internasional tanpa +/0 di depan) dengan nomor WhatsApp praktik Anda.
  var WA = "6281222906901";
  // Jam praktik per hari (0=Minggu): daftar [mulai, selesai] dalam menit sejak 00.00
  var SESI = [[5 * 60, 7 * 60], [15 * 60, 22 * 60]]; // pagi 05.00-07.00, sore 15.00-22.00
  var SCHEDULE = { 0: SESI, 1: SESI, 2: SESI, 3: SESI, 4: SESI, 5: SESI, 6: SESI };
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
    var dot = document.getElementById("dot"), t = document.getElementById("statusText"), s = document.getElementById("statusSub");
    if (open) {
      dot.className = "dot on"; t.textContent = "Praktik buka sekarang";
      s.textContent = "Tutup pukul " + fmt(open[1]) + " WIB";
    } else {
      dot.className = "dot"; t.textContent = "Praktik sedang tutup";
      if (next) { s.textContent = "Buka lagi hari ini pukul " + fmt(next[0]) + " WIB"; }
      else {
        var d = (n.day + 1) % 7, k = 0;
        while ((SCHEDULE[d] || []).length === 0 && k < 7) { d = (d + 1) % 7; k++; }
        s.textContent = "Buka lagi " + DAYS[d] + " pukul " + fmt(SCHEDULE[d][0][0]) + " WIB";
      }
    }
    var items = document.querySelectorAll("#hours li");
    for (i = 0; i < items.length; i++) items[i].classList.toggle("today", parseInt(items[i].getAttribute("data-day"), 10) === n.day);
  }
  renderStatus();
  setInterval(renderStatus, 60000);

  var form = document.getElementById("bookForm"), msg = "";
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var nama = document.getElementById("nama").value.trim();
    var nameEl = document.getElementById("nama");
    if (!nama) { nameEl.focus(); nameEl.style.borderColor = "var(--closed)"; return; }
    nameEl.style.borderColor = "";
    var lay = document.getElementById("layanan-pilih").value;
    var waktu = document.getElementById("waktu").value.trim();
    var kel = document.getElementById("keluhan").value.trim();
    msg = "Halo Mantri, saya " + nama + ". Saya ingin membuat janji: " + lay + "." +
      (waktu ? " Waktu yang saya inginkan: " + waktu + "." : "") +
      (kel ? " Keluhan: " + kel + "." : "") + " Terima kasih.";
    document.getElementById("previewText").textContent = msg;
    document.getElementById("waLink").href = "https://wa.me/" + WA + "?text=" + encodeURIComponent(msg);
    document.getElementById("preview").classList.add("show");
    document.getElementById("copied").hidden = true;
  });
  document.getElementById("copyBtn").addEventListener("click", function () {
    var ok = document.getElementById("copied");
    function done() { ok.hidden = false; ok.textContent = "Tersalin"; }
    function fail() {
      var r = document.createRange(); r.selectNodeContents(document.getElementById("previewText"));
      var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
      ok.hidden = false; ok.textContent = "Teks terpilih, tekan salin";
    }
    try { navigator.clipboard.writeText(msg).then(done, fail); } catch (err) { fail(); }
  });
})();
(function(){var P=["beranda","layanan","angka","tentang","tips","faq","kontak"];
function go(){var h=(location.hash||"").slice(1);if(P.indexOf(h)<0)h="beranda";
document.querySelectorAll(".page").forEach(function(s){s.hidden=s.getAttribute("data-page")!==h});
document.querySelectorAll("nav a").forEach(function(a){var on=a.getAttribute("href")==="#"+h;a.classList.toggle("active",on);if(on)a.setAttribute("aria-current","page");else a.removeAttribute("aria-current")});
window.scrollTo(0,0);document.title=document.querySelector('nav a[href="#'+h+'"]').textContent.replace("&amp;","&")+" · Mantri Yayat Supriatna"}
window.addEventListener("hashchange",go);go()})();
