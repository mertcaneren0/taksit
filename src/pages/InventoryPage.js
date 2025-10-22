import React, { useEffect, useState } from 'react';
import { Box, Grid, Alert, AlertTitle, Chip, Stack, Paper, Typography, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { api } from '../api/apiClient';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const columns = [
  { field: 'name', headerName: 'Malzeme Adı', flex: 1, minWidth: 180 },
  { field: 'totalQty', headerName: 'Toplam Adet', width: 140 },
  { field: 'criticalQty', headerName: 'Kritik Adet', width: 140, editable: true },
  { field: 'nearestExpiry', headerName: 'En Yakın SKT', width: 160 },
  { field: 'lastPrice', headerName: 'Son Fiyat', width: 140 },
  { field: 'locations', headerName: 'Konumlar', flex: 1, minWidth: 220, renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {(params.value || []).map((loc) => (
          <Chip key={loc} size="small" label={loc} />
        ))}
      </Stack>
    )
  },
];

export default function InventoryPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState({ criticalCount: 0, expiryCount: 0 });
  const [orderOpen, setOrderOpen] = useState(false);
  const [selection, setSelection] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [stockOpen, setStockOpen] = useState(false);
  const [stockForm, setStockForm] = useState({ materialName: '', location: '', qty: '', supplierId: '', lotCode: '', expiryDate: '', cost: '' });
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      api.inventory.alertsSummary(),
      api.inventory.materials({})
    ])
      .then(([summary, materials]) => {
        if (!mounted) return;
        setAlerts({ criticalCount: summary.criticalCount || 0, expiryCount: summary.expiryCount || 0 });
        const mapped = (materials || []).map((m, i) => ({
          id: m.id ?? i + 1,
          name: m.name,
          totalQty: m.totalQty,
          criticalQty: m.criticalQty,
          nearestExpiry: m.nearestExpiry,
          lastPrice: m.lastPrice,
          locations: m.locations || [],
        }));
        setRows(mapped);
      })
      .catch(() => {
        if (!mounted) return;
        setRows([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <Inventory2Icon color="primary" />
        <Typography variant="h5">Depo ve Sipariş</Typography>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Alert severity="error" variant="outlined">
            <AlertTitle>Kritik Stok</AlertTitle>
            Kritik seviyenin altında ürün sayısı: <strong>{alerts.criticalCount}</strong>
          </Alert>
        </Grid>
        <Grid item xs={12} md={6}>
          <Alert severity="warning" variant="outlined">
            <AlertTitle>SKT Yaklaşan</AlertTitle>
            SKT’si yaklaşan ürün sayısı: <strong>{alerts.expiryCount}</strong>
          </Alert>
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 1 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Button variant="contained" startIcon={<LocalShippingIcon />} onClick={() => setOrderOpen(true)}>Malzeme Siparişi Oluştur</Button>
          <Button variant="outlined" onClick={() => setStockOpen(true)}>Malzeme Girişi</Button>
        </Stack>
        <div style={{ height: 520, width: '100%' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            getRowId={(r) => r.id || `${r.name}-${r.nearestExpiry || ''}`}
            disableRowSelectionOnClick
            pagination
            pageSizeOptions={[10, 25, 50]}
            hideFooter
            initialState={{
              pagination: { paginationModel: { pageSize: 25, page: 0 } },
            }}
          />
        </div>
      </Paper>

      <Dialog open={orderOpen} onClose={() => setOrderOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Malzeme Siparişi Oluştur</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 1 }}>
            Varsayılan görünüm kritik stok altındaki malzemeleri listeler. Miktar girerek seçim yapın.
          </Typography>
          <div style={{ height: 420, width: '100%' }}>
            <DataGrid
              rows={rows.filter(r => typeof r.criticalQty === 'number' && typeof r.totalQty === 'number' ? r.totalQty <= r.criticalQty : true)}
              columns={[
                ...columns,
                {
                  field: 'orderQty',
                  headerName: 'Sipariş Miktarı',
                  width: 160,
                  renderCell: (params) => (
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={quantities[params.row.id] ?? ''}
                      onChange={(e) => setQuantities(q => ({ ...q, [params.row.id]: e.target.value }))}
                    />
                  )
                }
              ]}
              checkboxSelection
              disableRowSelectionOnClick
              pagination
              pageSizeOptions={[10, 25, 50]}
              hideFooter
              onRowSelectionModelChange={(m) => {
                const next = Array.isArray(m) ? m : (m?.ids ? Array.from(m.ids) : []);
                setSelection(next);
              }}
              getRowId={(r) => r.id}
              initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOrderOpen(false)}>Kapat</Button>
          <Button variant="contained" onClick={() => {
            const selectedRows = rows.filter(r => selection.includes(r.id)).map(r => ({
              name: r.name,
              unit: '',
              current: r.totalQty ?? 0,
              critical: r.criticalQty ?? '',
              qty: Number(quantities[r.id] ?? 0)
            })).filter(i => i.qty > 0);
            const doc = new jsPDF({ orientation: 'p', unit: 'pt' });
            doc.setFontSize(14);
            doc.text('Malzeme Sipariş Formu', 40, 40);
            const body = selectedRows.map(i => [i.name, i.unit, String(i.current), String(i.critical), String(i.qty)]);
            // @ts-ignore
            doc.autoTable({
              startY: 60,
              head: [['Malzeme', 'Birim', 'Mevcut', 'Kritik', 'Talep']],
              body
            });
            doc.save(`siparis_${new Date().toISOString().slice(0,10)}.pdf`);
          }}>PDF İndir</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Malzeme Girişi</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField label="Malzeme Adı" value={stockForm.materialName} onChange={(e) => setStockForm(f => ({ ...f, materialName: e.target.value }))} fullWidth />
            <TextField label="Konum" value={stockForm.location} onChange={(e) => setStockForm(f => ({ ...f, location: e.target.value }))} fullWidth />
            <TextField label="Miktar" type="number" inputProps={{ min: 0 }} value={stockForm.qty} onChange={(e) => setStockForm(f => ({ ...f, qty: e.target.value }))} fullWidth />
            <TextField label="Tedarikçi ID (opsiyonel)" value={stockForm.supplierId} onChange={(e) => setStockForm(f => ({ ...f, supplierId: e.target.value }))} fullWidth />
            <TextField label="Lot Kodu (opsiyonel)" value={stockForm.lotCode} onChange={(e) => setStockForm(f => ({ ...f, lotCode: e.target.value }))} fullWidth />
            <TextField label="SKT (opsiyonel)" type="date" InputLabelProps={{ shrink: true }} value={stockForm.expiryDate} onChange={(e) => setStockForm(f => ({ ...f, expiryDate: e.target.value }))} fullWidth />
            <TextField label="Birim Maliyet (opsiyonel)" type="number" inputProps={{ min: 0, step: '0.01' }} value={stockForm.cost} onChange={(e) => setStockForm(f => ({ ...f, cost: e.target.value }))} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStockOpen(false)}>Kapat</Button>
          <Button variant="contained" onClick={async () => {
            try {
              const payload = {
                materialName: stockForm.materialName?.trim(),
                location: stockForm.location?.trim(),
                qty: Number(stockForm.qty),
                supplierId: stockForm.supplierId ? Number(stockForm.supplierId) : undefined,
                lotCode: stockForm.lotCode || undefined,
                expiryDate: stockForm.expiryDate || undefined,
                cost: stockForm.cost ? Number(stockForm.cost) : undefined,
              };
              await api.inventory.stockIn(payload);
              setSnack({ open: true, message: 'Stok girişi başarıyla kaydedildi.', severity: 'success' });
              setStockOpen(false);
              setStockForm({ materialName: '', location: '', qty: '', supplierId: '', lotCode: '', expiryDate: '', cost: '' });
            } catch (e) {
              setSnack({ open: true, message: 'Stok girişi başarısız. Zorunlu alanları kontrol edin.', severity: 'error' });
            }
          }}>Kaydet</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snack.open} autoHideDuration={3000} onClose={() => setSnack(s => ({ ...s, open: false }))} message={snack.message} />
    </Box>
  );
}
