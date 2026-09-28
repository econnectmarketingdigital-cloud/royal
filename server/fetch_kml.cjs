const fs = require('fs');
const https = require('https');

https.get('https://www.google.com/maps/d/kml?mid=1M4Ocw9ERxBu7_FzRd99I3Iq7epKt0CA&forcekml=1', (res) => {
  let kml = '';
  res.on('data', (chunk) => { kml += chunk; });
  res.on('end', () => {
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

    fs.writeFileSync('map_data.json', JSON.stringify(empreendimentos, null, 2), 'utf-8');
    console.log('Successfully fetched and parsed', empreendimentos.length, 'empreendimentos');
  });
}).on('error', (e) => {
  console.error(e);
});
