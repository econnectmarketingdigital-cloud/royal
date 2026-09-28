const fs = require('fs');
const kml = fs.readFileSync('../map.kml', 'utf-8');

const placemarks = kml.split('<Placemark>').slice(1);
const empreendimentos = [];

placemarks.forEach(p => {
  const nameMatch = p.match(/<name><!\[CDATA\[([\s\S]*?)\]\]><\/name>/) || p.match(/<name>([\s\S]*?)<\/name>/);
  if (!nameMatch) return;
  const rawName = nameMatch[1];
  
  if (rawName.includes('ZONA')) return;
  
  let nome = rawName;
  let incorporadora = 'Outras Construtoras';
  
  if (nome.includes(' - ')) {
    const parts = nome.split(' - ');
    incorporadora = parts.pop().trim();
    nome = parts.join(' - ').trim();
  } else if (nome.includes('-')) {
    const parts = nome.split('-');
    incorporadora = parts.pop().trim();
    nome = parts.join('-').trim();
  }

  const descMatch = p.match(/<Data name="description">[\s\S]*?<value><!\[CDATA\[([\s\S]*?)\]\]><\/value>/) || p.match(/<Data name="description">[\s\S]*?<value>([\s\S]*?)<\/value>/);
  let descricao = descMatch ? descMatch[1] : '';
  
  // Clean HTML from description
  descricao = descricao.replace(/<[^>]*>?/gm, '\n').replace(/\n\s*\n/g, '\n').trim();

  let valor_min = 0;
  const valorMatch = descricao.match(/([0-9]{3})\s*MIL/i) || descricao.match(/([0-9]{3}\.[0-9]{3})/);
  if (valorMatch) {
    let clean = valorMatch[1] || valorMatch[0];
    clean = clean.toUpperCase().replace('MIL', '').replace(/\./g, '').trim();
    valor_min = parseInt(clean) * 1000;
  }
  
  if (nome && !nome.includes('LOTES')) {
    empreendimentos.push({
      nome,
      incorporadora,
      descricao: descricao.substring(0, 500),
      valor_min,
      tipo: nome.toLowerCase().includes('cond') ? 'Condomínio' : 'Lançamento'
    });
  }
});

fs.writeFileSync('map_data.json', JSON.stringify(empreendimentos, null, 2));
console.log('Found', empreendimentos.length, 'empreendimentos');
