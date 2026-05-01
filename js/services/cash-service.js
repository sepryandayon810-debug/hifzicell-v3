/**
 * CASH SERVICE
 * Manage modal, shift, kas masuk/keluar.
 */
class CashService {
  constructor() {
    this.current = null;
    this.mutations = [];

    // Listen kas mutations dari Firebase
    var self = this;
    db.ref("kas_mutations").orderByChild("timestamp").limitToLast(200).on("value", function(snap) {
      var data = snap.val() || {};
      self.mutations = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          self.mutations.push({ id: key, ...data[key] });
        }
      }
    });
  }

  _getUid() {
    return (typeof getUid === "function") ? getUid() : null;
  }

  async openShift(modal_awal, kasirName, shiftDate) {
    var uid = this._getUid() || "unknown";
    var shiftId = 'SHIFT-' + Date.now();
    var today = shiftDate || new Date().toISOString().split('T')[0];

    var shift = {
      id: shiftId,
      modal_awal: modal_awal || 0,
      start: new Date().toISOString(),
      end: null,
      kasirId: uid,
      kasirName: kasirName || "Kasir",
      status: "open",
      shiftDate: today
    };

    // Simpan ke path yang bisa di-restore di index.html
    await db.ref('shifts/' + uid + '/current').set(shift);
    // Simpan juga ke history untuk arsip
    await db.ref('shifts_history/' + shiftId).set(shift);

    this.current = shift;
    return shift;
  }

  async addMutation(type, amount, note, fee) {
    fee = fee || 0;
    if (!this.current) throw new Error("Shift belum dibuka");
    var mutId = 'MUT-' + Date.now();
    await db.ref('kas_mutations/' + mutId).set({
      id: mutId,
      shiftId: this.current.id || "",
      type: type || "in",
      amount: amount || 0,
      note: note || "",
      fee: fee,
      timestamp: new Date().toISOString(),
      dateKey: new Date().toISOString().split("T")[0],
      kasirId: this._getUid() || "unknown"
    });
  }

  async addCash(amount, note) {
    await this.addMutation("in", amount, note);
  }

  async reduceCash(amount, note) {
    await this.addMutation("out", amount, note);
  }

  async topUp(amount) {
    if (!amount || amount <= 0) return { success: false, error: "Nominal tidak valid" };
    var feeCfg = window.settingService ? window.settingService.getAdminFee() : { topup_percent: 0, topup_flat: 0 };
    var fee = Math.floor(amount * (feeCfg.topup_percent || 0) / 100) + (feeCfg.topup_flat || 0);
    var net = amount - fee;
    await this.addMutation("topup", net, "Top Up", fee);
    return { success: true, amount: net, fee: fee };
  }

  async tarikTunai(amount) {
    if (!amount || amount <= 0) return { success: false, error: "Nominal tidak valid" };
    var feeCfg = window.settingService ? window.settingService.getAdminFee() : { tarik_percent: 0, tarik_flat: 0 };
    var fee = Math.floor(amount * (feeCfg.tarik_percent || 0) / 100) + (feeCfg.tarik_flat || 0);
    var total = amount + fee;
    await this.addMutation("tarik", amount, "Tarik Tunai", fee);
    return { success: true, received: amount, fee: fee, total: total };
  }

  async setModalAwal(amount) {
    if (!this.current) throw new Error("Shift belum dibuka");
    this.current.modal_awal = amount || 0;
    var uid = this._getUid() || "unknown";
    await db.ref('shifts/' + uid + '/current/modal_awal').set(this.current.modal_awal);
    return this.current;
  }

  async transferShift(targetId, userService) {
    if (!this.current) return { success: false, error: "Shift belum dibuka" };
    if (!targetId) return { success: false, error: "Pilih user tujuan" };

    var summary = this.getDailySummary();
    var totalUang = (summary.modal_awal || 0)
      + (summary.uang_masuk || 0)
      - (summary.uang_keluar || 0)
      + (summary.penjualan_produk || 0)
      - (summary.piutang_customer || 0)
      + (summary.topup || 0)
      + (summary.total_admin_fee || 0)
      - (summary.tarik_tunai || 0);

    // Tutup shift lama
    var uid = this._getUid() || "unknown";
    var shiftUpdate = {
      end: new Date().toISOString(),
      status: "closed",
      summary: summary,
      transferTo: targetId,
      fisik_total: totalUang
    };
    await db.ref('shifts_history/' + this.current.id).update(shiftUpdate);
    await db.ref('shifts/' + uid + '/current').remove();

    // Buka shift baru untuk target
    var targetUser = await userService.getById(targetId);
    var targetName = targetUser ? (targetUser.name || targetUser.username) : "Kasir";
    var today = new Date().toISOString().split('T')[0];
    var newShift = {
      id: 'SHIFT-' + Date.now(),
      modal_awal: totalUang,
      start: new Date().toISOString(),
      end: null,
      kasirId: targetId,
      kasirName: targetName,
      status: "open",
      shiftDate: today,
      transferredFrom: uid
    };
    await db.ref('shifts/' + targetId + '/current').set(newShift);

    this.current = null;
    return { success: true, targetName: targetName, modal: totalUang };
  }

  async closingShift(fisikTotal) {
    if (!this.current) throw new Error("Tidak ada shift aktif");
    var summary = this.getDailySummary();
    var systemTotal = (summary.modal_awal || 0)
      + (summary.uang_masuk || 0)
      - (summary.uang_keluar || 0)
      + (summary.penjualan_produk || 0)
      - (summary.piutang_customer || 0)
      + (summary.topup || 0)
      + (summary.total_admin_fee || 0)
      - (summary.tarik_tunai || 0);

    var shiftUpdate = {
      end: new Date().toISOString(),
      status: "closed",
      summary: summary,
      fisik_total: fisikTotal || 0,
      selisih: (fisikTotal || 0) - systemTotal
    };

    // Update history
    await db.ref('shifts_history/' + this.current.id).update(shiftUpdate);
    // Hapus current agar auto reset tidak ke-trigger lagi
    var uid = this._getUid() || "unknown";
    await db.ref('shifts/' + uid + '/current').remove();

    var result = { id: this.current.id };
    for (var key in shiftUpdate) { result[key] = shiftUpdate[key]; }
    for (var key in summary) { result[key] = summary[key]; }

    this.current = null;
    return result;
  }

  /* --- DASHBOARD DATA (Read Only) --- */
  getDailySummary() {
    var today = new Date().toISOString().split("T")[0];
    var shiftId = this.current ? this.current.id : null;

    var todayTxs = [];
    if (window.transactionService && window.transactionService.getToday) {
      todayTxs = window.transactionService.getToday();
    }

    var todayMuts = [];
    for (var i = 0; i < this.mutations.length; i++) {
      var m = this.mutations[i];
      // Kalau shift aktif, filter by shiftId. Kalau tidak, filter by hari ini saja.
      if (m.dateKey === today) {
        if (!shiftId || m.shiftId === shiftId) {
          todayMuts.push(m);
        }
      }
    }

    var kasMasuk = 0;
    var kasKeluar = 0;
    var topups = [];
    var tariks = [];
    for (var i = 0; i < todayMuts.length; i++) {
      var m = todayMuts[i];
      if (m.type === "in") kasMasuk += m.amount;
      if (m.type === "out") kasKeluar += m.amount;
      if (m.type === "topup") topups.push(m);
      if (m.type === "tarik") tariks.push(m);
    }

    var totalLaba = 0;
    var penjualan = 0;
    var piutang = 0;
    for (var i = 0; i < todayTxs.length; i++) {
      var t = todayTxs[i];
      totalLaba += (t.profit || 0);
      penjualan += (t.total || 0);
      if (t.payment_method === "credit") piutang += (t.total || 0);
    }

    var topupAmount = 0;
    var tarikAmount = 0;
    var totalFee = 0;
    for (var i = 0; i < topups.length; i++) { topupAmount += topups[i].amount; totalFee += (topups[i].fee || 0); }
    for (var i = 0; i < tariks.length; i++) { tarikAmount += tariks[i].amount; totalFee += (tariks[i].fee || 0); }

    return {
      modal_awal: this.current ? (this.current.modal_awal || 0) : 0,
      total_transaksi: todayTxs.length,
      total_laba: totalLaba,
      uang_masuk: kasMasuk,
      uang_keluar: kasKeluar,
      penjualan_produk: penjualan,
      topup: topupAmount,
      tarik_tunai: tarikAmount,
      total_admin_fee: totalFee,
      piutang_customer: piutang
    };
  }
}

window.cashService = new CashService();
