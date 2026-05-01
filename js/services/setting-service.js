class SettingService {
  constructor() {
    this.listeners = [];                    // ← FIX BUG 1
    this.LOCAL_KEY = 'webpos_settings_v3_local';
    
    // Firebase: admin fee & receipt global
    this.appSettings = null;
    this.ref = db.ref("settings/app");
    this.ref.on("value", snap => {
      this.appSettings = snap.val() || {};
      this.notify();                        // ← supaya UI update kalau owner ganti fee
    });
    
    // Local: tema, printer (beda per device)
    this.defaults = {
      theme: 'ocean',
      dark_mode: false,
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
    try { return JSON.parse(localStorage.getItem(this.LOCAL_KEY)); }  // ← FIX BUG 2
    catch { return null; }
  }

  save() {
    localStorage.setItem(this.LOCAL_KEY, JSON.stringify(this.config));  // ← FIX BUG 2
    this.notify();
  }

  reset() {
    this.config = JSON.parse(JSON.stringify(this.defaults));
    this.save();
  }

  /* --- THEME & DARK MODE --- */
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
  getDarkMode() { return !!this.config.dark_mode; }
  setDarkMode(v) {
    this.config.dark_mode = !!v;
    this.save();
  }

  /* --- PRINTER --- */
  getPrinterConfig() { return { ...this.config.printer }; }
  setPrinterConfig(cfg) {
    this.config.printer = { ...this.config.printer, ...cfg };
    this.save();
  }

  /* --- RECEIPT: Hybrid Firebase + Local --- */
  getReceiptConfig() {                                   // ← FIX BUG 3
    const fb = this.appSettings?.receipt;
    return {
      header: fb?.header || this.config.receipt.header,
      footer: fb?.footer || this.config.receipt.footer
    };
  }
  setReceiptConfig(cfg) {
    this.config.receipt = { ...this.config.receipt, ...cfg };
    this.save();
  }

  /* --- ADMIN FEE: Dari Firebase --- */
  getAdminFee() {                                      // ← FIX BUG 4
    return this.appSettings?.admin_fee || { 
      topup_percent: 0, 
      topup_flat: 0, 
      tarik_percent: 0, 
      tarik_flat: 0 
    };
  }

  /* --- EVENTS --- */
  onChange(callback) { this.listeners.push(callback); }
  notify() { this.listeners.forEach(cb => cb(this.config)); }
}

window.settingService = new SettingService();
