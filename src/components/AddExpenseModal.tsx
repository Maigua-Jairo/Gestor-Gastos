import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Category, CATEGORIES, CATEGORY_ICONS, Expense } from '@/types/expense';
import { LiquidGlassColors, Spacing } from '@/constants/theme';
import { useExpenses } from '@/context/ExpenseContext';

import * as ImagePicker from 'expo-image-picker';
import { Image } from 'react-native';
import { saveReceiptImage } from '@/utils/fileStorage';
import * as FileSystem from 'expo-file-system/legacy';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface AddExpenseModalProps {
  visible: boolean;
  onClose: () => void;
  expenseToEdit?: Expense | null;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onClose,
  expenseToEdit,
}) => {
  const { addExpense, updateExpense } = useExpenses();
  
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [receiptUri, setReceiptUri] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description ?? '');
      setReceiptUri(expenseToEdit.receiptUri ?? null);
      setDate(expenseToEdit.date ? new Date(expenseToEdit.date) : new Date());
    } else {
      setAmount('');
      setCategory(null);
      setDescription('');
      setReceiptUri(null);
      setDate(new Date());
    }
  }, [expenseToEdit, visible]);

const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDate(selectedDate);
    }
  };
  
  // Funciones de cámara y galería...
  const handleTakePicture = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la cámara para tomar la foto.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets[0].uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permiso requerido', 'Se necesita acceso a la galería para seleccionar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.7 });
    if (!result.canceled && result.assets[0].uri) {
      setReceiptUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!category) {
      Alert.alert('Campo obligatorio', 'Debe seleccionar una categoría para registrar el gasto.');
      return;
    }

    if (!amount.trim()) {
      Alert.alert('Campo obligatorio', 'El monto es obligatorio.');
      return;
    }

    const cleanAmount = amount.trim();
    const amountRegex = /^\d+(\.\d{0,2})?$/;
    if (isNaN(Number(cleanAmount)) || !amountRegex.test(cleanAmount)) {
      Alert.alert('Formato inválido', 'El campo monto solo debe aceptar números y con dos decimales (ej: 12.50).');
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 0) {
      if (trimmedDescription.length > 400) {
        Alert.alert('Límite excedido', 'El campo descripción no debe tener un tamaño mayor a 400 caracteres.');
        return;
      }
      const descriptionRegex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!descriptionRegex.test(trimmedDescription)) {
        Alert.alert('Caracteres no permitidos', 'El campo descripción no debe admitir caracteres especiales (solo números y letras del alfabeto).');
        return;
      }
    }

    try {
      let savedReceiptPath: string | undefined = receiptUri ?? undefined;

      if (receiptUri && receiptUri !== expenseToEdit?.receiptUri) {
        if (!receiptUri.includes(FileSystem.documentDirectory || '')) {
          savedReceiptPath = await saveReceiptImage(receiptUri);
        }
      } else if (!receiptUri) {
        savedReceiptPath = undefined;
      }

      if (expenseToEdit) {
        await updateExpense({
          ...expenseToEdit,
          amount: parseFloat(cleanAmount),
          category,
          date: date, // Fecha seleccionada
          description: trimmedDescription || undefined,
          receiptUri: savedReceiptPath,
        });
      } else {
        await addExpense({
          amount: parseFloat(cleanAmount),
          category,
          date: date, // Fecha seleccionada
          description: trimmedDescription || undefined,
          receiptUri: savedReceiptPath,
        });
      }

      handleClose();
    } catch (error) {
      console.error('Error al guardar el gasto', error);
      Alert.alert('Error', 'No se pudo guardar el gasto. Intenta de nuevo.');
    }
  };

  const handleClose = () => {
    setAmount('');
    setCategory(null);
    setDescription('');
    setReceiptUri(null);
    setDate(new Date());
    setShowDatePicker(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
        keyboardVerticalOffset={0}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose}>
          <Animated.View entering={FadeIn} style={styles.backdropBlur}>
            <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          </Animated.View>
        </TouchableOpacity>

        <Animated.View entering={SlideInDown.springify()} style={styles.modalContent}>
          <View style={styles.modalBackground}>
            <BlurView intensity={100} tint="light" style={styles.modalBlur}>
              <View style={styles.handleBar} />

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>
                  {expenseToEdit ? 'Editar Gasto' : 'Agregar Gasto'}
                </Text>

                {/* Monto */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Monto (USD)</Text>
                  <View style={styles.inputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    />
                  </View>
                </View>

                {/* Fecha */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Fecha del Gasto</Text>
                  <TouchableOpacity
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>
                      📅 {date.toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>

{showDatePicker && (
                    <DateTimePicker
                      value={date}
                      mode="date"
                      display="default"
                      onValueChange={handleDateChange}
                      maximumDate={new Date()}
                    />
                  )}
                </View>

                {/* Categoría */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Categoría</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll} contentContainerStyle={styles.categoriesContent}>
                    {CATEGORIES.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        onPress={() => setCategory(cat)}
                        style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                      >
                        {category === cat ? (
                          <LinearGradient
                            colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.categoryGradient}
                          >
                            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                            <Text style={styles.categoryTextActive}>{cat}</Text>
                          </LinearGradient>
                        ) : (
                          <>
                            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
                            <Text style={styles.categoryText}>{cat}</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Descripción */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Descripción (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej: Almuerzo, transporte..."
                    placeholderTextColor={LiquidGlassColors.glassTextSecondary}
                    multiline
                  />
                </View>

                {/* Factura / Comprobante */}
                <View style={styles.inputSection}>
                  <Text style={styles.label}>Factura o Comprobante (opcional)</Text>
                  {receiptUri ? (
                    <View style={styles.receiptPreviewContainer}>
                      <Image source={{ uri: receiptUri }} style={styles.receiptThumbnail} />
                      <TouchableOpacity style={styles.removeReceiptButton} onPress={() => setReceiptUri(null)}>
                        <Text style={styles.removeReceiptText}>Eliminar foto</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.receiptButtonsRow}>
                      <TouchableOpacity style={styles.receiptButton} onPress={handleTakePicture} activeOpacity={0.7}>
                        <Text style={styles.receiptButtonIcon}>📷</Text>
                        <Text style={styles.receiptButtonText}>Cámara</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.receiptButton} onPress={handlePickImage} activeOpacity={0.7}>
                        <Text style={styles.receiptButtonIcon}>🖼️</Text>
                        <Text style={styles.receiptButtonText}>Galería</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Botones de acción */}
                <View style={styles.buttonContainer}>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <LinearGradient
                      colors={[LiquidGlassColors.primary, LiquidGlassColors.secondary]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.submitGradient}
                    >
                      <Text style={styles.submitButtonText}>
                        {expenseToEdit ? 'Actualizar' : 'Guardar'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </BlurView>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // ... (mantén tus estilos existentes e incluye los nuevos botones de fecha abajo)
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill },
  backdropBlur: { flex: 1 },
  modalContent: { borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four, overflow: 'hidden', maxHeight: '80%' },
  modalBackground: { backgroundColor: 'rgba(255, 255, 255, 0.45)', borderTopLeftRadius: Spacing.four, borderTopRightRadius: Spacing.four },
  modalBlur: { paddingHorizontal: Spacing.four, paddingTop: Spacing.two, paddingBottom: Spacing.four, maxHeight: '100%' },
  scrollContent: { paddingBottom: Spacing.four },
  handleBar: { width: 40, height: 4, backgroundColor: LiquidGlassColors.glassTextSecondary, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.three, marginTop: Spacing.two, opacity: 0.3 },
  title: { fontSize: 24, fontWeight: 'bold', color: LiquidGlassColors.glassText, marginBottom: Spacing.four },
  inputSection: { marginBottom: Spacing.four },
  label: { fontSize: 14, fontWeight: '600', color: LiquidGlassColors.glassText, marginBottom: Spacing.two },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, paddingHorizontal: Spacing.three },
  currencySymbol: { fontSize: 24, fontWeight: 'bold', color: LiquidGlassColors.primary, marginRight: Spacing.one },
  input: { flex: 1, fontSize: 18, color: LiquidGlassColors.glassText, paddingVertical: Spacing.three },
  descriptionInput: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, paddingHorizontal: Spacing.three, minHeight: 80, textAlignVertical: 'top' },
  datePickerButton: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, padding: Spacing.three, alignItems: 'center' },
  datePickerButtonText: { fontSize: 16, fontWeight: '600', color: LiquidGlassColors.glassText },
  categoriesScroll: { marginHorizontal: -Spacing.two },
  categoriesContent: { paddingHorizontal: Spacing.two, gap: Spacing.two },
  categoryButton: { backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, padding: Spacing.two, minWidth: 100, alignItems: 'center' },
  categoryButtonActive: { borderColor: 'transparent' },
  categoryGradient: { padding: Spacing.two, borderRadius: Spacing.two, alignItems: 'center', width: '100%' },
  categoryIcon: { fontSize: 24, marginBottom: Spacing.one },
  categoryText: { fontSize: 12, color: LiquidGlassColors.glassText, textAlign: 'center' },
  categoryTextActive: { fontSize: 12, color: LiquidGlassColors.glassTextLight, fontWeight: '600', textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.two },
  cancelButton: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, paddingVertical: Spacing.three, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: LiquidGlassColors.glassText },
  submitButton: { flex: 1, borderRadius: Spacing.two, overflow: 'hidden' },
  submitGradient: { paddingVertical: Spacing.three, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: 'bold', color: LiquidGlassColors.glassTextLight },
  receiptButtonsRow: { flexDirection: 'row', gap: Spacing.two },
  receiptButton: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, paddingVertical: Spacing.three, justifyContent: 'center', alignItems: 'center', gap: Spacing.one },
  receiptButtonIcon: { fontSize: 18 },
  receiptButtonText: { fontSize: 14, fontWeight: '600', color: LiquidGlassColors.glassText },
  receiptPreviewContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: Spacing.two, borderWidth: 1, borderColor: LiquidGlassColors.glassBorder, padding: Spacing.two, gap: Spacing.three },
  receiptThumbnail: { width: 60, height: 60, borderRadius: Spacing.one },
  removeReceiptButton: { backgroundColor: 'rgba(196, 69, 105, 0.15)', paddingVertical: Spacing.two, paddingHorizontal: Spacing.three, borderRadius: Spacing.two },
  removeReceiptText: { fontSize: 13, fontWeight: '600', color: LiquidGlassColors.secondary },
});