import { createVuetify } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';


import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { PurpleTheme } from '../theme/LightTheme';

const vuetify = createVuetify({
  components,
  directives,
  defaults: {
    VBtn: {},
    VCard: {
      rounded: 'md'
    },
    VTextField: {
      rounded: 'lg'
    },
    VTooltip: {
      location: 'top'
    }
  },
  theme: {
    themes: {
      light: {
        colors: {
          containerBg: '137, 135, 135'
        }
      }
    },
    defaultTheme: 'PurpleTheme',
    themes: {
      PurpleTheme
    }
  }
});


export default vuetify;

