import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FiDollarSign, FiCheck, FiX, FiCalendar, FiUser, FiHome } from 'react-icons/fi';

export default function ModalVendaManual({ isOpen, onClose, onSuccess }) {
  const { addToast } = useToast();
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [corretores, setCorretores] = useState([]);
  
  const [form, setForm] = useState({
    cliente_nome: '',
    telefone: '',
    corretor_id: '',
    empreendimento_id: '',
    valor_venda: '',
    data_venda: new Date().toISOString().split('T')[0]
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      setForm({
        cliente_nome: '',
        telefone: '',
        corretor_id: '',
        empreendimento_id: '',
        valor_venda: '',
        data_venda: new Date().toISOString().split('T')[0]
      });
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [empsData, usersData] = await Promise.all([
        api.empreendimentos.getEmpreendimentos(),
        api.usuarios.getUsuarios()
      ]);
      setEmpreendimentos(empsData || []);
      setCorretores((usersData || []).filter(u => u.ativo === 1));
    } catch (err) {
      addToast('Erro ao carregar dados do formulário', 'error');
    }
  };

  const formatBRL = (number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
  };

  const formatCurrencyInput = (value) => {
    const clean = value.replace(/\D/g, '');
    if (!clean) return '';
    const number = parseInt(clean, 10) / 100;
    return formatBRL(number);
  };

  const getRawValue = (formatted) => {
    if (!formatted) return 0;
    const clean = formatted.replace(/\D/g, '');
    return parseInt(clean, 10) / 100;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'valor_venda') {
      setForm({ ...form, [name]: formatCurrencyInput(value) });
    } else if (name === 'empreendimento_id') {
      const selected = empreendimentos.find(emp => emp.id === value);
      const newForm = { ...form, [name]: value };
      if (selected && (selected.valor_min || selected.valor_max)) {
        newForm.valor_venda = formatBRL(selected.valor_min || selected.valor_max);
      }
      setForm(newForm);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valorReal = getRawValue(form.valor_venda);
    if (!form.cliente_nome || !form.corretor_id || !form.empreendimento_id || valorReal <= 0 || !form.data_venda) {
      addToast('Preencha todos os campos obrigatórios e um valor válido.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await api.leads.vendaManual({ ...form, valor_venda: valorReal });
      addToast('Venda registrada com sucesso!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      addToast(err.message || 'Erro ao registrar venda retroativa', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', border: '1px solid rgba(196, 150, 83, 0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h2 className="font-heading" style={{ fontSize: '1.5rem', margin: 0, color: '#c49653', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💰 Registrar Venda Manual
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Utilize para contabilizar vendas antigas ou externas no VGV.
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div>
            <label className="label">Nome do Cliente (Ficará como Lead Fechado)</label>
            <input type="text" className="input" name="cliente_nome" value={form.cliente_nome} onChange={handleChange} required placeholder="Ex: João da Silva" />
          </div>

          <div>
            <label className="label">Telefone (Opcional)</label>
            <input type="text" className="input" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(86) 90000-0000" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Corretor Responsável</label>
              <div style={{ position: 'relative' }}>
                <FiUser style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <select className="input" name="corretor_id" value={form.corretor_id} onChange={handleChange} required style={{ paddingLeft: '35px' }}>
                  <option value="" disabled>Selecione...</option>
                  {corretores.map(c => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Data da Venda</label>
              <div style={{ position: 'relative' }}>
                <FiCalendar style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input type="date" className="input" name="data_venda" value={form.data_venda} onChange={handleChange} required style={{ paddingLeft: '35px' }} />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Qual Produto / Imóvel?</label>
            <div style={{ position: 'relative' }}>
              <FiHome style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
              <select className="input" name="empreendimento_id" value={form.empreendimento_id} onChange={handleChange} required style={{ paddingLeft: '35px' }}>
                <option value="" disabled>Selecione o imóvel...</option>
                {empreendimentos.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Valor Bruto da Venda (VGV)</label>
            <input type="text" className="input" name="valor_venda" value={form.valor_venda} onChange={handleChange} placeholder="R$ 0,00" required style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#c49653', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancelar</button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <FiCheck /> {submitting ? 'Salvando...' : 'Confirmar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
