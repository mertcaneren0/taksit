/**
 * API İstemcisi
 * 
 * Bu modül, sunucu API'si ile iletişim kurmak için kullanılır.
 * Şu anda localStorage ile çalışıyor, ancak gerçek bir API'ye geçiş için hazır.
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.eeyonetim.com/api'
  : 'http://localhost:3001/api';

/**
 * API isteği gönderir
 * @param {string} endpoint - API endpoint'i
 * @param {string} method - HTTP metodu (GET, POST, PUT, DELETE)
 * @param {object} data - İstek gövdesi (body)
 * @returns {Promise} - API yanıtı
 */
const apiRequest = async (endpoint, method = 'GET', data = null) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Eğer token varsa ekle (kimlik doğrulama için)
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method,
      headers,
      credentials: 'include', // CORS için çerezleri dahil et
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    // Yanıtı JSON olarak ayrıştır
    const result = await response.json();
    
    // Başarısız yanıtları ele al
    if (!response.ok) {
      throw new Error(result.message || 'API isteği başarısız oldu');
    }
    
    return result;
  } catch (error) {
    console.error('API isteği sırasında hata:', error);
    throw error;
  }
};

// API Endpoint'leri
export const api = {
  // Kimlik doğrulama
  auth: {
    login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
    logout: () => apiRequest('/auth/logout', 'POST'),
    refreshToken: () => apiRequest('/auth/refresh-token', 'POST'),
  },
  
  // Hasta yönetimi
  hastalar: {
    getAll: () => apiRequest('/hastalar'),
    getById: (id) => apiRequest(`/hastalar/${id}`),
    create: (data) => apiRequest('/hastalar', 'POST', data),
    update: (id, data) => apiRequest(`/hastalar/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/hastalar/${id}`, 'DELETE'),
  },
  
  // Taksit yönetimi
  taksitler: {
    updateOdeme: (hastaId, taksitId, data) => 
      apiRequest(`/hastalar/${hastaId}/taksitler/${taksitId}/odeme`, 'PUT', data),
    update: (hastaId, taksitId, data) => 
      apiRequest(`/hastalar/${hastaId}/taksitler/${taksitId}`, 'PUT', data),
  },
  
  // Kullanıcı yönetimi
  kullanicilar: {
    getAll: () => apiRequest('/kullanicilar'),
    getById: (id) => apiRequest(`/kullanicilar/${id}`),
    create: (data) => apiRequest('/kullanicilar', 'POST', data),
    update: (id, data) => apiRequest(`/kullanicilar/${id}`, 'PUT', data),
    delete: (id) => apiRequest(`/kullanicilar/${id}`, 'DELETE'),
  },
  
  // Ayarlar
  ayarlar: {
    get: () => apiRequest('/ayarlar'),
    update: (data) => apiRequest('/ayarlar', 'PUT', data),
  },
  
  // Yedekleme ve içe aktarma
  yedekleme: {
    export: () => apiRequest('/yedekleme/export', 'GET'),
    import: (data) => apiRequest('/yedekleme/import', 'POST', data),
  },
};

export default api;


