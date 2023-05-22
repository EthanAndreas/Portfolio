import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Ethan Andreas",
  description: "Project presentation website in Vitepress",
  themeConfig: {
    nav: [
      { text: 'Home', link: '/VitePressWebsite/' },
      { text: 'Projects', link: '/VitePressWebsite/projects' }
    ],

    sidebar: [
      {
        text: 'Projects',
        link: '/projects',
        items: [
          { text: 'Sos2Mips', link: '/VitePressWebsite/projects/sos2mips' },
          { text: 'NetworkFrameFilter', link: '/VitePressWebsite/projects/networkframefilter' },
          { text: 'PacmanCpp', link: '/VitePressWebsite/projects/pacmancpp' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/EthanAndreas' }
    ],

    search: {
      provider: 'algolia',
    }
  }
})
