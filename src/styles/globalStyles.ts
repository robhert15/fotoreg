import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

// Por defecto, usamos el tema claro. Esto se puede hacer dinámico en el futuro.
const AppColors = Colors.light;

export const globalStyles = StyleSheet.create({
  // --- Contenedores y Layout ---
  container: {
    flex: 1,
    backgroundColor: AppColors.background,
    paddingBottom: 20, // Añade espacio en la parte inferior para los controles del sistema
  },
  header: {
    padding: 20,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.tabIconDefault, // Un gris suave
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
    footer: {
    flexDirection: 'row',
    paddingVertical: 10,    // Espacio vertical
    paddingHorizontal: 20,  // Espacio horizontal
    backgroundColor: AppColors.white,
    borderTopWidth: 1,
    borderTopColor: AppColors.tabIconDefault,
    gap: 10, // Espacio automático entre botones
    marginBottom: 50, // Eleva el footer para darle más aire en la parte inferior
  },
  sectionBox: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.tabIconDefault,
    padding: 12,
    marginBottom: 16,
  },

  // --- Tipografía ---
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: AppColors.text,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: AppColors.text,
    marginTop: 10,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: AppColors.text,
    fontWeight: 'bold',
  },
  bodyText: {
    fontSize: 16,
    color: AppColors.text,
  },
  helperText: {
    fontSize: 14,
    color: AppColors.icon,
    marginTop: 6,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: AppColors.icon,
  },

  // --- Botones ---
  button: {
    flex: 1, // Permite que el botón crezca para ocupar el espacio disponible
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPrimary: {
    backgroundColor: AppColors.primary,
  },
  buttonSecondary: {
    backgroundColor: AppColors.secondary,
  },
  buttonCancel: {
    backgroundColor: AppColors.icon, // Un gris estándar
  },
  buttonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoButton: {
    backgroundColor: AppColors.secondary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  photoButtonDisabled: {
    backgroundColor: '#adb5bd',
  },

  // --- Formularios ---
  input: {
    height: 40,
    borderColor: AppColors.tabIconDefault,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: AppColors.white,
    marginBottom: 12,
    fontSize: 16,
    color: AppColors.text,
  },
  conditionalContainer: { marginTop: 10, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  inputDisabled: {
    backgroundColor: '#f7f7f7',
    color: '#666',
    borderColor: '#ddd',
  },

  // --- Tarjetas (Cards) ---
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: AppColors.tabIconDefault,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: AppColors.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: AppColors.icon,
  },

  // --- Imágenes ---
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
});
