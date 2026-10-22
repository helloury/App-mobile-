import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { categoriasStore } from '../../store/categoriasStore';
import { gastosStore, somar } from '../../store/gastosStore';
import { useStore } from '../../store/useStore';
import { formatar, paraCentavos, paraTexto } from '../../utils/dinheiro';

export default function Metas() {
  const insets = useSafeAreaInsets();
  useStore(categoriasStore, gastosStore);

  const metas = categoriasStore.obterMetas();
  const gastos = gastosStore.obterGastos();

  const [modalVisivel, setModalVisivel] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoAlvo, setNovoAlvo] = useState('');
  const [metaEditando, setMetaEditando] = useState(null);

  // O valor acumulado NÃO é salvo: é sempre calculado a partir dos gastos da meta
  function acumuladoDe(metaId) {
    return somar(gastos.filter((g) => g.categoriaId === metaId));
  }

  function fecharModal() {
    setModalVisivel(false);
    setMetaEditando(null);
  }

  function abrirNova() {
    setMetaEditando(null);
    setNovoTitulo('');
    setNovoAlvo('');
    setModalVisivel(true);
  }

  function abrirEdicao(item) {
    setMetaEditando(item);
    setNovoTitulo(item.nome);
    setNovoAlvo(paraTexto(item.alvoCentavos));
    setModalVisivel(true);
  }

  function confirmarExclusaoMeta(item) {
    Alert.alert(
      'Excluir Meta',
      `Deseja remover a meta "${item.nome}"? Os gastos já registrados continuam no histórico.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => categoriasStore.arquivarMeta(item.id),
        },
      ]
    );
  }

  function salvarMeta() {
    if (!novoTitulo.trim() || !novoAlvo.trim()) {
      Alert.alert('Aviso', 'Preencha o nome da meta e o valor alvo.');
      return;
    }

    const alvoCentavos = paraCentavos(novoAlvo);
    if (alvoCentavos <= 0) {
      Alert.alert('Aviso', 'Informe um valor alvo válido.');
      return;
    }

    const ok = metaEditando
      ? categoriasStore.atualizarMeta(metaEditando.id, { nome: novoTitulo, alvoCentavos })
      : categoriasStore.adicionarMeta(novoTitulo, alvoCentavos);

    if (!ok) {
      Alert.alert('Aviso', 'Já existe uma meta ou categoria com esse nome.');
      return;
    }

    setNovoTitulo('');
    setNovoAlvo('');
    fecharModal();
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tituloTela}>Cofres de Metas</Text>
        {metas.length > 0 && (
          <Text style={styles.dicaExcluir}>Toque para editar · Segure para excluir</Text>
        )}

        {metas.length === 0 ? (
          <View style={styles.cardVazio}>
            <Text style={styles.textoVazio}>Nenhuma meta cadastrada.</Text>
            <Text style={styles.subtextoVazio}>
              Toque no botão '+' abaixo para criar um novo cofre de economia!
            </Text>
          </View>
        ) : (
          metas.map((item) => {
            const acumulado = acumuladoDe(item.id);
            const perc =
              item.alvoCentavos > 0
                ? Math.min((acumulado / item.alvoCentavos) * 100, 100)
                : 0;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.cardMeta}
                activeOpacity={0.7}
                onPress={() => abrirEdicao(item)}
                onLongPress={() => confirmarExclusaoMeta(item)}
                delayLongPress={350}
              >
                <Text style={styles.tituloMeta}>{item.nome}</Text>
                <Text style={styles.valoresMeta}>
                  {formatar(acumulado)} de {formatar(item.alvoCentavos)}
                </Text>
                <View style={styles.barraFundo}>
                  <View
                    style={[styles.barraProgresso, { width: `${perc}%` }]}
                  />
                </View>
                <Text style={styles.textoPorcentagem}>
                  {perc.toFixed(0)}% poupado
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Botão Flutuante (FAB) */}
      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={abrirNova}
        activeOpacity={0.8}
      >
        <Text style={styles.iconeBotaoFlutuante}>+</Text>
      </TouchableOpacity>

      {/* Modal Nova Meta / Editar Meta */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={fecharModal}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>
              {metaEditando ? 'Editar Meta' : 'Nova Meta / Categoria'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nome da meta (ex: Notebook, Viagem)"
              placeholderTextColor="#ADB5BD"
              value={novoTitulo}
              onChangeText={setNovoTitulo}
            />
            <TextInput
              style={styles.input}
              placeholder="Valor Alvo (R$)"
              placeholderTextColor="#ADB5BD"
              keyboardType="numeric"
              value={novoAlvo}
              onChangeText={setNovoAlvo}
            />
            <View style={styles.acoesModal}>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoCancelar]}
                onPress={fecharModal}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvar]}
                onPress={salvarMeta}
              >
                <Text style={styles.textoBotaoSalvar}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  tituloTela: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 14,
  },
  dicaExcluir: {
    fontSize: 11,
    color: '#ADB5BD',
    marginBottom: 8,
  },
  cardVazio: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 1,
  },
  textoVazio: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6C757D',
    marginBottom: 4,
  },
  subtextoVazio: {
    fontSize: 12,
    color: '#ADB5BD',
    textAlign: 'center',
  },
  cardMeta: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 1,
  },
  tituloMeta: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#343A40',
  },
  valoresMeta: {
    fontSize: 13,
    color: '#6C757D',
    marginVertical: 6,
  },
  barraFundo: {
    height: 8,
    backgroundColor: '#E9ECEF',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barraProgresso: {
    height: '100%',
    backgroundColor: '#20C997',
    borderRadius: 4,
  },
  textoPorcentagem: {
    fontSize: 11,
    color: '#ADB5BD',
    marginTop: 6,
    textAlign: 'right',
  },
  botaoFlutuante: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E83E8C',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  iconeBotaoFlutuante: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '300',
    marginTop: -2,
  },
  fundoModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  conteudoModal: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 6,
  },
  tituloModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 14,
    color: '#212529',
    backgroundColor: '#F8F9FA',
  },
  acoesModal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  botaoModal: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  botaoCancelar: {
    backgroundColor: '#F1F3F5',
  },
  textoBotaoCancelar: {
    color: '#6C757D',
    fontWeight: '600',
  },
  botaoSalvar: {
    backgroundColor: '#E83E8C',
  },
  textoBotaoSalvar: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
