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
      { text: 'Guide', link: '/guide/what-is-yuyucode' },
      { text: 'Features', link: '/features/' },
      { text: 'Reference', link: '/reference/slash-commands' },
      { text: 'FAQ', link: '/faq' },
      {
        text: 'v4.4.2',
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
            { text: 'How-to Examples', link: '/guide/how-to' },
          ],
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/guide/architecture' },
            { text: 'Agent Loop', link: '/guide/agent-loop' },
            { text: 'State Architecture', link: '/guide/state-architecture' },
            { text: 'System Prompt', link: '/guide/system-prompt' },
            { text: 'YuyuServer', link: '/guide/yuyu-server' },
          ],
        },
        {
          text: 'Configuration',
          items: [
            { text: 'YUYU.md', link: '/guide/yuyu-md' },
            { text: 'Skills', link: '/guide/skills' },
            { text: 'AI Providers', link: '/guide/ai-providers' },
            { text: 'Themes', link: '/guide/themes' },
            { text: 'MCP Integration', link: '/guide/mcp' },
          ],
        },
        {
          text: 'Internals',
          items: [
            { text: 'Memory System', link: '/guide/memory' },
            { text: 'Growth & Gamification', link: '/guide/growth' },
            { text: 'Codebase Tools', link: '/guide/codebase-tools' },
            { text: 'yugit', link: '/guide/yugit' },
          ],
        },
        {
          text: 'Development',
          items: [
            { text: 'Patterns', link: '/guide/patterns' },
            { text: 'Testing & Benchmarks', link: '/guide/testing' },
            { text: 'CI/CD', link: '/guide/ci-cd' },
          ],
        },
        {
          text: 'Help',
          items: [
            { text: 'Troubleshooting', link: '/guide/troubleshooting' },
            { text: 'FAQ', link: '/faq' },
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
