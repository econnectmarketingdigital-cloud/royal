
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FunilContext = createContext();

export function FunilProvider({ children }) {
  const { user } = useAuth();
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      refreshFunil();
    } else {
      setEtapas([]);
      setLoading(false);
    }
  }, [user]);

  const refreshFunil = async () => {
    try {
      setLoading(true);
      const data = await api.funil.getFunil();
      setEtapas(data || []);
    } catch (err) {
      console.error('Erro ao carregar funil', err);
    } finally {
      setLoading(false);
    }
  };

  const getEtapaColor = (id) => {
    const etapa = etapas.find(e => e.id === id);
    return etapa ? etapa.cor : '#95a5a6';
  };

  const getEtapaNome = (id) => {
    const etapa = etapas.find(e => e.id === id);
    return etapa ? etapa.nome : id;
  };

  return (
    <FunilContext.Provider value={{ etapas, loading, refreshFunil, getEtapaColor, getEtapaNome }}>
      {children}
    </FunilContext.Provider>
  );
}

export const useFunil = () => useContext(FunilContext);
