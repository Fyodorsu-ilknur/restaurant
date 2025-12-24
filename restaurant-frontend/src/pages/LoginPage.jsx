import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import './QRScannerPage.css' // Tasarım benzer olsun diye aynı CSS'i kullanabiliriz

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  // Kullanıcı giriş yapmaya çalışmadan önce hangi sayfaya gitmek istiyordu?
  const from = location.state?.from?.pathname || '/'

  const handleLogin = (e) => {
    e.preventDefault()

    // Basit Hardcoded Kontrol (Şimdilik veritabanı yok)
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('userRole', 'ADMIN') // Rolü kaydet
      toast.success('Yönetici girişi başarılı')
      // Eğer admin mutfağa gitmeye çalıştıysa oraya, yoksa panele gönder
      navigate(from.includes('kitchen') ? '/kitchen' : '/admin')
    } 
    else if (username === 'mutfak' && password === 'mutfak123') {
      localStorage.setItem('userRole', 'KITCHEN')
      toast.success('Mutfak girişi başarılı')
      navigate('/kitchen')
    } 
    else {
      toast.error('Hatalı kullanıcı adı veya şifre!')
    }
  }

  return (
    <div className="qr-scanner-page" style={{minHeight: '100vh', display: 'flex', alignItems: 'center'}}>
      <div className="qr-scanner-container" style={{maxWidth: '400px'}}>
        <h1>Personel Girişi</h1>
        <p className="subtitle">Lütfen yetkili bilgilerinizi giriniz</p>
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px'}}>
          <input 
            type="text" 
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
          <input 
            type="password" 
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{padding: '12px', borderRadius: '8px', border: '1px solid #ddd'}}
          />
          <button 
            type="submit" 
            className="start-scan-btn"
            style={{marginTop: '10px'}}
          >
            Giriş Yap
          </button>
        </form>

        <button 
          onClick={() => navigate('/')}
          className="stop-scan-btn"
          style={{marginTop: '15px', width: '100%', backgroundColor: '#666'}}
        >
          ← Ana Sayfaya Dön
        </button>
      </div>
    </div>
  )
}

export default LoginPage