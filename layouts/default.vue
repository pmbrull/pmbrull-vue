<template>
  <div class="flex flex-col min-h-screen bg-gray-300">
    <NavBar />
    <div class="max-w-4xl mx-auto px-12 lg:px-0 flex-grow lg:container">
      <nuxt />
    </div>
    <SiteFooter class="mt-6" />
  </div>
</template>

<script>
import NavBar from '~/components/NavBar';
import SiteFooter from '~/components/SiteFooter';

export default {
  components:{
    NavBar,
    SiteFooter
  },
  mounted() {
    let mathjaxScript = document.createElement('script')
    mathjaxScript.setAttribute('src', 'https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML')
    document.head.appendChild(mathjaxScript)

    let mathjaxScript2 = document.createElement('script')
    mathjaxScript2.setAttribute('src', 'https://vincenttam.github.io/javascripts/MathJaxLocal.js')
    document.head.appendChild(mathjaxScript2)

    let plotlyScript = document.createElement('script')
    plotlyScript.setAttribute('src', 'https://cdn.plot.ly/plotly-latest.min.js')
    document.head.appendChild(plotlyScript)
  }
}


</script>

