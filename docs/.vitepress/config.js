import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Ethan Andreas",
  description: "Project presentation website in Vitepress",
  lang: 'en-US',
  // base: '/portfolio/',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects/index.md' },
      { text: 'About me', link: '/about' }
    ],

    logo: 'assets/logo.webp',

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
      { icon: 'github', link: 'https://github.com/EthanAndreas' },
      { icon: 'linkedin', link: 'https://www.linkedin.com/in/ethan-huret/' },
    ]
  }


})
