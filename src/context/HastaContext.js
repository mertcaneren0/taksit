import React, { createContext, useState, useContext, useEffect } from 'react';
import * as localDB from '../utils/localStorageDB';
import { updateHastaTaksitDurumlari } from '../utils/dateUtils';

const HastaContext = createContext(null);

export const HastaProvider = ({ children }) => {
  const [hastalar, setHastalar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hastaları yükle ve taksit durumlarını güncelle
  useEffect(() => {
    try {
      const hastaVerileri = localDB.getHastalar();
      
      // Tüm hastaların taksit durumlarını kontrol et ve güncelle
      const guncelHastalar = hastaVerileri.map(hasta => updateHastaTaksitDurumlari(hasta));
      
      setHastalar(guncelHastalar);
      setLoading(false);
    } catch (err) {
      setError('Hasta verileri yüklenirken bir hata oluştu.');
      setLoading(false);
    }
  }, []);

  // Yeni hasta ekle
  const yeniHastaEkle = (hastaVerileri) => {
    try {
      const yeniHasta = localDB.addHasta(hastaVerileri);
      setHastalar([...hastalar, yeniHasta]);
      return yeniHasta;
    } catch (err) {
      setError('Hasta eklenirken bir hata oluştu.');
      throw err;
    }
  };

  // Hasta güncelle
  const hastaGuncelle = (id, yeniVeriler) => {
    try {
      const guncelHasta = localDB.updateHasta(id, yeniVeriler);
      
      if (guncelHasta) {
        setHastalar(hastalar.map(hasta => 
          hasta.id === id ? guncelHasta : hasta
        ));
        return guncelHasta;
      }
      
      setError(`ID: ${id} olan hasta bulunamadı.`);
      return null;
    } catch (err) {
      setError('Hasta güncellenirken bir hata oluştu.');
      throw err;
    }
  };

  // Taksit ödemesi güncelle
  const taksitOdemeGuncelle = (hastaId, taksitId, yeniDurum, odemeSekli) => {
    try {
      const guncelHasta = localDB.updateTaksitOdeme(hastaId, taksitId, yeniDurum, odemeSekli);
      
      if (guncelHasta) {
        setHastalar(hastalar.map(hasta => 
          hasta.id === hastaId ? guncelHasta : hasta
        ));
        return guncelHasta;
      }
      
      setError(`Hasta veya taksit bulunamadı.`);
      return null;
    } catch (err) {
      setError('Taksit ödemesi güncellenirken bir hata oluştu.');
      throw err;
    }
  };

  // Veritabanı yedeği al
  const veritabaniYedegiAl = () => {
    try {
      const yedek = localDB.exportDatabase();
      return yedek;
    } catch (err) {
      setError('Veritabanı yedeği alınırken bir hata oluştu.');
      throw err;
    }
  };

  // Veritabanı yedeğini içe aktar
  const veritabaniYedegiYukle = (yedekVerisi) => {
    try {
      const sonuc = localDB.importDatabase(yedekVerisi);
      
      if (sonuc) {
        // Güncel verileri yeniden yükle
        const guncelHastalar = localDB.getHastalar();
        setHastalar(guncelHastalar);
      }
      
      return sonuc;
    } catch (err) {
      setError('Veritabanı yedeği içe aktarılırken bir hata oluştu.');
      throw err;
    }
  };

  // Hata mesajını temizle
  const hataTemizle = () => {
    setError(null);
  };

  // Hasta sil
  const hastaSil = (id) => {
    try {
      const sonuc = localDB.deleteHasta(id);
      
      if (sonuc) {
        setHastalar(hastalar.filter(hasta => hasta.id !== id));
        return true;
      }
      
      setError(`ID: ${id} olan hasta bulunamadı.`);
      return false;
    } catch (err) {
      setError('Hasta silinirken bir hata oluştu.');
      throw err;
    }
  };

  const value = {
    hastalar,
    loading,
    error,
    yeniHastaEkle,
    hastaGuncelle,
    taksitOdemeGuncelle,
    hastaSil,
    veritabaniYedegiAl,
    veritabaniYedegiYukle,
    hataTemizle
  };

  return <HastaContext.Provider value={value}>{children}</HastaContext.Provider>;
};

export const useHasta = () => {
  const context = useContext(HastaContext);
  if (context === null) {
    throw new Error('useHasta must be used within a HastaProvider');
  }
  return context;
};
