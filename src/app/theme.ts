import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const ConsoleTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff7e8',
      100: '#ffe5bd',
      200: '#ffd28a',
      300: '#ffbf63',
      400: '#ffb13c',
      500: '#ffa733',
      600: '#dc7e12',
      700: '#aa5f0b',
      800: '#754309',
      900: '#442807',
      950: '#1d1104',
    },
    borderRadius: {
      none: '0',
      xs: '0',
      sm: '0',
      md: '0',
      lg: '0',
      xl: '0',
    },
    focusRing: {
      width: '1px',
      style: 'solid',
      offset: '0',
    },
    colorScheme: {
      dark: {
        surface: {
          0: '#ffffff',
          50: '#eef6fb',
          100: '#dfe7ec',
          200: '#b9c7d3',
          300: '#9aa7b1',
          400: '#66747f',
          500: '#2c3742',
          600: '#1b232c',
          700: '#161d25',
          800: '#11161c',
          900: '#0c1014',
          950: '#06080b',
        },
        primary: {
          color: '#ffa733',
          contrastColor: '#1a1206',
          hoverColor: '#ffbf63',
          activeColor: '#dc7e12',
        },
        formField: {
          background: '#161d24',
          disabledBackground: '#0c1014',
          filledBackground: '#161d24',
          filledHoverBackground: '#1b232c',
          filledFocusBackground: '#1b232c',
          borderColor: 'rgba(255,167,51,.34)',
          hoverBorderColor: 'rgba(255,167,51,.55)',
          focusBorderColor: '#ffa733',
          invalidBorderColor: '#ff4d6a',
          color: '#f4f8fb',
          disabledColor: '#66747f',
          placeholderColor: '#8b99a4',
          floatLabelColor: '#8b99a4',
          floatLabelFocusColor: '#ffa733',
          floatLabelActiveColor: '#dfe7ec',
          floatLabelInvalidColor: '#ff4d6a',
          iconColor: '#ffa733',
          shadow: 'none',
        },
        content: {
          background: '#11161c',
          hoverBackground: '#161d25',
          borderColor: 'rgba(150,170,190,.13)',
          color: '#b9c7d3',
          hoverColor: '#f4f8fb',
        },
        overlay: {
          select: {
            background: '#11161c',
            borderColor: 'rgba(150,170,190,.24)',
            color: '#dfe7ec',
            shadow: 'none',
          },
          popover: {
            background: '#11161c',
            borderColor: 'rgba(150,170,190,.24)',
            color: '#dfe7ec',
            shadow: 'none',
          },
          modal: {
            background: '#11161c',
            borderColor: 'rgba(150,170,190,.24)',
            color: '#dfe7ec',
            shadow: 'none',
          },
        },
        text: {
          color: '#b9c7d3',
          hoverColor: '#f4f8fb',
          mutedColor: '#8b99a4',
          hoverMutedColor: '#dfe7ec',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        paddingX: '0.65rem',
        paddingY: '0.4rem',
        borderRadius: '0',
        raisedShadow: 'none',
      },
    },
    select: {
      root: {
        background: '#161d24',
        borderColor: 'rgba(255,167,51,.34)',
        borderRadius: '0',
        shadow: 'none',
      },
    },
    inputtext: {
      root: {
        borderRadius: '0',
      },
    },
    textarea: {
      root: {
        borderRadius: '0',
      },
    },
    message: {
      root: {
        borderRadius: '0',
      },
    },
    dialog: {
      root: {
        borderRadius: '0',
      },
    },
  },
})

export default ConsoleTheme
