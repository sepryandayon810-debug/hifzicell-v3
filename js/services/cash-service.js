/**
 * CASH SERVICE
 * Manage modal, shift, kas masuk/keluar.
 */
class CashService {
  constructor() {
    this.current = null;
    this.mutations = [];

    // Listen shift aktif dari Firebase
    db.ref("shifts").orderByChild("status").equalTo("open").on("value", function(snap) {
      var data = snap.val() || {};
      var open = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          open.push({ id: key, ...data[key] });
        }
      }
      var uid = getUid ? getUid() : null;
      var found = null;
      for (var i = 0; i < open.length; i++) {
        if (open[i].kasirId === uid) {
          found = open[i];
          break;
        }
      }
      this.current = found || open[0] || null;
    }.bind(this));

    // Listen kas mutations dari Firebase
    db.ref("kas_mutations").orderByChild("timestamp").limitToLast(200).on("value", function(snap) {
      var data = snap.val() || {};
      this.mutations = [];
      for (var key in data) {
        if (data.hasOwnProperty(key)) {
          this.mutations.push({ id: key, ...data[key] });
        }
      }
    }.bind(this));
  }

  async openShift(modal_awal, kasirName) {
    var shiftId = 'SHIFT-' + Date.now();
    var shift = {
      id: shiftId,
      modal_awal: modal_awal || 0,
      start: new Date().toISOString(),
      end: null,
      kasirId: (getUid ? getUid() : null) || "unknown",
      kasirName: kasirName || "Kasir",
      status: "open"
    };
    await db.ref('shifts/' + shiftId).set(shift);
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
      kasirId: (getUid ? getUid() : null) || "unknown"
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
    var summary = this.getDailySummary();
    var shiftUpdate = {
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

    var todayMuts = [];
    for (var i = 0; i < this.mutations.length; i++) {
      var m = this.mutations[i];
      if (m.dateKey === today && m.shiftId === shiftId) {
        todayMuts.push(m);
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
