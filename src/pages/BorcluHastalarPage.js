import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  Snackbar,
  FormHelperText,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import PaymentIcon from '@mui/icons-material/Payment';
import DeleteIcon from '@mui/icons-material/Delete';
import { useHasta } from '../context/HastaContext';

const BorcluHastalarPage = () => {
  const location = useLocation();
  const { 
    hastalar, 
    loading, 
    error, 
    yeniHastaEkle, 
    hastaGuncelle,
    hastaSil
  } = useHasta();

  const [filtrelenmisHastalar, setFiltrelenmisHastalar] = useState([]);
  const [aramaMetni, setAramaMetni] = useState('');
  const [siralama, setSiralama] = useState('sonOdemeTarihi');
  const [openDialog, setOpenDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sadeceBorcluGoster, setSadeceBorcluGoster] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    tcKimlikNo: '',
    isim: '',
    soyisim: '',
    telefon: '',
    islem: '',
    hekim: '',
    toplamTutar: '',
    kalanTutar: '',
    tedaviBaslangicTarihi: null,
    sonOdemeTarihi: null,
    odemeTipi: '',
    not: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // URL parametresinden dialog açma durumunu kontrol et
    if (location.state?.openNewPatientDialog) {
      setOpenDialog(true);
    }
  }, [location]);

  useEffect(() => {
    // Filtreleme ve sıralama işlemleri
    let sonuc = [...hastalar];
    
    // Sadece borçlu hastaları göster
    if (sadeceBorcluGoster) {
      sonuc = sonuc.filter(hasta => {
        // Borçlu hastaları göster (kalan tutarı 0'dan büyük olanlar)
        return hasta.kalanTutar && parseFloat(hasta.kalanTutar) > 0;
      });
    }
    
    // Arama metnine göre filtreleme
    if (aramaMetni) {
      const aramaMetniLower = aramaMetni.toLowerCase();
      sonuc = sonuc.filter(hasta => 
        hasta.tcKimlikNo?.includes(aramaMetniLower) || 
        hasta.isim?.toLowerCase().includes(aramaMetniLower) || 
        hasta.soyisim?.toLowerCase().includes(aramaMetniLower)
      );
    }
    
    // Sıralamaya göre sırala
    sonuc.sort((a, b) => {
      switch (siralama) {
        case 'sonOdemeTarihi':
          return new Date(b.sonOdemeTarihi || 0) - new Date(a.sonOdemeTarihi || 0);
        case 'kalanTutar':
          return b.kalanTutar - a.kalanTutar;
        case 'isimSoyisim':
          return (a.isim + a.soyisim).localeCompare(b.isim + b.soyisim);
        default:
          return 0;
      }
    });
    
    setFiltrelenmisHastalar(sonuc);
  }, [hastalar, aramaMetni, siralama, sadeceBorcluGoster]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (name, date) => {
    setFormData({
      ...formData,
      [name]: date
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.tcKimlikNo) {
      newErrors.tcKimlikNo = 'TC Kimlik No gereklidir';
    } else if (formData.tcKimlikNo.length !== 11) {
      newErrors.tcKimlikNo = 'TC Kimlik No 11 haneli olmalıdır';
    }
    
    if (!formData.isim) {
      newErrors.isim = 'İsim gereklidir';
    }
    
    if (!formData.soyisim) {
      newErrors.soyisim = 'Soyisim gereklidir';
    }
    
    if (!formData.telefon) {
      newErrors.telefon = 'Telefon gereklidir';
    }
    
    if (!formData.hekim) {
      newErrors.hekim = 'Hekim seçimi gereklidir';
    }
    
    if (!formData.toplamTutar) {
      newErrors.toplamTutar = 'Toplam tutar gereklidir';
    } else if (parseFloat(formData.toplamTutar) <= 0) {
      newErrors.toplamTutar = 'Toplam tutar 0\'dan büyük olmalıdır';
    }
    
    if (!formData.kalanTutar) {
      newErrors.kalanTutar = 'Kalan tutar gereklidir';
    } else if (parseFloat(formData.kalanTutar) < 0) {
      newErrors.kalanTutar = 'Kalan tutar negatif olamaz';
    } else if (parseFloat(formData.kalanTutar) > parseFloat(formData.toplamTutar)) {
      newErrors.kalanTutar = 'Kalan tutar toplam tutardan büyük olamaz';
    }
    
    if (!formData.tedaviBaslangicTarihi) {
      newErrors.tedaviBaslangicTarihi = 'Tedavi başlangıç tarihi gereklidir';
    }
    
    if (!formData.odemeTipi) {
      newErrors.odemeTipi = 'Ödeme tipi seçimi gereklidir';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleYeniHastaEkle = () => {
    if (!validateForm()) return;
    
    try {
      const yeniHasta = {
        ...formData,
        id: Date.now().toString(),
      };
      
      yeniHastaEkle(yeniHasta);
      
      setOpenDialog(false);
      setFormData({
        tcKimlikNo: '',
        isim: '',
        soyisim: '',
        telefon: '',
        islem: '',
        hekim: '',
        toplamTutar: '',
        kalanTutar: '',
        tedaviBaslangicTarihi: null,
        sonOdemeTarihi: null,
        odemeTipi: '',
        not: ''
      });
      
      setSnackbar({
        open: true,
        message: 'Yeni hasta başarıyla eklendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Hasta eklenirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleOdemeAl = (hastaId, miktar) => {
    try {
      const hasta = hastalar.find(h => h.id === hastaId);
      if (!hasta) return;
      
      const yeniKalanTutar = Math.max(0, parseFloat(hasta.kalanTutar) - parseFloat(miktar));
      
      const guncelHasta = {
        ...hasta,
        kalanTutar: yeniKalanTutar,
        sonOdemeTarihi: new Date()
      };
      
      hastaGuncelle(hastaId, guncelHasta);
      
      setSnackbar({
        open: true,
        message: 'Ödeme başarıyla kaydedildi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Ödeme kaydedilirken bir hata oluştu',
        severity: 'error'
      });
    }
  };

  const handleFiltreleriTemizle = () => {
    setAramaMetni('');
    setSiralama('sonOdemeTarihi');
  };

  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(tutar);
  };

  const formatTarih = (tarih) => {
    if (!tarih) return '-';
    return new Date(tarih).toLocaleDateString('tr-TR');
  };

  return (
    <Box>
      {loading ? (
        <Typography>Yükleniyor...</Typography>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h4" component="h1">
              Borcu Olan Hastalar
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
          
          <Paper sx={{ mb: 3, p: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <TextField
                placeholder="TC No, İsim veya Soyisim ile ara"
                value={aramaMetni}
                onChange={(e) => setAramaMetni(e.target.value)}
                sx={{ flexGrow: 1, minWidth: '200px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  endAdornment: aramaMetni ? (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setAramaMetni('')} size="small">
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
              />
              
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filtrele
              </Button>
              
              {(aramaMetni || siralama !== 'sonOdemeTarihi') && (
                <Button 
                  variant="text" 
                  onClick={handleFiltreleriTemizle}
                  startIcon={<ClearIcon />}
                >
                  Temizle
                </Button>
              )}
            </Box>
            
            {showFilters && (
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                <FormControl sx={{ minWidth: 200 }}>
                  <InputLabel>Sıralama</InputLabel>
                  <Select
                    value={siralama}
                    label="Sıralama"
                    onChange={(e) => setSiralama(e.target.value)}
                  >
                    <MenuItem value="sonOdemeTarihi">Son Ödeme Tarihi</MenuItem>
                    <MenuItem value="kalanTutar">Kalan Tutar</MenuItem>
                    <MenuItem value="isimSoyisim">İsim Soyisim</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={sadeceBorcluGoster}
                      onChange={(e) => setSadeceBorcluGoster(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={sadeceBorcluGoster ? "Sadece Borçlu Hastaları Gösteriliyor" : "Tüm Hastaları Göster"}
                  sx={{ ml: 2 }}
                />
              </Box>
            )}
          </Paper>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>TC Kimlik No</TableCell>
                  <TableCell>İsim Soyisim</TableCell>
                  <TableCell>Hekim</TableCell>
                  <TableCell>İşlem</TableCell>
                  <TableCell>Toplam Tutar</TableCell>
                  <TableCell>Kalan Tutar</TableCell>
                  <TableCell>Son Ödeme</TableCell>
                  <TableCell>İşlemler</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtrelenmisHastalar.length > 0 ? (
                  filtrelenmisHastalar.map((hasta) => (
                    <TableRow key={hasta.id}>
                      <TableCell>{hasta.tcKimlikNo}</TableCell>
                      <TableCell>{hasta.isim} {hasta.soyisim}</TableCell>
                      <TableCell>{hasta.hekim}</TableCell>
                      <TableCell>{hasta.islem}</TableCell>
                      <TableCell>{formatPara(hasta.toplamTutar)}</TableCell>
                      <TableCell>
                        <Typography 
                          sx={{ 
                            color: parseFloat(hasta.kalanTutar) > 0 ? 'error.main' : 'success.main',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatPara(hasta.kalanTutar)}
                        </Typography>
                      </TableCell>
                      <TableCell>{formatTarih(hasta.sonOdemeTarihi)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Ödeme Al">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => {
                                // Ödeme alma işlemi için dialog açılacak
                                // Şimdilik örnek bir ödeme alalım
                                const odemeAmount = prompt(`${hasta.isim} ${hasta.soyisim} için ödeme miktarı giriniz:`, hasta.kalanTutar);
                                if (odemeAmount !== null) {
                                  handleOdemeAl(hasta.id, odemeAmount);
                                }
                              }}
                            >
                              <PaymentIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Düzenle">
                            <IconButton 
                              color="info" 
                              size="small"
                              onClick={() => {
                                // Düzenleme işlemi için form doldurulacak
                                setFormData({
                                  ...hasta
                                });
                                setOpenDialog(true);
                              }}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Sil">
                            <IconButton 
                              color="error" 
                              size="small"
                              onClick={() => {
                                // Silme işlemi için onay al
                                if (window.confirm(`${hasta.isim} ${hasta.soyisim} isimli hastayı silmek istediğinize emin misiniz?`)) {
                                  hastaSil(hasta.id);
                                  setSnackbar({
                                    open: true,
                                    message: 'Hasta başarıyla silindi.',
                                    severity: 'success'
                                  });
                                }
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Typography variant="body1" sx={{ py: 2 }}>
                        Kayıtlı borçlu hasta bulunamadı
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filtrelenmisHastalar.length}
            rowsPerPage={10}
            page={0}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Sayfa başına satır:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
          
          {/* Yeni Hasta Girişi Dialog */}
          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: 2
              }
            }}
          >
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 'bold' }}>
              Yeni Borçlu Hasta Girişi
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
                    label="İşlem"
                    name="islem"
                    value={formData.islem}
                    onChange={handleInputChange}
                    error={!!errors.islem}
                    helperText={errors.islem}
                    InputProps={{
                      sx: { borderRadius: 2 }
                    }}
                    variant="outlined"
                    size="medium"
                    placeholder="Örn: Diş Dolgusu, Kanal Tedavisi, vb."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.hekim} required>
                    <InputLabel>Hekim</InputLabel>
                    <Select
                      name="hekim"
                      value={formData.hekim}
                      label="Hekim"
                      onChange={handleInputChange}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Emrecan Eren">Emrecan Eren</MenuItem>
                      <MenuItem value="Barkın Ergin">Barkın Ergin</MenuItem>
                      <MenuItem value="Mehmet Varyemez">Mehmet Varyemez</MenuItem>
                    </Select>
                    {errors.hekim && <FormHelperText>{errors.hekim}</FormHelperText>}
                  </FormControl>
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
                    label="Kalan Tutar"
                    name="kalanTutar"
                    type="number"
                    value={formData.kalanTutar}
                    onChange={handleInputChange}
                    error={!!errors.kalanTutar}
                    helperText={errors.kalanTutar || "Ödenmemiş kalan tutar"}
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
                  <DatePicker
                    label="Tedavi Başlangıç Tarihi"
                    value={formData.tedaviBaslangicTarihi}
                    onChange={(date) => handleDateChange('tedaviBaslangicTarihi', date)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        error: !!errors.tedaviBaslangicTarihi,
                        helperText: errors.tedaviBaslangicTarihi,
                        sx: { 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        },
                        required: true
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Son Ödeme Tarihi"
                    value={formData.sonOdemeTarihi}
                    onChange={(date) => handleDateChange('sonOdemeTarihi', date)}
                    slotProps={{ 
                      textField: { 
                        fullWidth: true, 
                        error: !!errors.sonOdemeTarihi,
                        helperText: errors.sonOdemeTarihi,
                        sx: { 
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2
                          }
                        }
                      } 
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.odemeTipi} required>
                    <InputLabel>Ödeme Tipi</InputLabel>
                    <Select
                      name="odemeTipi"
                      value={formData.odemeTipi}
                      label="Ödeme Tipi"
                      onChange={handleInputChange}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="Nakit">Nakit</MenuItem>
                      <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                      <MenuItem value="Havale/EFT">Havale/EFT</MenuItem>
                    </Select>
                    {errors.odemeTipi && <FormHelperText>{errors.odemeTipi}</FormHelperText>}
                  </FormControl>
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
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
                İptal
              </Button>
              <Button 
                onClick={handleYeniHastaEkle} 
                variant="contained"
                sx={{ borderRadius: 2 }}
              >
                Kaydet
              </Button>
            </DialogActions>
          </Dialog>
          
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

export default BorcluHastalarPage;
