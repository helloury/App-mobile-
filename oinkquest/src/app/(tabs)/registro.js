import { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Registro() {
  const insets = useSafeAreaInsets();
  const [valor, setValor] = useState('0');
  const [categoria, setCategoria] = useState('Alimentação');

  function digitar(num) {
    setValor((prev) => (prev === '0' ? String(num) : prev + num));
  }

  function limpar() {
    setValor('0');
  }

  function salvar() {
    if (valor === '0') {
      Alert.alert('Aviso', 'Digite um valor maior que zero.');
      return;
    }
    Alert.alert('Sucesso', `Registrado R$ ${valor} em ${categoria}!`);
    limpar();
  }

  function abrirCameraOCR() {
    Alert.alert(
      'Leitura por Câmera',
      'Aponte para a anotação física ou recibo para preencher o valor automaticamente.'
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Visor Numérico */}
      <View style={styles.display}>
        <Text style={styles.moeda}>R$</Text>
        <Text style={styles.valorDisplay}>{valor}</Text>
      </View>

      {/* Atalhos de Categorias */}
      <View style={styles.opcoesContainer}>
        {['Alimentação', 'Transporte', 'Lazer', 'Contas'].map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.botaoCategoria, categoria === item && styles.botaoCategoriaAtivo]}
            onPress={() => setCategoria(item)}
          >
            <Text style={[styles.textoCategoria, categoria === item && styles.textoCategoriaAtivo]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Botão da Câmera (OCR) */}
      <TouchableOpacity style={styles.botaoCamera} onPress={abrirCameraOCR}>
        <Text style={styles.iconeCamera}>📷</Text>
        <Text style={styles.textoBotaoCamera}>Fotografar Anotação</Text>
      </TouchableOpacity>

      {/* Teclado Numérico Embutido */}
      <View style={styles.teclado}>
        {[
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          ['C', 0, 'OK'],
        ].map((linha, indexLinha) => (
          <View key={indexLinha} style={styles.linhaTeclado}>
            {linha.map((tecla) => (
              <TouchableOpacity
                key={tecla}
                style={[styles.tecla, tecla === 'OK' && styles.teclaSalvar]}
                onPress={() => {
                  if (tecla === 'C') limpar();
                  else if (tecla === 'OK') salvar();
                  else digitar(tecla);
                }}
              >
                <Text style={[styles.textoTecla, tecla === 'OK' && styles.textoTeclaSalvar]}>
                  {tecla}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  display: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  moeda: {
    fontSize: 20,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  valorDisplay: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#212529',
  },
  opcoesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  botaoCategoria: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F1F3F5',
  },
  botaoCategoriaAtivo: {
    backgroundColor: '#E83E8C',
  },
  textoCategoria: {
    fontSize: 12,
    color: '#495057',
  },
  textoCategoriaAtivo: {
    color: '#FFF',
    fontWeight: 'bold',
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
    marginBottom: 10,
    gap: 8,
  },
  iconeCamera: {
    fontSize: 16,
  },
  textoBotaoCamera: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E83E8C',
  },
  teclado: {
    width: '100%',
  },
  linhaTeclado: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tecla: {
    flex: 1,
    marginHorizontal: 4,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    elevation: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  teclaSalvar: {
    backgroundColor: '#E83E8C',
  },
  textoTecla: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  textoTeclaSalvar: {
    color: '#FFF',
  },
});