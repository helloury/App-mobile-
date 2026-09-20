import { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Metas() {
  const insets = useSafeAreaInsets();

  const [objetivos, setObjetivos] = useState([
    { id: '1', titulo: 'Reserva de Emergência', acumulado: 1200, alvo: 3000 },
    { id: '2', titulo: 'Troca de Aparelho', acumulado: 600, alvo: 1800 },
    { id: '3', titulo: 'Curso de Especialização', acumulado: 400, alvo: 500 },
  ]);

  // Estados para Inserção
  const [modalVisivel, setModalVisivel] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoAlvo, setNovoAlvo] = useState('');

  function adicionarMeta() {
    if (!novoTitulo.trim() || !novoAlvo.trim()) {
      Alert.alert('Aviso', 'Preencha o nome da meta e o valor alvo.');
      return;
    }

    const valorNumerico = parseFloat(novoAlvo.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Aviso', 'Informe um valor alvo válido.');
      return;
    }

    const novaMeta = {
      id: String(Date.now()),
      titulo: novoTitulo,
      acumulado: 0,
      alvo: valorNumerico,
    };

    setObjetivos((prev) => [...prev, novaMeta]);
    setNovoTitulo('');
    setNovoAlvo('');
    setModalVisivel(false);
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.tituloTela}>Cofres de Metas</Text>

        {objetivos.map((item) => {
          const perc = Math.min((item.acumulado / item.alvo) * 100, 100);
          return (
            <View key={item.id} style={styles.cardMeta}>
              <Text style={styles.tituloMeta}>{item.titulo}</Text>
              <Text style={styles.valoresMeta}>
                R$ {item.acumulado} de R$ {item.alvo}
              </Text>
              <View style={styles.barraFundo}>
                <View style={[styles.barraProgresso, { width: `${perc}%` }]} />
              </View>
              <Text style={styles.textoPorcentagem}>{perc.toFixed(0)}% poupado</Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Botão Flutuante de '+' */}
      <TouchableOpacity
        style={styles.botaoFlutuante}
        onPress={() => setModalVisivel(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.iconeBotaoFlutuante}>+</Text>
      </TouchableOpacity>

      {/* Modal para Inserção de Nova Meta */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.fundoModal}>
          <View style={styles.conteudoModal}>
            <Text style={styles.tituloModal}>Nova Meta</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome da meta (ex: Novo Celular)"
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
                onPress={() => setModalVisivel(false)}
              >
                <Text style={styles.textoBotaoCancelar}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoModal, styles.botaoSalvar]}
                onPress={adicionarMeta}
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
    paddingBottom: 90, // Espaço extra para a rolagem não ficar escondida atrás do botão
  },
  tituloTela: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginVertical: 14,
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
  // Estilo do Botão Flutuante
  botaoFlutuante: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#E83E8C', // Rosa Cerejeira
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
  // Estilos do Modal de Adição
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