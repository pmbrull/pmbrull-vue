<template>
  <section :key="$route.params.post">
    <div class="px-16">
      <header class="mt-6">
        <h3 class="font-bold text-4xl text-gray-800">{{ attributes.title }}</h3>
        <blockquote class="border-l-4 border-gray-500 bg-gray-200 p-3 pl-4 my-4 italic">{{ attributes.description }}</blockquote>
        <p class="text-sm text-gray-500">
          Published on <time>{{require('moment')(attributes.ctime).format('YYYY/MM/DD')}}</time>
        </p>
        <!-- <figure v-if="attributes.cover_image">
          <img :src="require(`~/assets/images/posts/${attributes.cover_image}`)" :alt="attributes.cover_image_cp" loading="lazy"/>
        </figure> -->
      </header>
      <article class="markdown">
        <div class="mt-2" v-html="content"></div>
      </article>
      <div>
        <nuxt-link class="font-bold text-blue-600" to="/posts/">Back to posts</nuxt-link>
      </div>
    </div>
  </section>
</template>

<script>

const fm = require("front-matter");
const md = require("markdown-it")({
  html: true,
  typographer: true
}).use(require("markdown-it-highlightjs"), { auto: true })
  //.use(require('markdown-it-mathjax')());

export default {
  async asyncData({ params }) {
    const fileContent = await import(`~/posts/${params.post}.md`);
    let res = fm(fileContent.default);
    return {
      attributes: res.attributes,
      content: md.render(res.body)
    };
  },
  methods: {
    renderMathJax () {
      if(window.MathJax) {
        window.MathJax.Hub.Config({
          tex2jax: {
            inlineMath: [ ['$','$'], ["\(","\)"] ],
            displayMath: [ ['$$','$$'], ["\[","\]"] ],
            processEscapes: true,
            processEnvironments: true
          },
          // Center justify equations in code and markdown cells. Elsewhere
          // we use CSS to left justify single line equations in code cells.
          displayAlign: 'center',
          "HTML-CSS": {
            styles: {'.MathJax_Display': {"margin": 0}},
            linebreaks: { automatic: true }
          }
        });
        window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub,this.$refs.mathJaxEl]);
      }
    }
  },
  head() {
    return {
      title: this.attributes.title,
      meta: [
        {
          hid: "description",
          name: "description",
          content: this.attributes.description
        }
      ],
      script: [
        { src: 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.2/MathJax.js?config=TeX-AMS_HTML' },
        // { src: 'https://vincenttam.github.io/javascripts/MathJaxLocal.js' }
      ]
    };
  },
  mounted () {
    this.renderMathJax()
  }
};
</script>
