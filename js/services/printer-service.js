/**
 * PRINTER SERVICE
 * Handle koneksi Bluetooth & cetak struk ESC/POS.
 * Config dari setting_service. Tidak ada hardcode.
 */
class PrinterService {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnected = false;
  }

  /* --- BLUETOOTH CONNECTION --- */
  async connect() {
    try {
      // Request device (user pilih printer di popup browser)
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb',  // Common printer
          'e7810a71-73ae-499d-8c15-faa27a95c6bb',  // Some thermal printers
          '49535343-fe7d-4ae5-8fa9-9fafd205e455'   // Others
        ]
      });

      this.server = await this.device.gatt.connect();
      
      // Try common services
      const services = await this.server.getPrimaryServices();
      let targetService = null;
      
      for (const svc of services) {
        const chars = await svc.getCharacteristics();
        const writable = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
        if (writable) {
          targetService = svc;
          this.characteristic = writable;
          break;
        }
      }

      if (!this.characteristic) throw new Error('Printer tidak support ESC/POS');

      this.isConnected = true;
      
      // Save ke setting (nama device saja, bukan object)
      window.settingService.setPrinterConfig({ device_name: this.device.name });

      return { success: true, deviceName: this.device.name };
    } catch (err) {
      console.error('Printer connect error:', err);
      return { success: false, error: err.message };
    }
  }

  disconnect() {
    if (this.server) this.server.disconnect();
    this.device = null;
    this.isConnected = false;
  }

  /* --- PRINT RECEIPT --- */
  async printReceipt(transaction) {
    if (!this.characteristic && !this.isConnected) {
      // Jika belum connect, coba pakai device tersimpan (tidak selalu works, butuh user gesture)
      console.warn('Printer belum terkoneksi');
      return false;
    }

    const receipt = window.settingService.getReceiptConfig();
    const encoder = new TextEncoder();
    const cmds = [];

    // ESC/POS Init
    cmds.push(0x1B, 0x40);
    
    // Header dari setting
    cmds.push(...encoder.encode(receipt.header + '\n'));
    cmds.push(...encoder.encode('--------------------------------\n'));

    // Items
    transaction.items.forEach(item => {
      const name = (item.name || 'Produk').substring(0, 20).padEnd(20);
      const qty = String(item.qty || 1).padStart(3);
      const price = this.formatRupiah(item.price || 0).padStart(12);
      cmds.push(...encoder.encode(`${name}${qty}x${price}\n`));
    });

    cmds.push(...encoder.encode('--------------------------------\n'));
    
    // Total & Payment
    cmds.push(...encoder.encode(`TOTAL     : ${this.formatRupiah(transaction.total)}\n`));
    cmds.push(...encoder.encode(`METODE    : ${transaction.payment_method.toUpperCase()}\n`));
    if (transaction.customer && transaction.customer !== 'Umum') {
      cmds.push(...encoder.encode(`PELANGGAN : ${transaction.customer}\n`));
    }
    
    cmds.push(...encoder.encode('\n'));
    
    // Footer dari setting
    cmds.push(...encoder.encode(receipt.footer + '\n'));
    
    // Feed & Cut
    cmds.push(0x1B, 0x64, 0x05);  // Feed 5 lines
    cmds.push(0x1D, 0x56, 0x41, 0x00);  // Partial cut

    // Send per chunk (Bluetooth LE limit)
    const chunkSize = 512;
    const uint8 = new Uint8Array(cmds);
    
    for (let i = 0; i < uint8.length; i += chunkSize) {
      const chunk = uint8.slice(i, i + chunkSize);
      await this.characteristic.writeValueWithoutResponse(chunk);
    }

    return true;
  }

  formatRupiah(num) {
    return 'Rp ' + num.toLocaleString('id-ID');
  }
}

window.printerService = new PrinterService();
