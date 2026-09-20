import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { gastosStore } from '../../store/gastosStore';

export default function Registro() {
  const insets = useSafeAreaInsets();
  const [valor, setValor] = useState('0');
  const [categoria, setCategoria] = useState('Alimentação');
  const [descricao, setDescricao] = useState(''); 

  function digitar(num) {
    setValor((prev) => (prev === '0' ? String(num) : prev + num));
  }

  function limpar() {
    setValor('0');
    setDescricao('');
  }

  function salvar() {
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Aviso', 'Digite um valor maior que zero.');
      return;
    }

    // descrição opcional
    const tituloFinal = descricao.trim().length > 0 
      ? descricao.trim() 
      : `Gasto em ${categoria}`;
    //registro manual
    const novoGasto = {
      id: String(Date.now()),
      titulo: tituloFinal,
      categoria: categoria,
      valor: valorNumerico,
      data: 'Hoje',
    };

    gastosStore.adicionarGasto(novoGasto);
    limpar();
    router.replace('/');
  }

  function abrirCameraOCR() {
    Alert.alert(
      'Leitura por Câmera (OCR)',
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

      {/* Campo de Descrição */}
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

      {/* Categorias */}
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

      {/* Botão OCR */}
      <TouchableOpacity style={styles.botaoCamera} onPress={abrirCameraOCR}>
        <Text style={styles.iconeCamera}>📷</Text>
        <Text style={styles.textoBotaoCamera}>Fotografar Anotação / Recibo (OCR)</Text>
      </TouchableOpacity>

      {/* Teclado Numérico */}
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
    marginTop: 6,
    marginBottom: 4,
  },
  moeda: {
    fontSize: 18,
    color: '#6C757D',
    fontWeight: 'bold',
  },
  valorDisplay: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#212529',
  },
  campoDescricaoWrapper: {
    paddingHorizontal: 6,
    marginBottom: 6,
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
    paddingVertical: 8,
    marginHorizontal: 4,
    marginBottom: 8,
    gap: 8,
  },
  iconeCamera: {
    fontSize: 15,
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
    marginBottom: 6,
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
  teclaSalvar: {
    backgroundColor: '#E83E8C',
  },
  textoTecla: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#212529',
  },
  textoTeclaSalvar: {
    color: '#FFF',
  },
});