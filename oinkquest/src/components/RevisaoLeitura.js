import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { formatar, paraCentavos, paraTexto } from '../utils/dinheiro';
import { gerarId } from '../utils/id';

// Tela de revisão: o usuário confere, corrige ou remove cada item lido da foto
// antes de qualquer coisa ser salva.
export default function RevisaoLeitura({ visivel, itensIniciais, categorias, onConfirmar, onCancelar }) {
  const insets = useSafeAreaInsets();
  const [itens, setItens] = useState(() => preparar(itensIniciais));
  const [tentou, setTentou] = useState(false);

  // Reinicia a lista a cada nova leitura
  React.useEffect(() => {
    if (visivel) {
      setItens(preparar(itensIniciais));
      setTentou(false);
    }
  }, [visivel, itensIniciais]);

  const atualizar = (id, mudancas) =>
    setItens((lista) => lista.map((i) => (i.id === id ? { ...i, ...mudancas } : i)));
  const remover = (id) => setItens((lista) => lista.filter((i) => i.id !== id));

  const erroDe = (i) => {
    if (paraCentavos(i.valorTexto) <= 0) return 'Informe um valor maior que zero.';
    if (i.descricao.trim().length === 0) return 'Informe uma descrição.';
    return null;
  };

  const total = itens.reduce((acc, i) => acc + paraCentavos(i.valorTexto), 0);

  function confirmar() {
    setTentou(true);
    if (itens.length === 0 || itens.some(erroDe)) return;
    onConfirmar(
      itens.map((i) => ({
        descricao: i.descricao.trim(),
        valorCentavos: paraCentavos(i.valorTexto),
        categoriaId: i.categoriaId,
        dataGasto: i.dataGasto,
      }))
    );
  }

  return (
    <Modal visible={visivel} animationType="slide" onRequestClose={onCancelar}>
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.titulo}>Confira os gastos lidos</Text>
        <Text style={styles.subtitulo}>
          Corrija o que precisar. Nada é salvo até você confirmar.
        </Text>

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          {itens.length === 0 && (
            <Text style={styles.vazio}>
              Nenhum item na lista. Toque em “Cancelar” para voltar ou em “Adicionar linha”.
            </Text>
          )}

          {itens.map((item) => {
            const erro = tentou ? erroDe(item) : null;
            return (
              <View key={item.id} style={[styles.card, erro && styles.cardErro]}>
                <View style={styles.linha}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={item.descricao}
                    onChangeText={(t) => atualizar(item.id, { descricao: t })}
                    placeholder="Descrição"
                    maxLength={35}
                    accessibilityLabel="Descrição do gasto"
                  />
                  <TextInput
                    style={[styles.input, styles.inputValor]}
                    value={item.valorTexto}
                    onChangeText={(t) => atualizar(item.id, { valorTexto: t })}
                    placeholder="0,00"
                    keyboardType="decimal-pad"
                    accessibilityLabel="Valor do gasto em reais"
                  />
                  <TouchableOpacity
                    onPress={() => remover(item.id)}
                    style={styles.botaoRemover}
                    accessibilityLabel="Remover este item"
                  >
                    <Text style={styles.textoRemover}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {categorias.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.chip, item.categoriaId === c.id && styles.chipAtivo]}
                      onPress={() => atualizar(item.id, { categoriaId: c.id })}
                    >
                      <Text style={[styles.textoChip, item.categoriaId === c.id && styles.textoChipAtivo]}>
                        {c.nome}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {erro && <Text style={styles.textoErro}>{erro}</Text>}
              </View>
            );
          })}

          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={() =>
              setItens((l) => [
                ...l,
                { id: gerarId(), descricao: '', valorTexto: '', categoriaId: categorias[0].id, dataGasto: null },
              ])
            }
          >
            <Text style={styles.textoAdicionar}>+ Adicionar linha</Text>
          </TouchableOpacity>
        </ScrollView>

        <Text style={styles.total}>
          {itens.length} {itens.length === 1 ? 'gasto' : 'gastos'} · Total {formatar(total)}
        </Text>

        <View style={styles.linha}>
          <TouchableOpacity style={styles.botaoCancelar} onPress={onCancelar}>
            <Text style={styles.textoCancelar}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoConfirmar, itens.length === 0 && { opacity: 0.5 }]}
            onPress={confirmar}
            disabled={itens.length === 0}
          >
            <Text style={styles.textoConfirmar}>Salvar {itens.length || ''} gastos</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function preparar(itens) {
  return (itens || []).map((i) => ({
    id: gerarId(),
    descricao: i.descricao || '',
    valorTexto: paraTexto(i.valorCentavos),
    categoriaId: i.categoriaId,
    dataGasto: i.dataGasto || null,
  }));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA', paddingHorizontal: 16 },
  titulo: { fontSize: 20, fontWeight: 'bold', color: '#212529' },
  subtitulo: { fontSize: 13, color: '#6C757D', marginTop: 2, marginBottom: 10 },
  vazio: { textAlign: 'center', color: '#6C757D', marginVertical: 24 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    padding: 10,
    marginBottom: 8,
  },
  cardErro: { borderColor: '#DC3545' },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#212529',
  },
  inputValor: { width: 88, textAlign: 'right' },
  botaoRemover: { padding: 8 },
  textoRemover: { color: '#DC3545', fontSize: 16, fontWeight: 'bold' },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#F1F3F5', marginRight: 6 },
  chipAtivo: { backgroundColor: '#E83E8C' },
  textoChip: { fontSize: 12, color: '#495057' },
  textoChipAtivo: { color: '#FFF', fontWeight: 'bold' },
  textoErro: { color: '#DC3545', fontSize: 12, marginTop: 6 },
  botaoAdicionar: { alignItems: 'center', paddingVertical: 12 },
  textoAdicionar: { color: '#E83E8C', fontWeight: 'bold' },
  total: { textAlign: 'center', fontWeight: 'bold', color: '#212529', marginVertical: 8 },
  botaoCancelar: {
    width: '30%',
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoCancelar: { color: '#6C757D', fontWeight: 'bold' },
  botaoConfirmar: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    backgroundColor: '#E83E8C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoConfirmar: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
