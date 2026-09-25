import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';
import { FiAward, FiTrendingUp, FiFilter } from 'react-icons/fi';
import { FaCrown, FaMedal } from 'react-icons/fa';

const formatBRL = (number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

export default function Ranking() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [rankingData, setRankingData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [periodo, setPeriodo] = useState('mes');
  const [tipo, setTipo] = useState('vgv'); // 'vgv' ou 'pastas'

  useEffect(() => {
    fetchRanking();
  }, [periodo, tipo]);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      const res = await api.dashboard.getRanking(periodo, tipo);
      setRankingData(res || []);
    } catch (err) {
      addToast(err.message || 'Erro ao carregar ranking', 'error');
    } finally {
      setLoading(false);
    }
  };

  const top3 = rankingData.slice(0, 3);
  const others = rankingData.slice(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative', zIndex: 1, minHeight: '100%', paddingBottom: '3rem' }}>
      
      <div style={{
        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '80%', height: '50vh', zIndex: -1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at top, rgba(196, 150, 83, 0.12) 0%, transparent 70%)', filter: 'blur(50px)'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 className="font-heading" style={{ fontSize: '2.5rem', margin: 0, color: '#c49653', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <FiAward size={40} />
            Ranking da Equipe
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Acompanhe o desempenho de vendas.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--color-surface)', padding: '10px 15px', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
          <FiFilter color="var(--color-text-secondary)" />
          
          <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}>
            <option value="vgv">Ranking VGV (R$)</option>
            <option value="pastas">Ranking de Pastas (Qtd)</option>
          </select>

          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none' }}>
            <option value="mes">Este Mês</option>
            <option value="semestre">Últimos 6 Meses</option>
            <option value="ano">Este Ano</option>
            <option value="geral">Geral (Tudo)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><div className="spinner"></div></div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
            {/* 2nd Place */}
            {top3[1] && (
              <div className="card" style={{ flex: '1', minWidth: '200px', maxWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', borderTop: '4px solid #C0C0C0', position: 'relative', transform: 'translateY(20px)' }}>
                <div style={{ position: 'absolute', top: '-15px', background: '#C0C0C0', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                {top3[1].avatar_url ? (
                  <img src={top3[1].avatar_url} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid #C0C0C0' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '3px solid #C0C0C0' }}>
                    <FiAward size={40} color="#C0C0C0" />
                  </div>
                )}
                <h3 style={{ margin: '0 0 0.5rem 0', textAlign: 'center', fontSize: '1.1rem' }}>{top3[1].nome}</h3>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c49653' }}>
                  {tipo === 'vgv' ? formatBRL(top3[1].score || 0) : `${top3[1].score || 0} pastas`}
                </span>
              </div>
            )}

            {/* 1st Place */}
            {top3[0] && (
              <div className="card" style={{ flex: '1.2', minWidth: '240px', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 2rem', borderTop: '4px solid #FFD700', border: '2px solid rgba(255, 215, 0, 0.3)', position: 'relative', background: 'linear-gradient(180deg, rgba(255,215,0,0.05) 0%, var(--color-surface) 100%)', boxShadow: '0 10px 30px rgba(255,215,0,0.1)' }}>
                <FaCrown size={40} color="#FFD700" style={{ position: 'absolute', top: '-20px' }} />
                {top3[0].avatar_url ? (
                  <img src={top3[0].avatar_url} alt="Avatar" style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '4px solid #FFD700', boxShadow: '0 0 20px rgba(255,215,0,0.3)' }} />
                ) : (
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '4px solid #FFD700' }}>
                    <FaCrown size={50} color="#FFD700" />
                  </div>
                )}
                <h3 style={{ margin: '0 0 0.5rem 0', textAlign: 'center', fontSize: '1.3rem', color: '#FFD700' }}>{top3[0].nome}</h3>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c49653' }}>
                  {tipo === 'vgv' ? formatBRL(top3[0].score || 0) : `${top3[0].score || 0} pastas`}
                </span>
              </div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <div className="card" style={{ flex: '1', minWidth: '200px', maxWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', borderTop: '4px solid #CD7F32', position: 'relative', transform: 'translateY(30px)' }}>
                <div style={{ position: 'absolute', top: '-15px', background: '#CD7F32', color: '#fff', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                {top3[2].avatar_url ? (
                  <img src={top3[2].avatar_url} alt="Avatar" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '3px solid #CD7F32' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', border: '3px solid #CD7F32' }}>
                    <FiAward size={40} color="#CD7F32" />
                  </div>
                )}
                <h3 style={{ margin: '0 0 0.5rem 0', textAlign: 'center', fontSize: '1.1rem' }}>{top3[2].nome}</h3>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c49653' }}>
                  {tipo === 'vgv' ? formatBRL(top3[2].score || 0) : `${top3[2].score || 0} pastas`}
                </span>
              </div>
            )}
          </div>

          {/* List of other brokers */}
          {others.length > 0 && (
            <div className="card" style={{ marginTop: '3rem' }}>
              <h3 style={{ fontSize: '1.2rem', margin: '0 0 1.5rem 0', color: 'var(--color-text)' }}>Outros Corretores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {others.map((corretor, index) => (
                  <div key={corretor.corretor_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-surface-hover)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ fontWeight: 800, color: 'var(--color-text-secondary)', width: '25px' }}>{index + 4}º</span>
                      {corretor.avatar_url ? (
                        <img src={corretor.avatar_url} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>{corretor.nome.substring(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <div>
                        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1rem' }}>{corretor.nome}</h4>
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: '#c49653', fontSize: '1.1rem' }}>
                      {tipo === 'vgv' ? formatBRL(corretor.score || 0) : `${corretor.score || 0} pastas`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {rankingData.length === 0 && (
            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <FiTrendingUp size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Nenhuma venda registrada neste período.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
