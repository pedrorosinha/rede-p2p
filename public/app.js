async function getJSON(url, opts = {}) {
  const r = await fetch(url, opts);
  if (!r.ok) throw new Error(r.status + ' ' + r.statusText);
  return r.json();
}

function fmtDate(ms) {
  try { return new Date(ms).toLocaleString(); } catch { return String(ms); }
}

// codificação segura para nomes UTF-8
function safeEncode(str) {
  return encodeURIComponent(new TextEncoder().encode(str)
    .reduce((acc, b) => acc + '%' + b.toString(16).padStart(2,'0'), ''));
}

async function loadStatus() {
  try {
    const s = await getJSON('/api/status');
    document.getElementById('status').textContent =
      `Porta: ${s.port} | Pasta: ${s.dir} | Peers: ${s.peers.length}`;
  } catch (e) {
    document.getElementById('status').textContent = 'Erro ao carregar status';
  }
}

async function loadFiles() {
  try {
    const data = await getJSON('/api/files');
    const tbody = document.getElementById('filesBody');
    tbody.innerHTML = '';
    for (const f of data.files) {
      if (f.name.includes('.tmp-')) continue;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.name}</td>
        <td>${f.size}</td>
        <td>${fmtDate(f.mtimeMs)}</td>
        <td>
          <a href="/api/files/${safeEncode(f.name)}" download>Baixar</a>
          <button data-name="${f.name}">Remover</button>
        </td>
      `;
      tbody.appendChild(tr);
    }

    // evento remover
    tbody.querySelectorAll('button').forEach(btn => {
      btn.onclick = async () => {
        const name = btn.dataset.name;
        if (!confirm(`Deseja remover "${name}"?`)) return;
        try {
          const resp = await fetch('/api/files/' + safeEncode(name), { method: 'DELETE' });
          if (!resp.ok) throw new Error('Falha ao remover');
          loadFiles();
        } catch (e) {
          alert(e.message);
        }
      };
    });

  } catch (e) {
    console.error(e);
  }
}

document.getElementById('btnUpload').addEventListener('click', async () => {
  const inp = document.getElementById('fileInput');
  if (!inp.files || !inp.files[0]) return alert('Selecione um arquivo');
  const fd = new FormData();
  fd.append('file', inp.files[0]);
  try {
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!r.ok) throw new Error('Upload falhou');
    await loadFiles();
  } catch (e) {
    alert(e.message);
  }
});

document.getElementById('btnSync').addEventListener('click', async () => {
  try {
    await fetch('/api/sync/trigger', { method: 'POST' });
    setTimeout(loadFiles, 1000);
  } catch {}
});

loadStatus().then(loadFiles);
