import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Ethan Andreas",
  description: "Project presentation website in Vitepress",
  lang: 'en-US',
  base: '/lab/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects' }
    ],

    sidebar: [
      {
        text: 'Projects',
        link: '/projects',
        items: [
          { text: 'Sos2Mips', link: '/projects/sos2mips' },
          { text: 'NetworkFrameFilter', link: '/projects/networkframefilter' },
          { text: 'PacmanCpp', link: '/projects/pacmancpp' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EthanAndreas' }
    ]
  }
})
