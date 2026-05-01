app:
  name: WebPOS
  architecture: modular-service-layer
  version: 1.3

core_principles:
  - Semua modul tidak boleh saling akses langsung
  - Semua komunikasi lewat service layer
  - Gunakan contract data (schema tetap)
  - UI tidak boleh menyimpan logic bisnis
  - Semua konfigurasi global dari setting_service

# ========================
# 🎨 GLOBAL FEATURES
# ========================

global_features:

  themes:
    total: 10
    description: Tema UI dengan nuansa berbeda (warna, font, layout ringan)
    managed_by: setting_service
    apply_to: seluruh halaman (global UI)

  printer:
    type: bluetooth
    managed_by: setting_service
    usage:
      - cetak struk transaksi
    config:
      - device_name
      - paper_size
      - auto_print

  receipt:
    managed_by: setting_service
    customizable:
      - header (nama toko, alamat, logo)
      - footer (pesan)
      - format struk

# ========================
# 🧩 MODULES
# ========================

modules:

  dashboard:
    depends_on:
      - report_service
      - cash_service
      - transaction_service

    ui:
      summary_cards:
        - modal_awal
        - total_transaksi
        - total_laba
        - nama_user

      cash_calculation:
        - modal_awal
        - uang_masuk
        - uang_keluar
        - penjualan_produk
        - topup
        - tarik_tunai
        - piutang_customer

      quick_actions:
        - kas_masuk
        - kas_keluar
        - buka_shift
        - closing_shift

    rules:
      - read-only
      - tidak boleh hitung manual

  kasir:
    uses:
      - transaction_service
      - product_service

    features:
      - pencarian_produk
      - kategori_produk
      - sorting_a_z
      - sorting_z_a
      - input_manual_produk
      - edit_harga
      - edit_modal
      - pembayaran_cash
      - pembayaran_transfer
      - pembayaran_hutang

    navigation:
      - ke_topup
      - ke_tarik_tunai

  produk:
    uses:
      - stock_service

  transaksi:
    uses:
      - transaction_service

  kas_management:
    uses:
      - cash_service

  hutang_piutang:
    uses:
      - debt_service

  laporan:
    uses:
      - report_service

  pelanggan:
    uses:
      - customer_service

  sistem:
    uses:
      - setting_service

    submodules:
      - pengaturan_tema
      - pengaturan_printer
      - pengaturan_struk
      - pengguna
      - backup
      - log

# ========================
# 🔧 SERVICES
# ========================

services:

  transaction_service:
    flow:
      - validate
      - save
      - update_stock
      - update_cash
      - update_report
      - create_debt_if_credit
      - trigger_print

  stock_service:
    actions:
      - decrease_stock
      - increase_stock

  cash_service:
    actions:
      - add_cash
      - reduce_cash
      - manage_shift
      - closing_shift
      - get_daily_summary

  report_service:
    actions:
      - get_dashboard_summary
      - update_sales_report

  debt_service:
    actions:
      - add_debt
      - pay_debt

  customer_service:
    actions:
      - add_customer
      - get_customer

  setting_service:
    description: pusat semua konfigurasi global

    actions:
      - get_theme
      - set_theme
      - get_printer_config
      - set_printer_config
      - get_receipt_config
      - set_receipt_config

  printer_service:
    depends_on:
      - setting_service

    actions:
      - connect_bluetooth
      - print_receipt

# ========================
# 🔄 FLOWS
# ========================

flows:

  transaksi_kasir:
    steps:
      - kasir.input
      - transaction_service.process
      - stock update
      - cash update
      - report update
      - printer_service.print

  dashboard_load:
    steps:
      - cash_service.get_daily_summary
      - report_service.get_dashboard_summary

  setting_update:
    steps:
      - update via setting_service
      - apply ke seluruh UI

# ========================
# 📊 CONTRACT
# ========================

contracts:

  transaction:
    id: string
    date: datetime
    items: array
    total: number
    payment_method: cash | transfer | credit

  setting:
    theme: string
    printer:
      device: string
      paper_size: string
    receipt:
      header: string
      footer: string

# ========================
# 🛡️ RULES
# ========================

rules:

  - UI tidak boleh akses database langsung
  - Semua config hanya dari setting_service
  - Tidak boleh hardcode tema / printer
  - Semua print harus lewat printer_service
  - Tidak boleh ubah schema tanpa versi baru
