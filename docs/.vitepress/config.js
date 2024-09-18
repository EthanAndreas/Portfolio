import { defineConfig } from 'vitepress'

export default defineConfig({

  title: "Ethan Huret",
  description: "Project presentation website in Vitepress",
  lang: 'en-US',
  base: '/Portfolio/',
  theme: 'material-theme-palenight',
  lineNumbers: true,
  rewrites: [
    { from: '/projects', to: '/projects/index.md' },
  ],

  themeConfig: {
    logo: {
      light: 'img/logo_blue.svg',
      dark: 'img/logo_orange.svg'
    },

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects/index.md' },
      { text: 'About me', link: '/about' }
    ],

    sidebar: {
      '/projects': [
        {
          text: 'Projects',
          link: '/projects',
          collapsed: false,
          items: [
            { text: 'Cloud application deployment', link: '/projects/cloudappdeployment'},
            { text: 'Pacman game in with SDL library', link: '/projects/pacmancpp' },
            { text: 'Network frame filter', link: '/projects/networkframefilter' },
            { text: 'Sos to Mips compiler', link: '/projects/sos2mips' },
            { text: 'Terminal-integrated Chess game', link: '/projects/chessgamecpp' },
            { text: 'TSCH and Orchestra benchmark', link: '/projects/tschorchestra' },
            { text: 'SDN project with P4 and Python', link: '/projects/rapace' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EthanAndreas' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/ethan-huret/' },
    ],

    footer: {
      message: 'Released under the GNU General Public License.',
      copyright: '© 2023 Ethan Huret, all rights reserved. <a href=/Portfolio/policy>Privacy policy.</a>',
    },
  }
})
