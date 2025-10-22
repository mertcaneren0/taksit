# DİŞ KLİNİĞİ YÖNETİM SİSTEMİ - PROJE YOL HARİTASI VE BAĞLAM

## GENEL PROJE BİLGİLERİ

### Teknoloji Seçimleri
- **Frontend**: React.js, Material-UI (MUI)
- **Backend**: Node.js, Express
- **Veritabanı**: PostgreSQL
- **Kimlik Doğrulama**: JWT (JSON Web Token)
- **Dağıtım**: CapRover (Docker tabanlı)

### Proje Aşamaları

#### Aşama 1: Temel ve Acil İhtiyaç (Tamamlandı)
- **Güvenlik**: Sisteme ID ve Şifre ile giriş zorunluluğu
- **Navigasyon**: Sol tarafta sabit bir navigasyon çubuğu (Drawer)
- **Taksitli Hastalar Yönetimi**: Ana modül

#### Aşama 2: Geliştirme ve Genişletme (İleriki Plan)
- **Hasta Kaydı Modülü**: Kapsamlı hasta bilgileri ve tedavi notları
- **Erişim Kontrolü (RBAC)**: Rol Tabanlı Erişim Kontrolü
- **Raporlama Modülü**: Finansal özetler, geciken ödemeler ve genel performans takibi

## VERİ YAPISI

### Veri Alanları
- **TC Kimlik No**: Benzersiz tanımlayıcı
- **İsim Soyisim**: Hasta adı ve soyadı
- **Telefon**: İletişim bilgisi
- **Hekim**: Tedaviyi yapan doktor (Emrecan Eren, Barkın Ergin, Mehmet Varyemez)
- **İşlem**: Yapılan tedavi/işlem
- **Toplam Tedavi Tutarı**: Toplam ücret
- **Kalan Tutar**: Ödenmemiş miktar
- **Taksit Sayısı**: Toplam taksit adedi
- **Taksit Tarihleri**: Her taksit için ayrı tarih
- **Taksit Durumu**: Her taksit için: Ödendi, Ödenmedi, Gecikti
- **Ödeme Şekli**: Nakit, Kredi Kartı, EFT/Havale
- **Not**: Ek bilgiler
- **Tedavi Başlangıç Tarihi**: Tedavinin başladığı tarih
- **Son Ödeme Alınan Tarih**: En son ödeme tarihi
- **Anlaşılan Ödeme Tipi**: Havale, Nakit, Kredi Kartı

## İŞLEVSELLİK

### Temel İşlevler
- **Hasta Yönetimi**: Ekleme, düzenleme, silme, listeleme
- **Taksit Yönetimi**: Taksit oluşturma, düzenleme, ödeme alma
- **Ödeme Takibi**: Geciken ödemelerin görsel olarak işaretlenmesi ve bildirim sistemi
- **Taksit Onaylama**: Ödeme alındığında ilgili taksitin durumunu güncelleme mekanizması
- **Filtreleme ve Arama**: Tarih, durum, hasta bilgisi bazında filtreleme ve arama
- **Borçlu Hasta Takibi**: Borcu olan hastaların ayrı bir modülde yönetimi

### Kullanıcı Arayüzü
- **Navigasyon**: Sol kenar çubuğu (Drawer) ile sayfa geçişleri
- **Anasayfa**: Özet bilgiler ve hızlı erişim butonları
- **Taksitli Hastalar Sayfası**: Taksit takibi ve yönetimi
- **Borçlu Hastalar Sayfası**: Borç takibi ve yönetimi
- **Formlar**: Yeni hasta girişi, ödeme alma, düzenleme için diyalog kutuları

## VERİTABANI ENTEGRASYONU

### Geçiş Planı
- **Mevcut Durum**: localStorage tabanlı geçici veritabanı
- **Hedef**: PostgreSQL veritabanı ile gerçek backend entegrasyonu
- **Adaptör Katmanı**: localStorage ve gerçek API arasında geçiş için adaptör

### Veritabanı Tabloları
- **hastalar**: Hasta bilgileri
- **taksitler**: Taksit detayları
- **kullanicilar**: Kullanıcı hesapları
- **ayarlar**: Sistem ayarları

## DAĞITIM VE ALTYAPI

### Dağıtım Ortamı
- **Domain**: eeyonetim.com
- **Platform**: CapRover (Docker tabanlı)
- **Frontend**: Nginx ile sunulan SPA (Single Page Application)
- **Backend**: Node.js API Sunucusu

### Dosya Yapılandırmaları
- **Frontend**: Dockerfile, nginx.conf, captain-definition
- **Backend**: Dockerfile, captain-definition, .env yapılandırması

## NOTLAR VE KARARLAR

- AppBar kullanılmayacak, sadece sol Drawer ile navigasyon sağlanacak
- Taksit tutarları manuel olarak düzenlenebilecek
- Geçmiş tarihli ve ödenmemiş taksitler otomatik olarak "Gecikti" durumuna alınacak
- Mobil uyumlu ve modern bir kullanıcı arayüzü sağlanacak

## DEPO VE SİPARİŞ MODÜLÜ - GÜNCEL DURUM (22.10.2025)

