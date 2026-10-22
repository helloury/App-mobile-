import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';

import { gastosStore } from '../../store/gastosStore';
import { categoriasStore } from '../../store/categoriasStore';
import { useStore } from '../../store/useStore';
import { paraCentavos } from '../../utils/dinheiro';
import { gerarId } from '../../utils/id';
import { hojeISO, ontemISO } from '../../utils/datas';

export default function Registro() {
  const insets = useSafeAreaInsets();
  useStore(categoriasStore);

  const [valor, setValor] = useState('0');
  const [categoriaId, setCategoriaId] = useState('cat-alimentacao');
  const [descricao, setDescricao] = useState('');
  const [quando, setQuando] = useState('hoje');
  const [animacaoVisivel, setAnimacaoVisivel] = useState(false);
  const finalizadoRef = useRef(false);

  const categorias = categoriasStore.obterCategorias();
  // Se a meta selecionada foi excluída, volta para a primeira categoria
  const categoriaAtiva = categorias.some((c) => c.id === categoriaId)
    ? categoriaId
    : categorias[0].id;

  function digitar(tecla) {
    setValor((prev) => {
      if (tecla === '.') {
        if (prev.includes('.')) return prev;
        return prev + '.';
      }

      if (prev.includes('.')) {
        const partes = prev.split('.');
        if (partes[1] && partes[1].length >= 2) return prev;
      }

      if (prev === '0') return String(tecla);
      return prev + tecla;
    });
  }

  function apagarUmCaractere() {
    setValor((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }

  function limparTudo() {
    setValor('0');
    setDescricao('');
    setQuando('hoje');
  }

  function finalizar() {
    if (finalizadoRef.current) return;
    finalizadoRef.current = true;
    setAnimacaoVisivel(false);
    limparTudo();
    router.replace('/');
  }

  function salvar() {
    const valorCentavos = paraCentavos(valor);

    if (valorCentavos <= 0) {
      Alert.alert('Aviso', 'Digite um valor maior que zero.');
      return;
    }

    const tituloFinal =
      descricao.trim().length > 0
        ? descricao.trim()
        : `Gasto em ${categoriasStore.nomeDe(categoriaAtiva)}`;

    gastosStore.adicionarGasto({
      id: gerarId(),
      titulo: tituloFinal,
      categoriaId: categoriaAtiva,
      valorCentavos,
      dataGasto: quando === 'ontem' ? ontemISO() : hojeISO(),
    });

    finalizadoRef.current = false;

    if (categoriasStore.ehMeta(categoriaAtiva)) {
      setAnimacaoVisivel(true);
      // Temporizador de segurança: encerra a tela após 2.2 segundos mesmo se o Lottie travar
      setTimeout(() => {
        finalizar();
      }, 2200);
    } else {
      finalizar();
    }
  }

  function abrirCameraOCR() {
    Alert.alert(
      'Leitura por Câmera (OCR)',
      'Aponte para a anotação física ou recibo para preencher o valor automaticamente.'
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Botão OCR */}
      <TouchableOpacity style={styles.botaoCamera} onPress={abrirCameraOCR} activeOpacity={0.8}>
        <Text style={styles.iconeCamera}>📷</Text>
        <Text style={styles.textoBotaoCamera}>Fotografar Anotação</Text>
      </TouchableOpacity>

      {/* Visor Numérico */}
      <View style={styles.display}>
        <Text style={styles.moeda}>R$</Text>
        <Text style={styles.valorDisplay}>{valor}</Text>
      </View>

      {/* Descrição Opcional */}
      <View style={styles.campoDescricaoWrapper}>
        <TextInput
          style={styles.inputDescricao}
          placeholder="Adicionar descrição (opcional)..."
          placeholderTextColor="#ADB5BD"
          value={descricao}
          onChangeText={setDescricao}
          maxLength={35}
        />
      </View>

      {/* Quando o gasto aconteceu */}
      <View style={styles.linhaData}>
        {[
          ['hoje', 'Hoje'],
          ['ontem', 'Ontem'],
        ].map(([chave, rotulo]) => (
          <TouchableOpacity
            key={chave}
            style={[styles.chipData, quando === chave && styles.chipDataAtivo]}
            onPress={() => setQuando(chave)}
          >
            <Text style={[styles.textoChipData, quando === chave && styles.textoChipDataAtivo]}>
              {rotulo}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Categorias (Inclui as Metas criadas como categorias) */}
      <View style={styles.opcoesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.opcoesContainer}
        >
          {categorias.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.botaoCategoria, categoriaAtiva === item.id && styles.botaoCategoriaAtivo]}
              onPress={() => setCategoriaId(item.id)}
            >
              <Text
                style={[
                  styles.textoCategoria,
                  categoriaAtiva === item.id && styles.textoCategoriaAtivo,
                ]}
              >
                {item.nome}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Teclado Numérico */}
      <View style={styles.teclado}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          ['.', 0, '⌫'],
        ].map((linha, indexLinha) => (
          <View key={indexLinha} style={styles.linhaTeclado}>
            {linha.map((tecla) => (
              <TouchableOpacity
                key={tecla}
                style={[styles.tecla, tecla === '⌫' && styles.teclaApagar]}
                onPress={() => {
                  if (tecla === '⌫') {
                    apagarUmCaractere();
                  } else {
                    digitar(tecla);
                  }
                }}
              >
                <Text style={[styles.textoTecla, tecla === '⌫' && styles.textoTeclaApagar]}>
                  {tecla}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        <View style={styles.linhaAcoesInferiores}>
          <TouchableOpacity style={styles.botaoLimparTudo} onPress={limparTudo}>
            <Text style={styles.textoBotaoLimparTudo}>C (Limpar)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoConfirmarRegistro} onPress={salvar}>
            <Text style={styles.textoBotaoConfirmarRegistro}>Confirmar Registro (OK)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal da Animação Lottie */}
      <Modal visible={animacaoVisivel} transparent={true} animationType="fade">
        <View style={styles.containerModalAnimacao}>
          <LottieView
            source={require('../../../assets/animacao-meta.json')}
            autoPlay
            loop={false}
            onAnimationFinish={finalizar}
            style={styles.lottieAnimacao}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 14,
  },
  botaoCamera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF0F5',
    borderWidth: 1.5,
    borderColor: '#E83E8C',
    borderRadius: 10,
    paddingVertical: 9,
    marginHorizontal: 4,
    marginTop: 46,
    marginBottom: 6,
    gap: 8,
  },
  iconeCamera: {
    fontSize: 15
    },
  textoBotaoCamera: {
     fontSize: 13,
      fontWeight: '700',
      color: '#E83E8C' 
      },
  display: {
     alignItems: 'center',
      justifyContent: 'center', 
      marginVertical: 4
     },
  moeda: {
   fontSize: 18,
   color: '#6C757D', 
   fontWeight: 'bold' 
  },
  valorDisplay: { 
    fontSize: 42, 
    fontWeight: 'bold',
     color: '#212529'
     },
  campoDescricaoWrapper: { 
    paddingHorizontal: 6,
     marginBottom: 6
     },
  inputDescricao: {
    height: 38,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#212529',
    textAlign: 'center',
  },
  opcoesWrapper: { 
    height: 40,
     marginBottom: 6
     },
  opcoesContainer: { 
    flexDirection: 'row', 
    alignItems: 'center',
     gap: 8, 
     paddingHorizontal: 4
     },
  botaoCategoria: { 
    paddingHorizontal: 14,
     paddingVertical: 7, 
     borderRadius: 16, 
     backgroundColor: '#F1F3F5'
     },
  botaoCategoriaAtivo: { 
    backgroundColor: '#E83E8C'
   },
  textoCategoria: { 
    fontSize: 12, 
    color: '#495057' 
  },
  textoCategoriaAtivo: { 
    color: '#FFFFFF', 
    fontWeight: 'bold'
   },
  teclado: { 
    width: '100%'
   },
  linhaTeclado: { 
    flexDirection: 'row',
     justifyContent: 'space-between',
      marginBottom: 6 
    },
  tecla: {
    flex: 1,
    marginHorizontal: 4,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teclaApagar: { 
    backgroundColor: '#FFF5F5'
   },
  textoTecla: { 
    fontSize: 20,
     fontWeight: 'bold',
      color: '#212529'
     },
  textoTeclaApagar: {
     fontSize: 22,
      color: '#DC3545'
     },
  linhaAcoesInferiores: { 
    flexDirection: 'row', 
    gap: 8, 
    marginHorizontal: 4, 
    marginTop: 2
   },
  botaoLimparTudo: {
    width: '30%',
    height: 46,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textoBotaoLimparTudo: { 
    fontSize: 13, 
    fontWeight: 'bold', 
    color: '#6C757D'
   },
  botaoConfirmarRegistro: {
    flex: 1,
    height: 46,
    backgroundColor: '#E83E8C',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
  },
  textoBotaoConfirmarRegistro: {
     color: '#FFFFFF', 
     fontSize: 14, 
     fontWeight: 'bold' 
    },
  containerModalAnimacao: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lottieAnimacao: { 
    width: 280,
     height: 280 
    },
  linhaData: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 6 },
  chipData: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: 14, backgroundColor: '#F1F3F5' },
  chipDataAtivo: { backgroundColor: '#FFD6E5' },
  textoChipData: { fontSize: 12, color: '#495057' },
  textoChipDataAtivo: { color: '#E83E8C', fontWeight: 'bold' },
});
