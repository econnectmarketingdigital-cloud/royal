import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, user } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      setGoogleLoading(true);
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      const userInfo = await res.json();
      
      await loginWithGoogle(userInfo.email, userInfo.name);
      addToast('Conectado via Google com sucesso!', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.message || 'Erro no login com Google', 'error');
    } finally {
      setGoogleLoading(false);
    }
  };

  const loginGoogleAction = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => addToast('O login com Google falhou.', 'error'),
  });

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast('Login realizado com sucesso', 'success');
      navigate('/');
    } catch (error) {
      addToast(error.message || 'Erro ao fazer login', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    loginGoogleAction();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundColor: '#1e3344',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <style>{`
        .login-card {
          background: rgba(30, 51, 68, 0.4);
          border: 1px solid rgba(196, 150, 83, 0.15);
          backdrop-filter: blur(12px);
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 10;
        }
        .clean-input {
          background: rgba(22, 38, 51, 0.6) !important;
          border: 1px solid rgba(247, 250, 251, 0.1) !important;
          color: #f7fafb !important;
          padding: 10px 14px;
          border-radius: 8px;
          transition: all 0.2s;
        }
        .clean-input:focus {
          border-color: #c49653 !important;
          box-shadow: 0 0 0 3px rgba(196, 150, 83, 0.2) !important;
          outline: none;
        }
        .clean-input::placeholder {
          color: rgba(247, 250, 251, 0.3);
        }
        .gold-btn {
          background: #c49653;
          border: none;
          border-radius: 8px;
          color: #1e3344;
          font-weight: 600;
          letter-spacing: 0.5px;
          padding: 12px;
          transition: all 0.3s ease;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(196, 150, 83, 0.2);
        }
        .gold-btn:hover {
          background: #fff4c9;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(196, 150, 83, 0.3);
        }
      `}</style>

      <div className="login-card" style={{ width: '100%', maxWidth: '380px', margin: '1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/logo.png" 
            alt="Royal Imobiliária" 
            style={{ 
              width: '180px', 
              height: 'auto', 
              objectFit: 'contain', 
              display: 'inline-block',
              marginBottom: '0.2rem'
            }} 
          />
          <p style={{ color: '#c49653', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600 }}>
            Gestão de Imóveis & Vendas
          </p>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleLoading || loading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            color: '#f7fafb',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '1rem'
          }}
          onMouseOver={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; }}
          onMouseOut={e => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'; }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {googleLoading ? 'Conectando...' : 'Entrar com o Google'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', margin: '0 0 1rem 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
          <span style={{ padding: '0 12px', fontSize: '0.7rem', color: '#7b7e83', textTransform: 'uppercase', letterSpacing: '1px' }}>ou com e-mail</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '0.8rem' }}>
            <label style={{ color: '#f7fafb', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block', fontWeight: 500 }}>Email</label>
            <input type="email" className="clean-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@royal.com.br" required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#f7fafb', fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block', fontWeight: 500 }}>Senha</label>
            <input type="password" className="clean-input" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', boxSizing: 'border-box' }} />
          </div>
          <button type="submit" className="gold-btn" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Autenticando...' : 'Acessar Plataforma'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