### Teknik Çerçeve ve Kurallar
- **[UI]** Frontend: MUI + MUI DataGrid zorunlu. Yeni sayfa: `src/pages/InventoryPage.js`.
- **[Backend]** Express + Sequelize. Yeni router: `server/src/routes/inventoryRoutes.js` → `/api/inventory/*`.
- **[Veritabanı]** PostgreSQL, mevcut canlı tablolara müdahale edilmedi. Yeni tablolar `inv_` öneki ile planlandı.

### Bugün Tamamlananlar
- **[Navigasyon]** Sol Drawer’a “Depo ve Sipariş” menü öğesi eklendi (`MainLayout.js`). Rota: `"/depo-siparis"` (`App.js`).
- **[Sayfa İskeleti]** `InventoryPage` oluşturuldu.
  - Uyarı kartları: “Kritik Stok”, “SKT Yaklaşan”.
  - Ana liste: DataGrid kolonları (Malzeme Adı, Toplam Adet, Kritik Adet, En Yakın SKT, Son Fiyat, Konum Chip’leri).
  - Hızlı düzenleme alt yapısı için `editable` alan hazırlığı (kritik adet).
- **[Sipariş Akışı - V1]** “Malzeme Siparişi Oluştur” butonu → Dialog.
  - DataGrid seçim (checkbox) + her satır için “Sipariş Miktarı”.
  - PDF çıktı: A4 dikey, `jspdf + autotable` ile indirme.
- **[Malzeme Girişi (Stok IN) - V1]** “Malzeme Girişi” Dialog’u eklendi.
  - Alanlar: Malzeme Adı, Konum, Miktar, Tedarikçi (ops.), Lot, SKT, Birim Maliyet (ops.).
  - Kayıt: `POST /api/inventory/stock/in` (şimdilik iskelet; 201 döner, DB yazmıyor).
- **[Frontend API]** `src/api/apiClient.js` envanter uçları eklendi:
  - `inventory.alertsSummary()`, `inventory.materials()`, `inventory.materialById()`, `inventory.priceHistory()`, `inventory.stockLots()`, `inventory.movements()`, `inventory.orders()`, `inventory.createOrder()`, `inventory.stockIn()`.
- **[Backend API İskeleti]** `inventoryRoutes.js` içinde aşağıdaki uçlar boş/sade veri döner:
  - GET `/alerts/summary`, GET `/materials`, GET `/materials/:id`, GET `/materials/:id/price-history`, GET `/materials/:id/stock-lots`, GET `/materials/:id/movements`, GET `/orders`, POST `/orders`, POST `/stock/in`.
- **[Seçim/Footers Uyumluluğu]** MUI X v8 uyumlu seçim modeli normalize edildi, Grid footer kaynaklı hata `hideFooter` ile giderildi.

### Modelleme (Sequelize; yalnızca tanım, tablo oluşturmaz)
- `server/src/models/` altında eklendi:
  - `inv_material.js`, `inv_supplier.js`, `inv_location.js`, `inv_location_hint.js`, `inv_material_location_threshold.js`,
  - `inv_stock_lot.js`, `inv_stock_movement.js`, `inv_price_history.js`, `inv_order.js`, `inv_order_item.js`.
- İlişkiler `server/src/models/index.js` içinde tanımlandı ve yüklendi.

### Bekleyen/Planlanan İşler (Bir Sonraki Sprint)
- **[Migrasyonlar]** `inv_*` tabloları için PostgreSQL migrasyonları (mevcut tablolara dokunmadan, rollback planlı).
- **[Gerçek Veri]**
  - GET `/inventory/materials`: toplam adet, en yakın SKT, son fiyat, konum etiketleri.
  - GET `/inventory/alerts/summary`: kritik stok ve SKT yaklaşan sayıları (varsayılan eşik: 30 gün).
- **[Stok Hareketleri]** `POST /inventory/stock/transfer` (Depo → Klinik, miktar düş/ekle, lot/SKT uyumlu).
- **[Autocomplete]** Konum/raf ve tedarikçi için arama uçları (`/inventory/locations?search=`, `/inventory/suppliers?search=`).
- **[Sipariş Kaydı]** Dialog’a “Kaydet” eklenmesi → `POST /inventory/orders` entegrasyonu.
- **[Detay Ekranı]** Malzeme detayında lot/SKT listesi, hareket geçmişi, fiyat geçmişi; düzenleme ve geri alma.

### Kararlar ve Varsayılanlar
- **[Konumlar]** Ana/alt konumlar dinamik, serbest metin “raf/çekmece” önerileri (autocomplete) desteklenecek.
- **[Ölçü Birimi]** Malzeme kaydında kullanıcı belirler (serbest metin).
- **[Maliyet]** Gösterimde “son alınan fiyat” tercih, zorunlu alan değil; geçmiş fiyatlar tutulacak.
- **[Kritik Stok]** Global ve konum bazlı ayrı ayrı belirlenebilir.
- **[SKT/Lot]** Aynı malzemenin farklı SKT/lot’ları ayrı kaydedilebilir (lot bazlı stok).
- **[Uyarılar]** Kritik stok ve SKT yaklaşan kart/satır uyarıları (renkler projede belirlenecek).
- **[Yetki]** Şimdilik tek rol: admin; ileride RBAC için altyapı esnek bırakılacak.
- **[Tarih Formatı]** `DD.MM.YYYY`.

### Çalıştırma (Lokal)
- Backend: `cd server && npm run dev` → `http://localhost:3001/` (status: running)
- Frontend: `npm start` → `http://localhost:3000/depo-siparis`