import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarItens, validarRequisicao } from '../lib/validar.js';
import { criarServidor } from '../server.js';

test('normalizarItens converte reais em centavos e descarta lixo', () => {
  const itens = normalizarItens({
    itens: [
      { descricao: 'Almoço', valor: 35.9, categoria: 'alimentacao', data: '2026-10-20' },
      { descricao: 'Ônibus', valor: '4,5', categoria: 'transporte', data: null },
      { descricao: 'Negativo', valor: -3, categoria: 'lazer' },
      { descricao: 'Texto', valor: 'abc', categoria: 'lazer' },
      { descricao: 'Cat estranha', valor: 10, categoria: 'xyz', data: '2026-02-31' },
    ],
  });
  assert.equal(itens.length, 3);
  assert.equal(itens[0].valorCentavos, 3590);
  assert.equal(itens[1].valorCentavos, 450);
  assert.equal(itens[2].categoria, 'outros');
  assert.equal(itens[2].dataGasto, null); // 31/02 é inválida
});

test('normalizarItens aceita resposta vazia ou malformada', () => {
  assert.deepEqual(normalizarItens(null), []);
  assert.deepEqual(normalizarItens({ itens: 'x' }), []);
});

test('validarRequisicao recusa entradas inválidas', () => {
  assert.equal(validarRequisicao(null).ok, false);
  assert.equal(validarRequisicao({}).ok, false);
  assert.equal(validarRequisicao({ imagemBase64: 'AAAA', mimeType: 'text/plain' }).ok, false);
  assert.equal(validarRequisicao({ imagemBase64: '@@@', mimeType: 'image/jpeg' }).ok, false);
  assert.equal(validarRequisicao({ imagemBase64: 'AAAA', mimeType: 'image/jpeg' }).ok, true);
});

async function comServidor(fetchImpl, fn) {
  const srv = criarServidor({ chave: 'teste', fetchImpl });
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${srv.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((r) => srv.close(r));
  }
}

const post = (base, corpo, bruto) =>
  fetch(`${base}/api/ler-anotacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: bruto ?? JSON.stringify(corpo),
  });

const geminiOk = async () =>
  new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify({ itens: [{ descricao: 'Pão', valor: 8.25, categoria: 'alimentacao', data: null }] }) }] } }],
    }),
    { status: 200 }
  );

test('GET /saude responde ok', async () => {
  await comServidor(geminiOk, async (base) => {
    const r = await fetch(`${base}/saude`);
    assert.equal(r.status, 200);
    assert.equal((await r.json()).ok, true);
  });
});

test('POST com foto válida devolve itens em centavos', async () => {
  await comServidor(geminiOk, async (base) => {
    const r = await post(base, { imagemBase64: 'AAAA', mimeType: 'image/jpeg' });
    assert.equal(r.status, 200);
    const j = await r.json();
    assert.equal(j.itens[0].valorCentavos, 825);
  });
});

test('POST inválido devolve 400 e JSON quebrado também', async () => {
  await comServidor(geminiOk, async (base) => {
    assert.equal((await post(base, { mimeType: 'image/jpeg' })).status, 400);
    assert.equal((await post(base, null, '{quebrado')).status, 400);
  });
});

test('429 do Gemini vira 429 para o app; falha de rede vira 502', async () => {
  await comServidor(async () => new Response('x', { status: 429 }), async (base) => {
    assert.equal((await post(base, { imagemBase64: 'AAAA', mimeType: 'image/png' })).status, 429);
  });
  await comServidor(async () => { throw new TypeError('rede'); }, async (base) => {
    assert.equal((await post(base, { imagemBase64: 'AAAA', mimeType: 'image/png' })).status, 502);
  });
});

test('rota inexistente devolve 404', async () => {
  await comServidor(geminiOk, async (base) => {
    assert.equal((await fetch(`${base}/nada`)).status, 404);
  });
});
