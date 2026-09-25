import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { FiPlus, FiTrash2, FiMove, FiSave, FiEdit2, FiX } from 'react-icons/fi';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

export default function ConfiguracoesFunil() {
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [isEditing, setIsEditing] = useState(null);
  const [editForm, setEditForm] = useState({ id: '', nome: '', cor: '' });

  useEffect(() => {
    fetchEtapas();
  }, []);

  const fetchEtapas = async () => {
    try {
      setLoading(true);
      const data = await api.funil.getFunil();
      setEtapas(data || []);
    } catch (err) {
      addToast('Erro ao buscar etapas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    const items = Array.from(etapas);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setEtapas(items);

    try {
      const orderedIds = items.map(item => item.id);
      await api.funil.reorderFunil(orderedIds);
      addToast('Ordem atualizada com sucesso', 'success');
    } catch (err) {
      addToast('Erro ao reordenar', 'error');
      fetchEtapas(); // revert
    }
  };

  const startEdit = (etapa = null) => {
    if (etapa) {
      setEditForm({ ...etapa });
      setIsEditing(etapa.id);
    } else {
      setEditForm({ id: '', nome: '', cor: '#3498db' });
      setIsEditing('new');
    }
  };

  const cancelEdit = () => {
    setIsEditing(null);
    setEditForm({ id: '', nome: '', cor: '' });
  };

  const saveEtapa = async () => {
    try {
      if (!editForm.nome || !editForm.cor) return addToast('Preencha nome e cor', 'error');
      
      if (isEditing === 'new') {
        const newId = editForm.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '_');
        await api.funil.createEtapaFunil({
          id: newId,
          nome: editForm.nome,
          cor: editForm.cor,
          ordem: etapas.length + 1
        });
        addToast('Etapa criada!', 'success');
      } else {
        await api.funil.updateEtapaFunil(editForm.id, { nome: editForm.nome, cor: editForm.cor });
        addToast('Etapa atualizada!', 'success');
      }
      setIsEditing(null);
      fetchEtapas();
    } catch (err) {
      addToast(err.message || 'Erro ao salvar etapa', 'error');
    }
  };

  const deleteEtapa = async (id) => {
    if (!window.confirm('Tem certeza que deseja apagar esta etapa? (Leads nesta etapa ficarão ocultos do painel!)')) return;
    try {
      await api.funil.deleteEtapaFunil(id);
      addToast('Etapa removida', 'success');
      fetchEtapas();
    } catch (err) {
      addToast(err.message || 'Erro ao apagar', 'error');
    }
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, color: 'var(--color-text)' }}>Etapas do Funil de Vendas</h3>
        <button className="btn-primary" onClick={() => startEdit()} disabled={isEditing !== null} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 12px' }}>
          <FiPlus /> Nova Etapa
        </button>
      </div>

      {isEditing && (
        <div style={{ padding: '15px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Nome da Etapa</label>
            <input className="input" value={editForm.nome} onChange={e => setEditForm({...editForm, nome: e.target.value})} placeholder="Ex: Documentação" />
          </div>
          <div>
            <label className="label">Cor</label>
            <input type="color" value={editForm.cor} onChange={e => setEditForm({...editForm, cor: e.target.value})} style={{ height: '40px', width: '60px', padding: '0', border: '1px solid var(--color-border)', borderRadius: '4px', cursor: 'pointer' }} />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" onClick={cancelEdit}><FiX /> Cancelar</button>
            <button className="btn-primary" onClick={saveEtapa}><FiSave /> Salvar</button>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="funil_droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {etapas.map((etapa, index) => (
                <Draggable key={etapa.id} draggableId={etapa.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...provided.draggableProps.style,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 15px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div {...provided.dragHandleProps} style={{ cursor: 'grab', color: 'var(--color-text-secondary)' }}>
                          <FiMove size={20} />
                        </div>
                        <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: etapa.cor }}></div>
                        <strong style={{ color: 'var(--color-text)', fontSize: '1rem' }}>{etapa.nome}</strong>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => startEdit(etapa)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '5px' }}>
                          <FiEdit2 size={18} />
                        </button>
                        <button onClick={() => deleteEtapa(etapa.id)} disabled={['novo', 'fechado', 'perdido'].includes(etapa.id)} style={{ background: 'transparent', border: 'none', color: ['novo', 'fechado', 'perdido'].includes(etapa.id) ? 'var(--color-border)' : 'var(--color-danger)', cursor: ['novo', 'fechado', 'perdido'].includes(etapa.id) ? 'not-allowed' : 'pointer', padding: '5px' }}>
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
