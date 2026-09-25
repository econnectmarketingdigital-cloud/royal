import React, { useState, useEffect } from 'react';
import * as xlsx from 'xlsx';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FiX, FiUploadCloud, FiCheckCircle } from 'react-icons/fi';

export default function ImportLeadsModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [corretores, setCorretores] = useState([]);
  const [corretorDestino, setCorretorDestino] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [origemSelecionada, setOrigemSelecionada] = useState('Planilha Importada');
  const [dataEntrada, setDataEntrada] = useState(new Date().toISOString().split('T')[0]);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      api.usuarios.getUsuarios().then(res => setCorretores(res || [])).catch(() => {});
      setFile(null);
      setPreview([]);
      setCorretorDestino('auto');
      setOrigemSelecionada('Planilha Importada');
      setDataEntrada(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = xlsx.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = xlsx.utils.sheet_to_json(ws);
        
        // Mapear colunas básicas (tentando adivinhar nome e telefone)
        const mapped = data.map(row => {
          const nome = row.nome || row.Nome || row.NAME || row.saved_name || Object.values(row)[0] || '';
          const telefone = row.telefone || row.Telefone || row.PHONE || row.formatted_phone || row.phone_number || Object.values(row)[1] || '';
          const email = row.email || row.Email || row.EMAIL || '';
          return { nome, telefone, email, origem: 'Planilha Importada' };
        }).filter(r => r.telefone);

        setPreview(mapped.slice(0, 5));
      } catch (err) {
        addToast('Erro ao ler arquivo. Verifique o formato.', 'error');
        setFile(null);
      }
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleImport = async () => {
    if (!file) return addToast('Selecione um arquivo', 'error');

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target.result;
          const wb = xlsx.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = xlsx.utils.sheet_to_json(ws);
          
          const mapped = data.map(row => {
            const nome = row.nome || row.Nome || row.NAME || row.saved_name || Object.values(row)[0] || '';
            const telefone = String(row.telefone || row.Telefone || row.PHONE || row.formatted_phone || row.phone_number || Object.values(row)[1] || '');
            const email = row.email || row.Email || row.EMAIL || '';
            return { nome, telefone, email, origem: origemSelecionada, created_at: dataEntrada ? `${dataEntrada}T12:00:00Z` : undefined };
          });

          const result = await api.leads.importBulk({ leads: mapped, corretorId: corretorDestino });
          addToast(`Importação concluída! ${result.count} leads cadastrados.`, 'success');
          if (result.errors && result.errors.length > 0) {
             console.warn('Alguns leads foram ignorados:', result.errors);
          }
          onImportSuccess();
          onClose();
        } catch (err) {
          addToast('Erro ao processar importação: ' + err.message, 'error');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setLoading(false);
      addToast('Erro inesperado.', 'error');
    }
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'open' : ''}`} style={{ zIndex: 9999 }}>
      <div className={`modal-content ${isOpen ? 'open' : ''}`} style={{ maxWidth: '600px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <button className="modal-close" onClick={onClose} style={{ top: '15px', right: '15px' }}><FiX /></button>
        <h2 className="font-heading" style={{ margin: 0, color: 'var(--color-primary)', fontSize: '1.75rem' }}>Importar Planilha de Leads</h2>
        
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>1. Selecione o Arquivo (.xlsx, .csv)</label>
          <div style={{ padding: '20px', border: '2px dashed var(--color-border)', borderRadius: '8px', textAlign: 'center' }}>
            <input type="file" id="fileUpload" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ display: 'none' }} />
            <label htmlFor="fileUpload" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FiUploadCloud size={40} color="var(--color-primary)" style={{ marginBottom: '10px' }} />
              {file ? <span>Arquivo: <strong>{file.name}</strong></span> : <span>Clique para selecionar a planilha</span>}
            </label>
          </div>
        </div>

        {preview.length > 0 && (
          <div style={{ background: 'var(--color-surface)', padding: '15px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pré-visualização (5 primeiros)</h4>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Nome</th>
                  <th style={{ textAlign: 'left', padding: '5px' }}>Telefone</th>
                </tr>
              </thead>
              <tbody>
                {preview.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                    <td style={{ padding: '5px' }}>{p.nome}</td>
                    <td style={{ padding: '5px' }}>{p.telefone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>2. Origem / Canal</label>
            <select 
              className="input" 
              value={origemSelecionada} 
              onChange={(e) => setOrigemSelecionada(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Planilha Importada">Planilha Importada (Padrão)</option>
              <option value="Meta Ads">Meta Ads (Facebook/Instagram)</option>
              <option value="Google Ads">Google Ads</option>
              <option value="Indicação">Indicação</option>
              <option value="Base Pessoal">Base Pessoal</option>
              <option value="Ação Externa">Ação Externa</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>3. Data de Entrada</label>
            <input 
              type="date" 
              className="input" 
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>4. Distribuição de Corretores</label>
          <select 
            className="input" 
            value={corretorDestino} 
            onChange={(e) => setCorretorDestino(e.target.value)}
            style={{ width: '100%' }}
          >
            <option value="auto">⚡ Distribuir Automaticamente (Rodízio)</option>
            {corretores.map(c => (
              <option key={c.id} value={c.id}>👤 Atribuir todos para: {c.nome}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleImport} disabled={!file || loading}>
            {loading ? 'Importando...' : <><FiCheckCircle style={{ marginRight: '8px' }} /> Importar Leads</>}
          </button>
        </div>
      </div>
    </div>
  );
}
