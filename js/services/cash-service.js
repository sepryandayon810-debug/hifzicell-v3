/**
 * CASH SERVICE
 * Manage modal, shift, kas masuk/keluar.
 */
class CashService {
  constructor() {
    this.current = null;
    this.mutations = [];

    // Listen shift aktif dari Firebase
    db.ref("shifts").orderByChild("status").equalTo("open").on("value", snap => {
      const data = snap.val() || {};
      const open = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      this.current = open.find(s => s.kasirId === getUid()) || open[0] || null;
    });

    // Listen kas mutations dari Firebase
    db.ref("kas_mutations").orderByChild("timestamp").limitToLast(200).on("value", snap => {
      const data = snap.val() || {};
      this.mutations = Object.entries(data).map(([id, v]) => ({ id, ...v }));
    });
  }

  load() {
    try { return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {}; }
    catch { return {}; }
  }

  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  }

  async openShift(modal_awal, kasirName) {
    const shiftId = 'SHIFT-' + Date.now();
    const shift = {
      id: shiftId,
      modal_awal: modal_awal,
      start: new Date().toISOString(),
      end: null,
      kasirId: getUid() || "unknown",
      kasirName: kasirName,
      status: "open"
    };
    await db.ref('shifts/' + shiftId).set(shift);
    this.current = shift;
    return shift;
  }

  async addMutation(type, amount, note, fee) {
    fee = fee || 0;
    if (!this.current) throw new Error("Shift belum dibuka");
    const mutId = 'MUT-' + Date.now();
    await db.ref('kas_mutations/' + mutId).set({
      id: mutId,
      shiftId: this.current.id,
      type: type,
      amount: amount,
      note: note,
      fee: fee,
      timestamp: new Date().toISOString(),
      dateKey: new Date().toISOString().split("T")[0],
      kasirId: getUid()
    });
  }

  async addCash(amount, note) {
    await this.addMutation("in", amount, note);
  }

  async reduceCash(amount, note) {
    await this.addMutation("out", amount, note);
  }

  async closingShift() {
    if (!this.current) throw new Error("Tidak ada shift aktif");
    const summary = this.getDailySummary();
    const shiftUpdate = {
      end: new Date().toISOString(),
      status: "closed",
      summary: summary
    };
    await db.ref('shifts/' + this.current.id).update(shiftUpdate);
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

    var todayMuts = this.mutations.filter(function(m) {
      return m.dateKey === today && m.shiftId === shiftId;
    });

    var kasMasuk = todayMuts.filter(function(m) { return m.type === "in"; }).reduce(function(s, m) { return s + m.amount; }, 0);
    var kasKeluar = todayMuts.filter(function(m) { return m.type === "out"; }).reduce(function(s, m) { return s + m.amount; }, 0);
    var topups = todayMuts.filter(function(m) { return m.type === "topup"; });
    var tariks = todayMuts.filter(function(m) { return m.type === "tarik"; });

    return {
      modal_awal: this.current ? (this.current.modal_awal || 0) : 0,
      total_transaksi: todayTxs.length,
      total_laba: todayTxs.reduce(function(s, t) { return s + (t.profit || 0); }, 0),
      uang_masuk: kasMasuk,
      uang_keluar: kasKeluar,
      penjualan_produk: todayTxs.reduce(function(s, t) { return s + t.total; }, 0),
      topup: topups.reduce(function(s, m) { return s + m.amount; }, 0),
      tarik_tunai: tariks.reduce(function(s, m) { return s + m.amount; }, 0),
      total_admin_fee: topups.concat(tariks).reduce(function(s, m) { return s + (m.fee || 0); }, 0),
      piutang_customer: todayTxs.filter(function(t) { return t.payment_method === "credit"; }).reduce(function(s, t) { return s + t.total; }, 0)
    };
  }
}

window.cashService = new CashService();
