import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import HastaListesi from '../components/taksitli/HastaListesi';
import YeniHastaDialog from '../components/taksitli/YeniHastaDialog';
import { useHasta } from '../context/HastaContext';
import DeleteIcon from '@mui/icons-material/Delete';

const TaksitliHastalarPage = () => {
  const location = useLocation();
  const { 
    hastalar, 
    loading, 
    error, 
    yeniHastaEkle, 
    taksitOdemeGuncelle, 
    hastaSil,
    hataTemizle 
  } = useHasta();
  const [filtrelenmisHastalar, setFiltrelenmisHastalar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [baslangicTarihi, setBaslangicTarihi] = useState(null);
  const [bitisTarihi, setBitisTarihi] = useState(null);
  const [siralama, setSiralama] = useState('vadeTarihi');
  const [openDialog, setOpenDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [odemeDurumu, setOdemeDurumu] = useState('tumu');

  useEffect(() => {
    // URL parametresinden dialog açma durumunu kontrol et
    if (location.state?.openNewPatientDialog) {
      setOpenDialog(true);
    }
  }, [location]);

  // Tarih filtreleri için hazır seçenekler
  const tarihFiltreleri = [
    { id: 'bugun', label: 'Bugün', daysRange: 0 },
    { id: 'buHafta', label: 'Bu Hafta', daysRange: 7 },
    { id: 'buAy', label: 'Bu Ay', daysRange: 30 },
    { id: 'gelecek30Gun', label: 'Gelecek 30 Gün', daysRange: 30, future: true },
    { id: 'gecikmisTaksitler', label: 'Gecikmiş Taksitler', overdue: true },
    { id: 'ozel', label: 'Özel Tarih Aralığı', custom: true }
  ];
  
  const [secilenTarihFiltresi, setSecilenTarihFiltresi] = useState(null);

  // Tarih filtresi seçildiğinde başlangıç ve bitiş tarihlerini ayarla
  const handleTarihFiltresiDegistir = (filtreId) => {
    const filtre = tarihFiltreleri.find(f => f.id === filtreId);
    setSecilenTarihFiltresi(filtreId);
    
    if (!filtre) {
      setBaslangicTarihi(null);
      setBitisTarihi(null);
      setOdemeDurumu('tumu');
      return;
    }
    
    if (filtre.custom) {
      // Özel tarih aralığı seçildiğinde mevcut tarihleri koru
      return;
    }
    
    // Gecikmiş taksitler seçildiğinde
    if (filtre.overdue) {
      setBaslangicTarihi(null);
      setBitisTarihi(null);
      setOdemeDurumu('gecikti');
      return;
    }
    
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);
    
    // Diğer filtrelerde ödeme durumunu sıfırla
    setOdemeDurumu('tumu');
    
    if (filtre.future) {
      // Gelecek günler
      setBaslangicTarihi(bugun);
      const bitisTarih = new Date(bugun);
      bitisTarih.setDate(bitisTarih.getDate() + filtre.daysRange);
      setBitisTarihi(bitisTarih);
    } else if (filtre.daysRange === 0) {
      // Bugün
      setBaslangicTarihi(bugun);
      setBitisTarihi(bugun);
    } else {
      // Geçmiş günler (Bu hafta/Bu ay)
      setBaslangicTarihi(new Date(bugun.getTime() - (filtre.daysRange * 24 * 60 * 60 * 1000)));
      setBitisTarihi(bugun);
    }
  };

  useEffect(() => {
    // Filtreleme ve sıralama işlemleri
    let sonuc = [...hastalar];

    // Arama metni filtreleme
    if (aramaMetni) {
      const aramaLowerCase = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(
        (hasta) =>
          hasta.tcKimlikNo.includes(aramaMetni) ||
          hasta.isim.toLowerCase().includes(aramaLowerCase) ||
          hasta.soyisim.toLowerCase().includes(aramaLowerCase)
      );
    }

    // Tarih aralığı filtreleme
    if (baslangicTarihi && bitisTarihi) {
      // Bitiş tarihine gün sonunu ekleyelim (23:59:59)
      const bitisTarihiSonu = new Date(bitisTarihi);
      bitisTarihiSonu.setHours(23, 59, 59, 999);
      
      sonuc = sonuc.filter((hasta) => {
        return hasta.taksitler && hasta.taksitler.some(taksit => {
          const taksitTarihi = new Date(taksit.tarih);
          return taksitTarihi >= baslangicTarihi && taksitTarihi <= bitisTarihiSonu;
        });
      });
    }

    // Ödeme durumu filtreleme
    if (odemeDurumu !== 'tumu') {
      sonuc = sonuc.filter((hasta) => {
        if (!hasta.taksitler) return false;
        
        if (odemeDurumu === 'gecikti') {
          return hasta.taksitler.some(t => t.durum === 'Gecikti');
        } else if (odemeDurumu === 'odenmedi') {
          return hasta.taksitler.some(t => t.durum === 'Ödenmedi');
        } else if (odemeDurumu === 'odendi') {
          // Tüm taksitleri ödenmiş olanlar
          return hasta.taksitler.every(t => t.durum === 'Ödendi');
        }
        return true;
      });
    }

    // Sıralama
    sonuc.sort((a, b) => {
      if (siralama === 'vadeTarihi') {
        // En yakın vadesi gelen taksiti bul
        if (!a.taksitler || !b.taksitler) return 0;
        
        const aTaksit = a.taksitler.find(t => t.durum === 'Ödenmedi' || t.durum === 'Gecikti');
        const bTaksit = b.taksitler.find(t => t.durum === 'Ödenmedi' || t.durum === 'Gecikti');
        
        if (!aTaksit) return 1;
        if (!bTaksit) return -1;
        
        return new Date(aTaksit.tarih) - new Date(bTaksit.tarih);
      } else if (siralama === 'isim') {
        return a.isim.localeCompare(b.isim);
      } else if (siralama === 'kalanTutar') {
        return b.kalanTutar - a.kalanTutar;
      }
      return 0;
    });

    setFiltrelenmisHastalar(sonuc);
  }, [hastalar, aramaMetni, baslangicTarihi, bitisTarihi, siralama, odemeDurumu]);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleYeniHastaEkle = (yeniHasta) => {
    try {
      yeniHastaEkle(yeniHasta);
      setOpenDialog(false);
      setSnackbar({
        open: true,
        message: 'Yeni hasta başarıyla eklendi.',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Hasta eklenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  const handleTaksitOdemeGuncelle = (hastaId, taksitId, yeniDurum, odemeSekli) => {
    try {
      taksitOdemeGuncelle(hastaId, taksitId, yeniDurum, odemeSekli);
      setSnackbar({
        open: true,
        message: 'Taksit ödemesi başarıyla güncellendi.',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Taksit ödemesi güncellenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };
  
  const handleTaksitDuzenle = (hastaId, taksitId, yeniTutar) => {
    try {
      // Burada taksit tutarını güncelleyecek fonksiyon çağrılacak
      // Şimdilik örnek olarak başarılı mesajı gösterelim
      setSnackbar({
        open: true,
        message: 'Taksit tutarı başarıyla güncellendi.',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Taksit tutarı güncellenirken bir hata oluştu.',
        severity: 'error'
      });
    }
  };

  const handleFiltreleriTemizle = () => {
    setAramaMetni('');
    setBaslangicTarihi(null);
    setBitisTarihi(null);
    setOdemeDurumu('tumu');
    setSiralama('vadeTarihi');
    setSecilenTarihFiltresi(null);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
    if (error) {
      hataTemizle();
    }
  };

  return (
    <Box>
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h1">
              Taksitli Hastalar
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Yeni Hasta Gir
            </Button>
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6} lg={4}>
            <TextField
              fullWidth
              label="TC Kimlik No / İsim / Soyisim"
              value={aramaMetni}
              onChange={(e) => setAramaMetni(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: aramaMetni && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setAramaMetni('')} edge="end" size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sıralama</InputLabel>
              <Select
                value={siralama}
                label="Sıralama"
                onChange={(e) => setSiralama(e.target.value)}
              >
                <MenuItem value="vadeTarihi">Vade Tarihi (En yakın)</MenuItem>
                <MenuItem value="isim">İsim (A-Z)</MenuItem>
                <MenuItem value="kalanTutar">Kalan Tutar (Yüksek-Düşük)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3} md={2} lg={2}>
            <Button
              fullWidth
              variant={showFilters ? "contained" : "outlined"}
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              size="medium"
              sx={{ height: '40px' }}
            >
              Filtreler {filtrelenmisHastalar.length !== hastalar.length && `(${filtrelenmisHastalar.length})`}
            </Button>
          </Grid>
          <Grid item xs={6} sm={3} md={1} lg={2}>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={handleFiltreleriTemizle}
              disabled={!aramaMetni && !baslangicTarihi && !bitisTarihi && odemeDurumu === 'tumu'}
              size="medium"
              sx={{ height: '40px' }}
            >
              Temizle
            </Button>
          </Grid>
        </Grid>

        {showFilters && (
          <>
            {/* Tarih filtreleri için hızlı seçenekler */}
            <Box sx={{ mt: 2, mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tarihFiltreleri.map((filtre) => (
                <Chip
                  key={filtre.id}
                  label={filtre.label}
                  onClick={() => handleTarihFiltresiDegistir(filtre.id)}
                  color={secilenTarihFiltresi === filtre.id ? "primary" : "default"}
                  variant={secilenTarihFiltresi === filtre.id ? "filled" : "outlined"}
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {(secilenTarihFiltresi === 'ozel' || !secilenTarihFiltresi) && (
                <>
                  <Grid item xs={12} sm={6} md={4}>
                    <DatePicker
                      label="Başlangıç Tarihi"
                      value={baslangicTarihi}
                      onChange={(newDate) => {
                        setBaslangicTarihi(newDate);
                        setSecilenTarihFiltresi('ozel');
                      }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          size: "small",
                          helperText: "Taksit tarihi bu tarihten sonra olanlar" 
                        } 
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <DatePicker
                      label="Bitiş Tarihi"
                      value={bitisTarihi}
                      onChange={(newDate) => {
                        setBitisTarihi(newDate);
                        setSecilenTarihFiltresi('ozel');
                      }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true, 
                          size: "small",
                          helperText: "Taksit tarihi bu tarihten önce olanlar"
                        } 
                      }}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ödeme Durumu</InputLabel>
                  <Select
                    value={odemeDurumu}
                    label="Ödeme Durumu"
                    onChange={(e) => setOdemeDurumu(e.target.value)}
                  >
                    <MenuItem value="tumu">Tümü</MenuItem>
                    <MenuItem value="odenmedi">Ödenmemiş Taksiti Olanlar</MenuItem>
                    <MenuItem value="gecikti">Gecikmiş Taksiti Olanlar</MenuItem>
                    <MenuItem value="odendi">Tamamı Ödenmiş</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </>
        )}
      </Paper>

      <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {odemeDurumu !== 'tumu' && (
          <Chip 
            label={`Ödeme Durumu: ${
              odemeDurumu === 'odenmedi' ? 'Ödenmemiş' : 
              odemeDurumu === 'gecikti' ? 'Gecikmiş' : 
              odemeDurumu === 'odendi' ? 'Ödenmiş' : ''
            }`} 
            onDelete={() => setOdemeDurumu('tumu')} 
            color="primary" 
          />
        )}
        {baslangicTarihi && bitisTarihi && (
          <Chip 
            label={`Tarih: ${baslangicTarihi.toLocaleDateString('tr-TR')} - ${bitisTarihi.toLocaleDateString('tr-TR')}`} 
            onDelete={() => {
              setBaslangicTarihi(null);
              setBitisTarihi(null);
            }} 
            color="primary" 
          />
        )}
        {aramaMetni && (
          <Chip 
            label={`Arama: ${aramaMetni}`} 
            onDelete={() => setAramaMetni('')} 
            color="primary" 
          />
        )}
      </Box>

      <HastaListesi 
        hastalar={filtrelenmisHastalar} 
        onTaksitOdemeGuncelle={handleTaksitOdemeGuncelle}
        onTaksitDuzenle={handleTaksitDuzenle}
        onHastaSil={(hastaId) => {
          if (hastaSil(hastaId)) {
            setSnackbar({
              open: true,
              message: 'Hasta başarıyla silindi.',
              severity: 'success'
            });
          }
        }}
      />

      <YeniHastaDialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        onSave={handleYeniHastaEkle} 
      />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
};

export default TaksitliHastalarPage;
