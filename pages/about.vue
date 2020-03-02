<template>
  <div class="container mx-auto px-4">        
      <section class="p-4">
        <div class="flex flex-wrap -mx-10">
          <div class="md:w-1/3 mt-12 w-full p-6">
          <img :src="require(`~/assets/${maths}`)"
                alt="feeling"
                class="h-48">
          </div>
          <div class="md:w-1/3 mt-12 w-full p-6">
            <img :src="require(`~/assets/${world}`)"
                  alt="world"
                  class="h-40">
          </div>
          <div class="md:w-1/3 mt-12 w-full p-6">
            <img :src="require(`~/assets/${code}`)"
                  alt="code"
                  class="h-48">
          </div>
        </div>
        
      </section>
    </div>
</template>

<script>
// import SiteHero from "~/components/SiteHero";
export default {
  components: {
  },
  data() {
    return {
      feeling: "images/about/feeling.svg",
      world: "images/about/world.svg",
      code: "images/about/code.svg",
      maths: "images/about/maths.svg"
    }
  }
};
</script>


<style>
</style>
