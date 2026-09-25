import React from 'react';

export default function Mapa() {
  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ margin: '0 0 20px 0', color: 'var(--color-text)' }}>Mapa de Empreendimentos</h1>
      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
        <iframe 
          src="https://www.google.com/maps/d/u/1/embed?mid=1M4Ocw9ERxBu7_FzRd99I3Iq7epKt0CA&ehbc=2E312F" 
          width="100%" 
          height="100%" 
          style={{ border: 0 }}
          allowFullScreen="" 
          loading="lazy" 
          referrerPolicy="no-referrer-when-downgrade">
        </iframe>
      </div>
    </div>
  );
}
