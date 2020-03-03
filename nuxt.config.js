//const pkg = require("./package");
const glob = require("glob");
const path = require("path");
let files = glob.sync("**/*.md", { cwd: "posts" });

// // only add `router.base = '/<repository-name>/'` if `DEPLOY_ENV` is `GH_PAGES`
// const routerBase = process.env.DEPLOY_ENV === 'GH_PAGES' ? {
//   router: { // Change for domain name
//     base: '/pmbrull-vue/'
//   }
// } : {}

function getSlugs(post, _) {
  let slug = post.substr(0, post.lastIndexOf("."));
  return `/blog/${slug}`;
}

module.exports = {
  mode: "universal",
  // router: routerBase,
  head: {
    title: "Home",
    titleTemplate: "%s - pmbruʎ",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "keywords",
        name: "keywords",
        content:
          "vuejs, nuxt, scala, python, machine-learning, big-data, docker, tailwindcss, tailwind"
      },
      { name: "robots", hid: "robots" , content: "index, follow" },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
    htmlAttrs: {
      lang: "en-GB"
    }
  },
  loading: false,
  server: {
    host: "0.0.0.0",
    port: 3000
  },
  css: ["~assets/tailwind.scss"],
  plugins: [],
  modules: [
    "@nuxtjs/google-analytics",
    "@nuxtjs/moment",
    [
      "@nuxtjs/sitemap",
      {
        hostname: 'https://pmbrull.com',
        gzip: true,
      }
    ],
    [
      "nuxt-fontawesome",
      {
        imports: [
          {
            set: "@fortawesome/free-brands-svg-icons",
            icons: ["fab"]
          }
        ]
      }
    ]
  ],
  googleAnalytics: {
    id: "TODO"
  },
  build: {
    postcss: {
      plugins: {
        tailwindcss: path.resolve(__dirname, './tailwind.config.js')
      }
    },
    extend(config, { isDev, isClient }) {
      config.module.rules.push({
        test: /\.md$/,
        use: ["raw-loader"]
      });
    }
  },
  generate: {
    routes: function() {
      return files.map(getSlugs);
    }
  }
};
