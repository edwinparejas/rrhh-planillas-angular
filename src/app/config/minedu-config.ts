import { MineduConfig } from '@minedu/types/minedu-config';

export const mineduConfig: MineduConfig = {
    colorTheme: 'theme-default',
    customScrollbars: true,
    layout: {
        style: 'minedu-vertical-layout-1',
        width: 'fullwidth',
        navbar: {
            primaryBackground: 'minedu-navy-700',
            secondaryBackground: 'minedu-navy-900',
            folded: true,
            hidden: false,
            position: 'left',
            variant: 'vertical-style-1'
        },
        toolbar: {
            customBackgroundColor: true,
            background: 'accent',
            hidden: false,
            position: 'below-static'
        },
        footer: {
            customBackgroundColor: true,
            background: 'minedu-white',
            hidden: false,
            position: 'below-fixed'
        },
        sidepanel: {
            hidden: false,
            position: 'right'
        }
    }
};

export const mineduInicioConfig: MineduConfig = {
    colorTheme: 'theme-default',
    customScrollbars: true,
    layout: {
        style: 'minedu-vertical-layout-1',
        width: 'fullwidth',
        navbar: {
            primaryBackground: 'minedu-navy-700',
            secondaryBackground: 'minedu-navy-900',
            folded: false,
            hidden: false,
            position: 'left',
            variant: 'vertical-style-1'
        },
        toolbar: {
            customBackgroundColor: true,
            background: 'accent',
            hidden: false,
            position: 'below-static'
        },
        footer: {
            customBackgroundColor: true,
            background: 'minedu-white',
            hidden: false,
            position: 'below-fixed'
        },
        sidepanel: {
            hidden: false,
            position: 'right'
        }
    }
};

