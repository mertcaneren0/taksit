import React, { useState } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Tooltip,
  Button,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import WarningIcon from '@mui/icons-material/Warning';
import PendingIcon from '@mui/icons-material/Pending';
import DeleteIcon from '@mui/icons-material/Delete';

const HastaListesi = ({ hastalar, onTaksitOdemeGuncelle, onTaksitDuzenle, onHastaSil }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [expandedRows, setExpandedRows] = useState({});
  const [odemeDialogOpen, setOdemeDialogOpen] = useState(false);
  const [duzenleDialogOpen, setDuzenleDialogOpen] = useState(false);
  const [secilenTaksit, setSecilenTaksit] = useState(null);
  const [odemeSekli, setOdemeSekli] = useState('');
  const [yeniTaksitTutari, setYeniTaksitTutari] = useState('');

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRowExpansion = (id) => {
    setExpandedRows({
      ...expandedRows,
      [id]: !expandedRows[id]
    });
  };

  const handleOdemeDialogOpen = (hasta, taksit) => {
    setSecilenTaksit({ hasta, taksit });
    setOdemeSekli('');
    setOdemeDialogOpen(true);
  };

  const handleTaksitDuzenle = (hasta, taksit) => {
    setSecilenTaksit({ hasta, taksit });
    setYeniTaksitTutari(taksit.tutar.toString());
    setDuzenleDialogOpen(true);
  };

  const handleOdemeOnay = () => {
    if (secilenTaksit && odemeSekli) {
      onTaksitOdemeGuncelle(
        secilenTaksit.hasta.id,
        secilenTaksit.taksit.id,
        'Ödendi',
        odemeSekli
      );
      setOdemeDialogOpen(false);
    }
  };
  
  const handleDuzenleOnay = () => {
    if (secilenTaksit && yeniTaksitTutari) {
      const yeniTutar = parseFloat(yeniTaksitTutari);
      if (!isNaN(yeniTutar) && yeniTutar > 0) {
        onTaksitDuzenle(
          secilenTaksit.hasta.id,
          secilenTaksit.taksit.id,
          yeniTutar
        );
        setDuzenleDialogOpen(false);
      }
    }
  };

  // Ödeme durumuna göre renk ve simge belirleme
  const getDurumRenk = (durum) => {
    if (!durum) return { color: 'default', icon: <PendingIcon /> };
    
    switch (durum) {
      case 'Ödendi':
        return { color: 'success', icon: <CheckCircleIcon /> };
      case 'Gecikti':
        return { color: 'error', icon: <WarningIcon /> };
      case 'Ödenmedi':
        return { color: 'default', icon: <PendingIcon /> };
      default:
        return { color: 'default', icon: <PendingIcon /> };
    }
  };

  // Tarih formatını düzenleme
  const formatTarih = (date) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Para birimi formatı
  const formatPara = (tutar) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(tutar);
  };

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden', boxShadow: 2 }}>
        <Table sx={{ minWidth: 650 }} size="medium">
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell padding="checkbox" sx={{ color: 'white' }}></TableCell>
              <TableCell sx={{ color: 'white' }}>TC Kimlik No</TableCell>
              <TableCell sx={{ color: 'white' }}>İsim Soyisim</TableCell>
              <TableCell sx={{ color: 'white', display: { xs: 'none', md: 'table-cell' } }}>Telefon</TableCell>
              <TableCell align="right" sx={{ color: 'white', display: { xs: 'none', sm: 'table-cell' } }}>Toplam Tutar</TableCell>
              <TableCell align="right" sx={{ color: 'white' }}>Kalan Tutar</TableCell>
              <TableCell sx={{ color: 'white', display: { xs: 'none', lg: 'table-cell' } }}>Taksit Sayısı</TableCell>
              <TableCell sx={{ color: 'white' }}>Sonraki Ödeme</TableCell>
              <TableCell sx={{ color: 'white' }}>Durum</TableCell>
              <TableCell sx={{ color: 'white' }}>İşlem</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {hastalar.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((hasta) => {
              // Taksitler kontrolü
              if (!hasta.taksitler || !Array.isArray(hasta.taksitler)) {
                return null;
              }
              
              // Sonraki ödeme bilgisini hesapla
              const sonrakiOdeme = hasta.taksitler.find(t => t && (t.durum === 'Ödenmedi' || t.durum === 'Gecikti'));
              
              // Genel durum bilgisini hesapla
              let genelDurum = 'Ödendi';
              if (hasta.taksitler.some(t => t && t.durum === 'Gecikti')) {
                genelDurum = 'Gecikti';
              } else if (hasta.taksitler.some(t => t && t.durum === 'Ödenmedi')) {
                genelDurum = 'Ödenmedi';
              }
              
              const durumBilgisi = getDurumRenk(genelDurum);
              
              return (
                <React.Fragment key={hasta.id}>
                  <TableRow 
                    hover 
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      },
                      cursor: 'pointer'
                    }}
                    onClick={() => toggleRowExpansion(hasta.id)}
                  >
                    <TableCell padding="checkbox">
                      <IconButton size="small">
                        {expandedRows[hasta.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{hasta.tcKimlikNo}</TableCell>
                    <TableCell>
                      <Box sx={{ fontWeight: 500 }}>
                        {hasta.isim} {hasta.soyisim}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{hasta.telefon}</TableCell>
                    <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatPara(hasta.toplamTutar)}</TableCell>
                    <TableCell align="right">{formatPara(hasta.kalanTutar)}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{hasta.taksitSayisi}</TableCell>
                    <TableCell>
                      {sonrakiOdeme ? formatTarih(sonrakiOdeme.tarih) : 'Tamamlandı'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        icon={durumBilgisi.icon} 
                        label={genelDurum} 
                        color={durumBilgisi.color} 
                        size="small" 
                        sx={{ borderRadius: 1, fontWeight: 500 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Hastayı Sil">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`${hasta.isim} ${hasta.soyisim} isimli hastayı silmek istediğinize emin misiniz?`)) {
                              onHastaSil(hasta.id);
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {expandedRows[hasta.id] && (
                    <TableRow>
                      <TableCell colSpan={10} sx={{ py: 0 }}>
                        <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: 'rgba(245, 245, 245, 0.8)', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            <Box component="span" sx={{ fontWeight: 'bold' }}>Not:</Box> {hasta.not || 'Not bulunmuyor'}
                          </Typography>
                          
                          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1, fontWeight: 'bold', color: 'primary.main' }}>
                            Taksit Bilgileri:
                          </Typography>
                          
                          <Box sx={{ overflowX: 'auto' }}>
                            <Table size="small" sx={{ 
                              '& .MuiTableCell-root': { 
                                py: { xs: 1, sm: 1.5 },
                                px: { xs: 1, sm: 2 }
                              }
                            }}>
                              <TableHead sx={{ bgcolor: 'primary.light' }}>
                                <TableRow>
                                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Taksit No</TableCell>
                                  <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Tutar</TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Vade Tarihi</TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Durum</TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ödeme Şekli</TableCell>
                                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>İşlem</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {hasta.taksitler && hasta.taksitler.map((taksit) => {
                                  if (!taksit) return null;
                                  const taksitDurum = getDurumRenk(taksit.durum);
                                  
                                  return (
                                    <TableRow key={taksit.id} sx={{
                                      bgcolor: taksit.durum === 'Ödendi' ? 'rgba(76, 175, 80, 0.04)' : 
                                              taksit.durum === 'Gecikti' ? 'rgba(244, 67, 54, 0.04)' : 'inherit'
                                    }}>
                                      <TableCell>{taksit.id}</TableCell>
                                      <TableCell align="right" sx={{ fontWeight: 500 }}>{formatPara(taksit.tutar)}</TableCell>
                                      <TableCell>{formatTarih(taksit.tarih)}</TableCell>
                                      <TableCell>
                                        <Chip 
                                          icon={taksitDurum.icon} 
                                          label={taksit.durum} 
                                          color={taksitDurum.color} 
                                          size="small" 
                                          sx={{ borderRadius: 1 }}
                                        />
                                      </TableCell>
                                      <TableCell>{taksit.odemeSekli || '-'}</TableCell>
                                      <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                          {taksit.durum !== 'Ödendi' ? (
                                            <Button 
                                              size="small" 
                                              variant="contained" 
                                              color="primary"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOdemeDialogOpen(hasta, taksit);
                                              }}
                                              sx={{ 
                                                borderRadius: 1,
                                                boxShadow: 'none',
                                                '&:hover': { boxShadow: 1 }
                                              }}
                                            >
                                              Ödeme Al
                                            </Button>
                                          ) : (
                                            <Chip 
                                              label="Ödendi" 
                                              size="small" 
                                              color="success" 
                                              variant="outlined"
                                              sx={{ borderRadius: 1 }}
                                            />
                                          )}
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            color="info"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleTaksitDuzenle(hasta, taksit);
                                            }}
                                            sx={{ 
                                              borderRadius: 1,
                                              minWidth: 'auto',
                                              px: 1
                                            }}
                                          >
                                            Düzenle
                                          </Button>
                                        </Box>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </Box>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
            
            {hastalar.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 3 }}>
                  <Typography variant="subtitle1">
                    Kayıtlı hasta bulunamadı.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={hastalar.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="Sayfa başına satır:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
      />
      
      {/* Ödeme Alma Dialog */}
      <Dialog 
        open={odemeDialogOpen} 
        onClose={() => setOdemeDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          fontWeight: 'bold',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <CheckCircleIcon /> Ödeme Al
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
          {secilenTaksit && (
            <Box sx={{ pt: 1 }}>
              {/* Hasta bilgisi ve taksit özeti */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: 'primary.light', 
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {secilenTaksit.hasta.isim} {secilenTaksit.hasta.soyisim}
                    </Typography>
                    <Typography variant="body2">
                      TC: {secilenTaksit.hasta.tcKimlikNo}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Grid container spacing={3}>
                {/* Taksit bilgileri */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Taksit No
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {secilenTaksit.taksit.id}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Vade Tarihi
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {formatTarih(secilenTaksit.taksit.tarih)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Tutar bilgisi */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 3, 
                      bgcolor: 'success.light', 
                      color: 'white', 
                      borderRadius: 2,
                      textAlign: 'center',
                      mb: 2
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      Ödenecek Tutar
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {formatPara(secilenTaksit.taksit.tutar)}
                    </Typography>
                  </Paper>
                </Grid>
                
                {/* Ödeme şekli seçimi */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Ödeme Şekli Seçin
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Ödeme Şekli</InputLabel>
                    <Select
                      value={odemeSekli}
                      label="Ödeme Şekli"
                      onChange={(e) => setOdemeSekli(e.target.value)}
                      sx={{ 
                        bgcolor: 'white',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: odemeSekli ? 'primary.main' : 'inherit',
                          borderWidth: odemeSekli ? 2 : 1
                        }
                      }}
                    >
                      <MenuItem value="Nakit">Nakit</MenuItem>
                      <MenuItem value="Kredi Kartı">Kredi Kartı</MenuItem>
                      <MenuItem value="EFT">EFT</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid #eee', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setOdemeDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleOdemeOnay} 
            variant="contained" 
            disabled={!odemeSekli}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1
            }}
            color="success"
            startIcon={<CheckCircleIcon />}
          >
            Ödemeyi Onayla
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Taksit Düzenleme Dialog */}
      <Dialog 
        open={duzenleDialogOpen} 
        onClose={() => setDuzenleDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3,
            maxWidth: '500px',
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'info.main', 
          color: 'white',
          fontWeight: 'bold',
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <IconButton size="small" sx={{ color: 'white', p: 0, mr: 1 }}>
            <EditIcon />
          </IconButton>
          Taksit Bilgilerini Düzenle
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2 } }}>
          {secilenTaksit && (
            <Box sx={{ pt: 1 }}>
              {/* Hasta bilgisi */}
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  mb: 3, 
                  bgcolor: 'info.light', 
                  color: 'white',
                  borderRadius: 2
                }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {secilenTaksit.hasta.isim} {secilenTaksit.hasta.soyisim}
                    </Typography>
                    <Typography variant="body2">
                      TC: {secilenTaksit.hasta.tcKimlikNo}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
              
              <Grid container spacing={3}>
                {/* Taksit bilgileri */}
                <Grid item xs={12}>
                  <Paper 
                    elevation={3} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      mb: 2
                    }}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Taksit No
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {secilenTaksit.taksit.id}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Mevcut Tutar
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500, color: 'info.main' }}>
                          {formatPara(secilenTaksit.taksit.tutar)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Vade Tarihi
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 500 }}>
                          {formatTarih(secilenTaksit.taksit.tarih)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
                
                {/* Yeni tutar girişi */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Yeni Taksit Tutarını Girin
                  </Typography>
                  <TextField
                    fullWidth
                    label="Yeni Taksit Tutarı"
                    type="number"
                    value={yeniTaksitTutari}
                    onChange={(e) => setYeniTaksitTutari(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₺</InputAdornment>
                      ),
                      sx: { 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: yeniTaksitTutari && parseFloat(yeniTaksitTutari) > 0 ? 'info.main' : 'inherit',
                          borderWidth: yeniTaksitTutari && parseFloat(yeniTaksitTutari) > 0 ? 2 : 1
                        }
                      }
                    }}
                    variant="outlined"
                    size="medium"
                    required
                    autoFocus
                    helperText="Yeni taksit tutarını girin"
                  />
                </Grid>
                
                {/* Tutar değişim özeti */}
                {yeniTaksitTutari && parseFloat(yeniTaksitTutari) > 0 && (
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'rgba(25, 118, 210, 0.05)', 
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'info.main'
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Mevcut Tutar
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, textDecoration: 'line-through' }}>
                            {formatPara(secilenTaksit.taksit.tutar)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Yeni Tutar
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: 'info.main' }}>
                            {formatPara(parseFloat(yeniTaksitTutari))}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 3, borderTop: '1px solid #eee', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setDuzenleDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, px: 3 }}
            color="inherit"
          >
            İptal
          </Button>
          <Button 
            onClick={handleDuzenleOnay} 
            variant="contained" 
            color="info"
            disabled={!yeniTaksitTutari || parseFloat(yeniTaksitTutari) <= 0}
            sx={{ 
              borderRadius: 2,
              px: 4,
              py: 1
            }}
            startIcon={<SaveIcon />}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default HastaListesi;