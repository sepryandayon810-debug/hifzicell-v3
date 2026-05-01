/**
 * SETTING SERVICE
 * Pusat konfigurasi global. Semua modul ambil config dari sini.
 * Tidak boleh hardcode di UI.
 */
class SettingService {
  constructor() {
    this.STORAGE_KEY = 'webpos_settings_v3';
    this.listeners = [];
    this.defaults = {
      theme: 'ocean',
      printer: {
        device_name: null,
        paper_size: '80mm',
        auto_print: false
      },
      receipt: {
        header: 'NAMA TOKO\nAlamat Toko\nTelp: 0812-3456-7890',
        footer: 'Terima Kasih Atas Kunjungan Anda\nStruk Ini Adalah Bukti Pembayaran'
      },
      app_name: 'WebPOS'
    };
    this.config = this.load();
    if (!this.config) this.reset();
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)); }
    catch { return null; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.config));
    this.notify();
  }

  reset() {
    this.config = JSON.parse(JSON.stringify(this.defaults));
    this.save();
  }

  /* --- THEME --- */
  getTheme() { return this.config.theme; }
  setTheme(themeName) {
    if (!themeName) return;
    this.config.theme = themeName;
    this.save();
    this.applyTheme(themeName);
  }
  applyTheme(themeName) {
    document.body.className = `theme-${themeName}`;
  }

  /* --- PRINTER --- */
  getPrinterConfig() { return { ...this.config.printer }; }
  setPrinterConfig(cfg) {
    this.config.printer = { ...this.config.printer, ...cfg };
    this.save();
  }

  /* --- RECEIPT --- */
  getReceiptConfig() { return { ...this.config.receipt }; }
  setReceiptConfig(cfg) {
    this.config.receipt = { ...this.config.receipt, ...cfg };
    this.save();
  }

  /* --- EVENTS --- */
  onChange(callback) { this.listeners.push(callback); }
  notify() { this.listeners.forEach(cb => cb(this.config)); }
}

// Global instance
window.settingService = new SettingService();
