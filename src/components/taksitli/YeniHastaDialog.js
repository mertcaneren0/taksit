import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Box,
  FormHelperText,
  IconButton,
  Paper
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

const YeniHastaDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    tcKimlikNo: '',
    isim: '',
    soyisim: '',
    telefon: '',
    toplamTutar: '',
    taksitSayisi: '',
    not: ''
  });

  const [taksitler, setTaksitler] = useState([]);
  const [errors, setErrors] = useState({});

  // Form verisi değiştiğinde taksitleri güncelle
  useEffect(() => {
    if (formData.toplamTutar && formData.taksitSayisi) {
      const toplamTutar = parseFloat(formData.toplamTutar);
      const taksitSayisi = parseInt(formData.taksitSayisi);
      
      if (!isNaN(toplamTutar) && !isNaN(taksitSayisi) && taksitSayisi > 0) {
        // Taksit tutarını hesapla (eşit dağılım)
        const taksitTutari = toplamTutar / taksitSayisi;
        
        // Mevcut taksit sayısı ile istenen taksit sayısını karşılaştır
        if (taksitler.length !== taksitSayisi) {
          const yeniTaksitler = [];
          
          for (let i = 0; i < taksitSayisi; i++) {
            // Mevcut taksit varsa bilgilerini koru, yoksa yeni oluştur
            const mevcutTaksit = taksitler[i];
            const tarih = mevcutTaksit?.tarih || new Date(new Date().setMonth(new Date().getMonth() + i + 1));
            
            // Mevcut taksit tutarını koru veya yeni hesapla
            let tutar;
            if (mevcutTaksit && mevcutTaksit.tutar) {
              tutar = mevcutTaksit.tutar;
            } else {
              // Eşit taksitler oluştur, son taksit için küsüratı ekle
              tutar = i === taksitSayisi - 1 
                ? parseFloat((toplamTutar - (taksitTutari * (taksitSayisi - 1))).toFixed(2))
                : parseFloat(taksitTutari.toFixed(2));
            }
            
            yeniTaksitler.push({
              id: i + 1,
              tutar: tutar,
              tarih,
              durum: 'Ödenmedi',
              odemeSekli: null
            });
          }
          
          setTaksitler(yeniTaksitler);
        }
      }
    }
  }, [formData.toplamTutar, formData.taksitSayisi]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Hata durumunu temizle
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleTaksitTarihChange = (index, newDate) => {
    const yeniTaksitler = [...taksitler];
    yeniTaksitler[index] = {
      ...yeniTaksitler[index],
      tarih: newDate
    };
    setTaksitler(yeniTaksitler);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // TC Kimlik No kontrolü (11 haneli olmalı)
    if (!formData.tcKimlikNo || formData.tcKimlikNo.length !== 11) {
      newErrors.tcKimlikNo = 'TC Kimlik No 11 haneli olmalıdır';
    }
    
    // İsim kontrolü
    if (!formData.isim.trim()) {
      newErrors.isim = 'İsim gereklidir';
    }
    
    // Soyisim kontrolü
    if (!formData.soyisim.trim()) {
      newErrors.soyisim = 'Soyisim gereklidir';
    }
    
    // Telefon kontrolü
    if (!formData.telefon || formData.telefon.length < 10) {
      newErrors.telefon = 'Geçerli bir telefon numarası giriniz';
    }
    
    // Toplam tutar kontrolü
    if (!formData.toplamTutar || parseFloat(formData.toplamTutar) <= 0) {
      newErrors.toplamTutar = 'Geçerli bir tutar giriniz';
    }
    
    // Taksit sayısı kontrolü
    if (!formData.taksitSayisi || parseInt(formData.taksitSayisi) <= 0) {
      newErrors.taksitSayisi = 'Geçerli bir taksit sayısı giriniz';
    }
    
    // Taksit tarihleri kontrolü
    let tarihHatasi = false;
    let tutarHatasi = false;
    let toplamTaksitTutari = 0;
    
    taksitler.forEach((taksit, index) => {
      if (!taksit.tarih) {
        tarihHatasi = true;
      }
      
      if (taksit.tutar <= 0) {
        tutarHatasi = true;
      }
      
      toplamTaksitTutari += taksit.tutar;
    });
    
    if (tarihHatasi) {
      newErrors.taksitTarihleri = 'Tüm taksit tarihleri girilmelidir';
    }
    
    if (tutarHatasi) {
      newErrors.taksitTutarlari = 'Tüm taksit tutarları sıfırdan büyük olmalıdır';
    }
    
    // Toplam tutar kontrolü
    const toplamTutar = parseFloat(formData.toplamTutar);
    if (Math.abs(toplamTaksitTutari - toplamTutar) > 0.01) {
      newErrors.taksitToplamTutari = `Taksit tutarları toplamı (${toplamTaksitTutari.toFixed(2)} TL) toplam tedavi tutarına (${toplamTutar.toFixed(2)} TL) eşit olmalıdır`;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const yeniHasta = {
        id: Date.now(), // Gerçek uygulamada backend tarafından oluşturulacak
        tcKimlikNo: formData.tcKimlikNo,
        isim: formData.isim,
        soyisim: formData.soyisim,
        telefon: formData.telefon,
        toplamTutar: parseFloat(formData.toplamTutar),
        kalanTutar: parseFloat(formData.toplamTutar), // Başlangıçta kalan tutar toplam tutara eşit
        taksitSayisi: parseInt(formData.taksitSayisi),
        taksitler,
        not: formData.not
      };
      
      onSave(yeniHasta);
      handleReset();
    }
  };

  const handleReset = () => {
    setFormData({
      tcKimlikNo: '',
      isim: '',
      soyisim: '',
      telefon: '',
      toplamTutar: '',
      taksitSayisi: '',
      not: ''
    });
    setTaksitler([]);
    setErrors({});
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Para birimi formatı
  const formatPara = (tutar) => {
    if (!tutar) return '';
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(tutar);
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 3
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'primary.main', 
        color: 'white',
        fontWeight: 'bold',
        pb: 1
      }}>
        Yeni Hasta Girişi
      </DialogTitle>
      <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 }, mt: 1 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ 
              bgcolor: 'primary.light', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 1,
              mb: 2
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Hasta Bilgileri
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="TC Kimlik No"
              name="tcKimlikNo"
              value={formData.tcKimlikNo}
              onChange={handleInputChange}
              error={!!errors.tcKimlikNo}
              helperText={errors.tcKimlikNo || "11 haneli TC Kimlik No giriniz"}
              inputProps={{ maxLength: 11 }}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Telefon"
              name="telefon"
              value={formData.telefon}
              onChange={handleInputChange}
              error={!!errors.telefon}
              helperText={errors.telefon || "Başında 0 olmadan giriniz (5XX XXX XX XX)"}
              placeholder="5XX XXX XX XX"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="İsim"
              name="isim"
              value={formData.isim}
              onChange={handleInputChange}
              error={!!errors.isim}
              helperText={errors.isim}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Soyisim"
              name="soyisim"
              value={formData.soyisim}
              onChange={handleInputChange}
              error={!!errors.soyisim}
              helperText={errors.soyisim}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <Box sx={{ 
              bgcolor: 'secondary.light', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 1,
              mb: 2,
              mt: 2
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Tedavi ve Ödeme Bilgileri
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Toplam Tedavi Tutarı"
              name="toplamTutar"
              type="number"
              value={formData.toplamTutar}
              onChange={handleInputChange}
              error={!!errors.toplamTutar}
              helperText={errors.toplamTutar || "Tedavi için alınacak toplam tutar"}
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Taksit Sayısı"
              name="taksitSayisi"
              type="number"
              value={formData.taksitSayisi}
              onChange={handleInputChange}
              error={!!errors.taksitSayisi}
              helperText={errors.taksitSayisi || "Ödeme kaç taksite bölünecek"}
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Not"
              name="not"
              value={formData.not}
              onChange={handleInputChange}
              multiline
              rows={3}
              placeholder="Hasta ile ilgili ek bilgiler veya notlar..."
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              variant="outlined"
              size="medium"
            />
          </Grid>
          
              {taksitler.length > 0 && (
            <>
              <Grid item xs={12}>
                <Box sx={{ 
                  bgcolor: 'info.light', 
                  color: 'white', 
                  p: 1.5, 
                  borderRadius: 1,
                  mb: 2,
                  mt: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Taksit Bilgileri
                  </Typography>
                  <Typography variant="subtitle2">
                    Toplam {taksitler.length} Taksit
                  </Typography>
                </Box>
                
                {(errors.taksitTarihleri || errors.taksitTutarlari || errors.taksitToplamTutari) && (
                  <Box sx={{ bgcolor: 'error.light', color: 'white', p: 2, borderRadius: 1, mb: 2 }}>
                    {errors.taksitTarihleri && (
                      <Typography variant="body2" sx={{ mb: 1 }}>{errors.taksitTarihleri}</Typography>
                    )}
                    {errors.taksitTutarlari && (
                      <Typography variant="body2" sx={{ mb: 1 }}>{errors.taksitTutarlari}</Typography>
                    )}
                    {errors.taksitToplamTutari && (
                      <Typography variant="body2">{errors.taksitToplamTutari}</Typography>
                    )}
                  </Box>
                )}
              </Grid>
              
              {taksitler.map((taksit, index) => (
                <Grid item xs={12} key={index}>
                  <Paper sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    boxShadow: 1, 
                    bgcolor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'white',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ 
                          bgcolor: 'info.main', 
                          color: 'white', 
                          p: 1, 
                          borderRadius: 1,
                          textAlign: 'center',
                          fontWeight: 'bold'
                        }}>
                          {index + 1}. Taksit
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Tutar"
                          type="number"
                          fullWidth
                          value={taksit.tutar}
                          onChange={(e) => {
                            const yeniTutar = parseFloat(e.target.value) || 0;
                            const yeniTaksitler = [...taksitler];
                            yeniTaksitler[index] = {
                              ...yeniTaksitler[index],
                              tutar: yeniTutar
                            };
                            
                            // Toplam tutarı güncelle (opsiyonel)
                            // const yeniToplamTutar = yeniTaksitler.reduce((toplam, t) => toplam + t.tutar, 0);
                            // setFormData({...formData, toplamTutar: yeniToplamTutar.toString()});
                            
                            setTaksitler(yeniTaksitler);
                          }}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                          }}
                          sx={{ bgcolor: 'white' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <DatePicker
                          label={`Vade Tarihi`}
                          value={taksit.tarih}
                          onChange={(newDate) => handleTaksitTarihChange(index, newDate)}
                          slotProps={{ 
                            textField: { 
                              fullWidth: true, 
                              sx: { bgcolor: 'white' } 
                            } 
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              ))}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee' }}>
        <Button 
          onClick={handleClose}
          sx={{ borderRadius: 1 }}
        >
          İptal
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          sx={{ 
            borderRadius: 1,
            px: 3
          }}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default YeniHastaDialog;
