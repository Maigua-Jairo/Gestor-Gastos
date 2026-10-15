// src/utils/fileStorage.ts
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Copia una imagen desde una ruta temporal a una ubicación permanente
 * dentro del directorio de documentos de la aplicación.
 */
export async function saveReceiptImage(tempUri: string): Promise<string> {
  try {
    // Generamos un nombre único para evitar sobreescribir archivos
    const filename = `receipt_${Date.now()}.jpg`;
    const permanentUri = `${FileSystem.documentDirectory}${filename}`;

    // Copiamos la imagen del caché al directorio permanente usando la API legacy compatible
    await FileSystem.copyAsync({
      from: tempUri,
      to: permanentUri,
    });

    return permanentUri;
  } catch (error) {
    console.error('Error al guardar la imagen de la factura:', error);
    throw new Error('No se pudo guardar la imagen en el dispositivo.');
  }
}

/**
 * Elimina la imagen de la factura del almacenamiento permanente.
 */
export async function deleteReceiptImage(fileUri: string): Promise<void> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
    }
  } catch (error) {
    console.error('Error al eliminar la imagen de la factura:', error);
  }
}