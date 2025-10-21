import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent,
  Grid,
  Button,
  Skeleton
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import WarningIcon from '@mui/icons-material/Warning';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useNavigate } from 'react-router-dom';
import { useHasta } from '../context/HastaContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { hastalar, loading } = useHasta();
  const [summaryData, setSummaryData] = useState({
    totalPatients: 0,
    overduePayments: 0,
    upcomingPayments: 0
  });
  
  useEffect(() => {
    if (!loading && hastalar.length > 0) {
      // Toplam hasta sayısı
      const totalPatients = hastalar.length;
      
      // Gecikmiş ödemesi olan hasta sayısı
      const overduePayments = hastalar.filter(hasta => 
        hasta.taksitler && hasta.taksitler.some(taksit => taksit.durum === 'Gecikti')
      ).length;
      
      // Bu hafta vadesi gelecek ödemeler
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      
      const upcomingPayments = hastalar.filter(hasta => 
        hasta.taksitler && hasta.taksitler.some(taksit => {
          const taksitTarihi = new Date(taksit.tarih);
          return taksit.durum !== 'Ödendi' && 
                 taksitTarihi >= today && 
                 taksitTarihi <= nextWeek;
        })
      ).length;
      
      setSummaryData({
        totalPatients,
        overduePayments,
        upcomingPayments
      });
    } else if (!loading) {
      // Hiç hasta yoksa veya yükleme tamamlandıysa
      setSummaryData({
        totalPatients: 0,
        overduePayments: 0,
        upcomingPayments: 0
      });
    }
  }, [hastalar, loading]);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Hoş Geldiniz
      </Typography>
      <Typography variant="body1" paragraph>
        Diş Kliniği Yönetim Sistemi'ne hoş geldiniz. Bu panel üzerinden taksitli hasta ödemelerini takip edebilirsiniz.
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 2,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'primary.light', 
                borderRadius: '50%', 
                p: 2, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <PaymentIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" height={60} />
              ) : (
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {summaryData.totalPatients}
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Toplam Taksitli Hasta
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 2,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'error.light', 
                borderRadius: '50%', 
                p: 2, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <WarningIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" height={60} />
              ) : (
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', color: summaryData.overduePayments > 0 ? 'error.main' : 'inherit' }}>
                  {summaryData.overduePayments}
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Gecikmiş Ödeme
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 2,
            transition: 'transform 0.3s, box-shadow 0.3s',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: 6
            }
          }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Box sx={{ 
                bgcolor: 'info.light', 
                borderRadius: '50%', 
                p: 2, 
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CalendarTodayIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              {loading ? (
                <Skeleton variant="text" width="60%" height={60} />
              ) : (
                <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                  {summaryData.upcomingPayments}
                </Typography>
              )}
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                Bu Hafta Vadesi Gelen
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 4, mt: 4, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
          Hızlı İşlemler
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/taksitli-hastalar')}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              py: 1.5,
              boxShadow: 2,
              '&:hover': { boxShadow: 4 }
            }}
          >
            Taksitli Hastaları Görüntüle
          </Button>
          <Button 
            variant="outlined"
            size="large"
            onClick={() => navigate('/taksitli-hastalar', { state: { openNewPatientDialog: true } })}
            sx={{ 
              borderRadius: 2, 
              px: 3, 
              py: 1.5,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            Yeni Hasta Ekle
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default HomePage;