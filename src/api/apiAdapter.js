/**
 * API Adaptörü
 * 
 * Bu modül, localStorage tabanlı veritabanı ile gerçek API arasında bir adaptör görevi görür.
 * Uygulama, bu adaptör üzerinden veri işlemlerini gerçekleştirir.
 * 
 * Gerçek API'ye geçiş yapmak için bu dosyayı düzenleyin ve USE_LOCAL_STORAGE değişkenini false yapın.
 */

import * as localDB from '../utils/localStorageDB';
import api from './apiClient';

// LocalStorage kullanımını kontrol eden bayrak
// Gerçek API'ye geçiş için bu değeri false yapın
const USE_LOCAL_STORAGE = true;

/**
 * Hasta API'si
 */
export const hastaAPI = {
  /**
   * Tüm hastaları getir
   * @returns {Promise<Array>} Hasta listesi
   */
  getHastalar: async () => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.getHastalar());
    } else {
      const response = await api.hastalar.getAll();
      return response.data;
    }
  },
  
  /**
   * Yeni hasta ekle
   * @param {Object} hasta - Hasta bilgileri
   * @returns {Promise<Object>} Eklenen hasta
   */
  addHasta: async (hasta) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.addHasta(hasta));
    } else {
      const response = await api.hastalar.create(hasta);
      return response.data;
    }
  },
  
  /**
   * Hasta bilgilerini güncelle
   * @param {string} id - Hasta ID'si
   * @param {Object} yeniVeriler - Güncellenecek veriler
   * @returns {Promise<Object>} Güncellenen hasta
   */
  updateHasta: async (id, yeniVeriler) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.updateHasta(id, yeniVeriler));
    } else {
      const response = await api.hastalar.update(id, yeniVeriler);
      return response.data;
    }
  },
  
  /**
   * Hasta sil
   * @param {string} id - Hasta ID'si
   * @returns {Promise<boolean>} İşlem başarılı ise true
   */
  deleteHasta: async (id) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.deleteHasta(id));
    } else {
      await api.hastalar.delete(id);
      return true;
    }
  },
  
  /**
   * Taksit ödemesi güncelle
   * @param {string} hastaId - Hasta ID'si
   * @param {string} taksitId - Taksit ID'si
   * @param {string} yeniDurum - Yeni ödeme durumu
   * @param {string} odemeSekli - Ödeme şekli
   * @returns {Promise<Object>} Güncellenen hasta
   */
  updateTaksitOdeme: async (hastaId, taksitId, yeniDurum, odemeSekli) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.updateTaksitOdeme(hastaId, taksitId, yeniDurum, odemeSekli));
    } else {
      const response = await api.taksitler.updateOdeme(hastaId, taksitId, {
        durum: yeniDurum,
        odemeSekli
      });
      return response.data;
    }
  }
};

/**
 * Kimlik doğrulama API'si
 */
export const authAPI = {
  /**
   * Kullanıcı girişi
   * @param {string} username - Kullanıcı adı
   * @param {string} password - Şifre
   * @returns {Promise<Object>} Kullanıcı bilgileri
   */
  login: async (username, password) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.authenticateUser(username, password));
    } else {
      const response = await api.auth.login({ username, password });
      // Token'ı localStorage'a kaydet
      if (response.token) {
        localStorage.setItem('auth_token', response.token);
      }
      return response.user;
    }
  },
  
  /**
   * Çıkış yap
   * @returns {Promise<boolean>} İşlem başarılı ise true
   */
  logout: async () => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(true);
    } else {
      await api.auth.logout();
      localStorage.removeItem('auth_token');
      return true;
    }
  }
};

/**
 * Yedekleme API'si
 */
export const backupAPI = {
  /**
   * Veritabanı yedeği al
   * @returns {Promise<Object>} Yedek verisi
   */
  exportDatabase: async () => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.exportDatabase());
    } else {
      const response = await api.yedekleme.export();
      return response.data;
    }
  },
  
  /**
   * Veritabanı yedeğini içe aktar
   * @param {Object} backupData - İçe aktarılacak yedek verisi
   * @returns {Promise<boolean>} İşlem başarılı ise true
   */
  importDatabase: async (backupData) => {
    if (USE_LOCAL_STORAGE) {
      return Promise.resolve(localDB.importDatabase(backupData));
    } else {
      const response = await api.yedekleme.import(backupData);
      return response.success;
    }
  }
};

export default {
  hastaAPI,
  authAPI,
  backupAPI
};


