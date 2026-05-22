import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const ConsoleTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eaf2fb',
      100: '#cfe0f4',
      200: '#a4c4e8',
      300: '#79a8db',
      400: '#5e95d2',
      500: '#4b8bd6',
      600: '#3d76b8',
      700: '#316195',
      800: '#264c75',
      900: '#1c3958',
      950: '#11233a',
    },
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '2px',
      md: '2px',
      lg: '2px',
      xl: '2px',
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
          50: '#d6dbe1',
          100: '#a8b0bb',
          200: '#7a8593',
          300: '#5a6472',
          400: '#3e4651',
          500: '#2e343c',
          600: '#23272e',
          700: '#1a1f26',
          800: '#13171c',
          900: '#0f1216',
          950: '#0b0d10',
        },
        primary: {
          color: '#4b8bd6',
          contrastColor: '#0b0d10',
          hoverColor: '#5e95d2',
          activeColor: '#3d76b8',
        },
        formField: {
          background: '#13171c',
          disabledBackground: '#0f1216',
          filledBackground: '#1a1f26',
          filledHoverBackground: '#22272e',
          filledFocusBackground: '#22272e',
          borderColor: '#2e343c',
          hoverBorderColor: '#3e4651',
          focusBorderColor: '#4b8bd6',
          invalidBorderColor: '#c0392b',
          color: '#d6dbe1',
          disabledColor: '#5a6472',
          placeholderColor: '#7a8593',
          floatLabelColor: '#7a8593',
          floatLabelFocusColor: '#4b8bd6',
          floatLabelActiveColor: '#a8b0bb',
          floatLabelInvalidColor: '#c0392b',
          iconColor: '#7a8593',
          shadow: 'none',
        },
        content: {
          background: '#13171c',
          hoverBackground: '#1a1f26',
          borderColor: '#23272e',
          color: '#d6dbe1',
          hoverColor: '#f1f3f5',
        },
        overlay: {
          select: {
            background: '#13171c',
            borderColor: '#2e343c',
            color: '#d6dbe1',
            shadow: 'none',
          },
          popover: {
            background: '#13171c',
            borderColor: '#2e343c',
            color: '#d6dbe1',
            shadow: 'none',
          },
          modal: {
            background: '#13171c',
            borderColor: '#2e343c',
            color: '#d6dbe1',
            shadow: 'none',
          },
        },
        text: {
          color: '#d6dbe1',
          hoverColor: '#f1f3f5',
          mutedColor: '#7a8593',
          hoverMutedColor: '#a8b0bb',
        },
      },
    },
  },
  components: {
    button: {
      root: {
        paddingX: '0.65rem',
        paddingY: '0.4rem',
        borderRadius: '2px',
        raisedShadow: 'none',
      },
    },
    select: {
      root: {
        background: '#13171c',
        borderColor: '#2e343c',
        borderRadius: '2px',
        shadow: 'none',
      },
    },
    inputtext: {
      root: {
        borderRadius: '2px',
      },
    },
    textarea: {
      root: {
        borderRadius: '2px',
      },
    },
    message: {
      root: {
        borderRadius: '2px',
      },
    },
    dialog: {
      root: {
        borderRadius: '2px',
      },
    },
  },
})

export default ConsoleTheme
