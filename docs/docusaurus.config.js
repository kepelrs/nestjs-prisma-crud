const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'nestjs-prisma-crud',
  tagline: 'Quick crud apps with NestJS and Prisma',
  url: 'https://kepelrs.github.io',
  baseUrl: '/nestjs-prisma-crud/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  // favicon: 'img/favicon.ico',
  organizationName: 'kepelrs', // Usually your GitHub org/user name.
  trailingSlash: false,
  projectName: 'nestjs-prisma-crud', // Usually your repo name.
  themeConfig: {
    navbar: {
      title: 'nestjs-prisma-crud',
      // logo: {
      //   alt: 'nestjs-prisma-crud Logo',
      //   src: 'img/logo.svg',
      // },
      items: [
        {
          type: 'doc',
          docId: 'intro',
          position: 'left',
          label: 'Docs',
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        {
          type: 'docsVersionDropdown',
        },
        {
          href: 'https://github.com/kepelrs/nestjs-prisma-crud',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      // links: [
      //   {
      //     title: 'Docs',
      //     items: [
      //       {
      //         label: 'Docs',
      //         to: '/docs/intro',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'Community',
      //     items: [
      //       {
      //         label: 'Stack Overflow',
      //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
      //       },
      //       {
      //         label: 'Discord',
      //         href: 'https://discordapp.com/invite/docusaurus',
      //       },
      //       {
      //         label: 'Twitter',
      //         href: 'https://twitter.com/docusaurus',
      //       },
      //     ],
      //   },
      //   {
      //     title: 'More',
      //     items: [
      //       {
      //         label: 'Blog',
      //         to: '/blog',
      //       },
      //       {
      //         label: 'GitHub',
      //         href: 'https://github.com/kepelrs/nestjs-prisma-crud',
      //       },
      //     ],
      //   },
      // ],
      copyright: `Copyright © ${new Date().getFullYear()} nestjs-prisma-crud. Built with Docusaurus.`,
    },
    prism: {
      theme: lightCodeTheme,
      darkTheme: darkCodeTheme,
    },
    algolia: {
      apiKey: 'c53ed6b37ae84621e6cb880e498345f9',
      indexName: 'nestjs-prisma-crud',

      // Optional: see docs
      // contextualSearch: true,

      // Optional: see docs
      // appId: 'YOUR_APP_ID',

      // Optional: Algolia search parameters
      // searchParameters: {},

      //... other Algolia params
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl:
            'https://github.com/kepelrs/nestjs-prisma-crud/edit/master/docs/',
            routeBasePath: '/',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/kepelrs/nestjs-prisma-crud/edit/master/website/blog/',
        // },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  plugins: [
    function (context, options) {
      return {
        name: 'plausible',
        injectHtmlTags({content}) {
          return {
            headTags: [
              {
                tagName: 'script',
                attributes: {
                  async: true,
                  defer: true,
                  'data-domain': 'kepelrs.github.io',
                  src: 'https://stats.arockhub.com/js/plausible.js',
                },
              },
              {
                tagName: 'meta',
                attributes: {
                  name: 'google-site-verification',
                  content: 'kEP1DLqvGgE4HgyhXdvoOyfnVsXlNef1BRLCYecLDms',
                },
              },
            ],
          };
        },
      };
    }
  ]
};
