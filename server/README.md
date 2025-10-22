# EE Yönetim - Backend API

Bu klasör, EE Yönetim sistemi için backend API kodlarını içerecektir.

## Teknolojiler

- Node.js
- Express
- PostgreSQL veya MongoDB (tercih edilecek)
- JWT kimlik doğrulama

## Kurulum

1. Node.js ve veritabanını kurun
2. Bağımlılıkları yükleyin: `npm install`
3. Çevre değişkenlerini ayarlayın: `.env` dosyasını oluşturun
4. Veritabanını oluşturun: `npm run db:setup`
5. Sunucuyu başlatın: `npm start`

## API Endpoint'leri

### Kimlik Doğrulama

- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/logout` - Çıkış yap
- `POST /api/auth/refresh-token` - Token yenileme

### Hasta Yönetimi

- `GET /api/hastalar` - Tüm hastaları listele
- `GET /api/hastalar/:id` - Belirli bir hastayı getir
- `POST /api/hastalar` - Yeni hasta ekle
- `PUT /api/hastalar/:id` - Hasta bilgilerini güncelle
- `DELETE /api/hastalar/:id` - Hasta sil

### Taksit Yönetimi

- `PUT /api/hastalar/:hastaId/taksitler/:taksitId` - Taksit bilgilerini güncelle
- `PUT /api/hastalar/:hastaId/taksitler/:taksitId/odeme` - Taksit ödemesi güncelle

### Kullanıcı Yönetimi

- `GET /api/kullanicilar` - Tüm kullanıcıları listele
- `GET /api/kullanicilar/:id` - Belirli bir kullanıcıyı getir
- `POST /api/kullanicilar` - Yeni kullanıcı ekle
- `PUT /api/kullanicilar/:id` - Kullanıcı bilgilerini güncelle
- `DELETE /api/kullanicilar/:id` - Kullanıcı sil

### Ayarlar

- `GET /api/ayarlar` - Ayarları getir
- `PUT /api/ayarlar` - Ayarları güncelle

### Yedekleme

- `GET /api/yedekleme/export` - Veritabanı yedeği al
- `POST /api/yedekleme/import` - Veritabanı yedeğini içe aktar

## Veritabanı Şeması

Veritabanı şeması için `src/api/dbSchema.js` dosyasına bakın.

## Geliştirme

Backend geliştirme için Express.js ve tercih edilen veritabanı (PostgreSQL veya MongoDB) kullanılacaktır. API, JWT tabanlı kimlik doğrulama ile korunacaktır.

## Üretim

Üretim ortamı için:

1. `.env.production` dosyasını ayarlayın
2. `npm run build` ile üretim sürümünü oluşturun
3. `npm run start:prod` ile sunucuyu başlatın

## Docker

Docker ile çalıştırmak için:

```bash
docker-compose up -d
```



