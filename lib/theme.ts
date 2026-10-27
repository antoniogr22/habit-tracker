import { Platform, type ViewStyle } from 'react-native';

/** Sombra suave multiplataforma: boxShadow na web, shadow/elevation no nativo. */
const shadow = (opacity: number, radius: number, y: number): ViewStyle =>
  Platform.OS === 'web'
    ? { boxShadow: `0px ${y}px ${radius * 2}px rgba(22, 36, 30, ${opacity})` }
    : {
        shadowColor: '#16241E',
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: y },
        elevation: Math.max(1, Math.round(y / 2)),
      };

export const theme = {
  colors: {
    bg: '#F2F4EF',
    surface: '#FFFFFF',
    ink: '#16241E',
    muted: '#66756D',
    line: '#E3E8E1',
    primary: '#1E6B52',
    primarySoft: '#DCEBE4',
    accent: '#D98A1F',
    accentSoft: '#FBF0DC',
    danger: '#B3402F',
    dangerSoft: '#FBECE9',
    dangerLine: '#EDC3BC',
  },
  radius: { sm: 10, md: 14, lg: 22, xl: 28 },
  space: (n: number) => n * 4,
  /** Largura máxima do conteúdo (e da barra de abas) em telas grandes. */
  layout: { maxWidth: 640 },
  shadow: {
    card: shadow(0.07, 10, 4),
    floating: shadow(0.14, 16, 8),
  },
};
