import React, { useState } from 'react';
import { FiX, FiCheck, FiTrash2, FiKey } from 'react-icons/fi';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function ModalGerenciarCorretor({ isOpen, onClose, corretor, todosCorretores, onSuccess }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('credenciais'); // credenciais | exclusao
  
  // Credenciais State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingCred, setLoadingCred] = useState(false);

  // Exclusao State
  const [transferTo, setTransferTo] = useState('');
  const [loadingDel, setLoadingDel] = useState(false);

  React.useEffect(() => {
    if (corretor) {
      setEmail(corretor.email || '');
      setPassword('');
      setTransferTo('');
      setActiveTab('credenciais');
    }
  }, [corretor]);

  if (!isOpen || !corretor) return null;

  const handleUpdateCred = async (e) => {
    e.preventDefault();
    try {
      setLoadingCred(true);
      const data = {};
      if (email !== corretor.email) data.email = email;
      if (password) data.password = password;
      
      if (Object.keys(data).length === 0) return;

      await api.usuarios.updateUsuarioCredentials(corretor.id, data);
      addToast('Credenciais atualizadas com sucesso!', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Erro ao atualizar credenciais', 'error');
    } finally {
      setLoadingCred(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Certeza absoluta que deseja excluir este corretor? Esta ação não pode ser desfeita.')) return;
    try {
      setLoadingDel(true);
      await api.usuarios.deleteUsuario(corretor.id, transferTo || null);
      addToast('Corretor excluído e leads transferidos (se aplicável).', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Erro ao excluir corretor', 'error');
    } finally {
      setLoadingDel(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(6px)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '450px', padding: '0', overflow: 'hidden' }}>
        
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="font-heading" style={{ fontSize: '1.25rem', margin: 0, color: 'var(--color-primary)' }}>Gerenciar: {corretor.nome}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}><FiX size={20} /></button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
          <button onClick={() => setActiveTab('credenciais')} style={{ flex: 1, padding: '1rem', background: activeTab === 'credenciais' ? 'var(--color-surface-hover)' : 'transparent', color: activeTab === 'credenciais' ? '#fff' : 'var(--color-text-secondary)', border: 'none', borderBottom: activeTab === 'credenciais' ? '2px solid var(--color-primary)' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>
            Credenciais
          </button>
          <button onClick={() => setActiveTab('exclusao')} style={{ flex: 1, padding: '1rem', background: activeTab === 'exclusao' ? 'var(--color-surface-hover)' : 'transparent', color: activeTab === 'exclusao' ? '#F43F5E' : 'var(--color-text-secondary)', border: 'none', borderBottom: activeTab === 'exclusao' ? '2px solid #F43F5E' : '2px solid transparent', cursor: 'pointer', fontWeight: 600 }}>
            Exclusão
          </button>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {activeTab === 'credenciais' && (
            <form onSubmit={handleUpdateCred} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">E-mail de Acesso</label>
                <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Nova Senha (deixe em branco para não alterar)</label>
                <input type="text" className="input" value={password} onChange={e => setPassword(e.target.value)} placeholder="Digite a nova senha..." />
              </div>
              <button type="submit" disabled={loadingCred} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                {loadingCred ? 'Salvando...' : 'Salvar Credenciais'}
              </button>
            </form>
          )}

          {activeTab === 'exclusao' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(244,63,94,0.1)', borderRadius: '8px', border: '1px solid rgba(244,63,94,0.3)', color: '#F43F5E', fontSize: '0.9rem' }}>
                <strong>Atenção:</strong> A exclusão do corretor não pode ser desfeita. Escolha o que fazer com os leads que estão com ele.
              </div>
              
              <div>
                <label className="label">Transferir leads para:</label>
                <select className="input" value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                  <option value="">Ninguém (Ficarão sem corretor)</option>
                  {todosCorretores.filter(c => c.id !== corretor.id).map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleDelete} disabled={loadingDel} className="btn" style={{ background: '#F43F5E', color: '#fff', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <FiTrash2 /> {loadingDel ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
