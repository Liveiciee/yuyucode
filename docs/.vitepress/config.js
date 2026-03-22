import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'YuyuCode',
  description: 'A full agentic coding assistant. Built entirely on an Android phone.',
  base: process.env.NODE_ENV === 'production' ? '/yuyucode/' : '/',

  head: [
    ['link', { rel: 'icon', href: '/yuyucode/icon.svg' }],
  ],

  themeConfig: {
    logo: '/icon.svg',
    siteTitle: 'YuyuCode',

    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Features', link: '/features/' },
      { text: 'Reference', link: '/reference/slash-commands' },
      { text: 'FAQ', link: '/faq' },
      {
        text: 'v4.2.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'Roadmap', link: '/roadmap' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is YuyuCode?', link: '/guide/what-is-yuyucode' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ],
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/guide/architecture' },
            { text: 'Agent Loop', link: '/guide/agent-loop' },
            { text: 'YuyuServer', link: '/guide/yuyu-server' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'YUYU.md', link: '/guide/yuyu-md' },
            { text: 'AI Providers', link: '/guide/ai-providers' },
            { text: 'CI/CD', link: '/guide/ci-cd' },
          ],
        },
      ],
      '/features/': [
        {
          text: 'Features',
          items: [
            { text: 'Overview', link: '/features/' },
            { text: 'Code Editor', link: '/features/editor' },
            { text: 'Agent System', link: '/features/agents' },
            { text: 'Diff Review', link: '/features/diff-review' },
            { text: 'Brightness Compensation', link: '/features/brightness' },
          ],
        },
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Slash Commands', link: '/reference/slash-commands' },
            { text: 'Configuration (/config)', link: '/reference/config' },
            { text: 'Action Types', link: '/reference/action-types' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/liveiciee/yuyucode' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Built on a phone · for a phone · with love 🌸',
    },

    search: {
      provider: 'local',
    },
  },
})
