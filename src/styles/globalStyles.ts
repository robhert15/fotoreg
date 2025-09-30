import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

// Por defecto, usamos el tema claro. Esto se puede hacer dinámico en el futuro.
const AppColors = Colors.light;

export const globalStyles = StyleSheet.create({
  // --- Contenedores y Layout ---
  container: {
    flex: 1,
    backgroundColor: AppColors.white, // El nuevo diseño usa fondo blanco por defecto
  },
  // Estilo para el nuevo encabezado con gradiente
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Aumentado para SafeArea
    paddingBottom: 40,
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
    borderTopColor: AppColors.outline,
    gap: 10, // Espacio automático entre botones
    marginBottom: 50, // Eleva el footer para darle más aire en la parte inferior
  },
  sectionBox: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AppColors.outline, // usar outline token
    padding: 12,
    marginBottom: 16,
  },

  // --- Tipografía ---
  // Título grande para los encabezados de pantalla
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: AppColors.white,
  },
  // Título estándar para secciones
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
  // Input de formulario estándar
  input: {
    height: 50, // Altura aumentada para mejor toque
    borderColor: AppColors.borderColor,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: AppColors.background,
    marginBottom: 12,
    fontSize: 16,
    color: AppColors.text,
  },
  // Contenedor base para el contenido principal con efecto de solapamiento
  contentContainer: {
    flex: 1, // Asegura que ocupe el espacio disponible
    marginTop: -20, // Aumentado el solapamiento en 10px
    backgroundColor: AppColors.white,
    borderTopLeftRadius: 24, // Radio estándar original
    borderTopRightRadius: 24, // Radio estándar original
  },
    // Estilo específico para la sección de búsqueda (el padding horizontal lo controla la lista)
  searchSection: {
    paddingVertical: 20, // Mantiene el espaciado vertical interno
    marginBottom: -10, // Reduce el espacio antes de la lista
  },
  // Contenedor del input de búsqueda
  searchContainer: {
    justifyContent: 'center',
  },
  // Icono dentro del input de búsqueda
  searchIcon: {
    position: 'absolute',
    left: 18,
    zIndex: 1,
  },
  // Input de búsqueda estilizado
  searchInput: {
    height: 55,
    paddingLeft: 50, // Espacio para el icono
    paddingRight: 20,
    fontSize: 16,
    borderWidth: 2,
    borderRadius: 16,
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.outline, // sin sombras
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

    // Botón de Acción Flotante (FAB)
  fab: {
    position: 'absolute',
    bottom: 115, // Posición sobre la barra de navegación
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.primary,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
        shadowRadius: 4,
  },
  // Mini Botón de Acción Flotante (para acciones dentro de tarjetas)
  miniFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.secondary,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
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
