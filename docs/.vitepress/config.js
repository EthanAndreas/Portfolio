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

    logo: 'img/logo.png',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects/index.md' },
      { text: 'About me', link: '/about' }
    ],

    sidebar: [
      {
        text: 'Projects',
        link: '/projects',
        items: [
          { text: 'Sos2Mips', link: '/projects/sos2mips' },
          { text: 'NetworkFrameFilter', link: '/projects/networkframefilter' },
          { text: 'CloudAppDeployment', link: '/projects/cloudappdeployment' },
          { text: 'TSCH-OrchestraAnalysis', link: '/projects/tschorchestra' },
          { text: 'PacmanCpp', link: '/projects/pacmancpp' },
          { text: 'ChessGameCpp', link: '/projects/chessgamecpp' },
          { text: 'XMLParse-Hash', link: '/projects/xmlparsehash' },
          { text: 'TCPClientServer', link: '/projects/tcpclientserver' },
          { text: 'FTPClient', link: '/projects/ftpclient' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EthanAndreas' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/ethan-huret/' },
    ],

    footer: {
      message: 'Released under the GNU General Public License.',
      copyright: '© 2023 Ethan Huret. All rights reserved.',
    },
  }
})
