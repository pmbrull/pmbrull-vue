<template>
<div class="rounded rounded-t-lg overflow-hidden shadow my-10 bg-gray-200">
    <!-- Photo by Fabrizio Conti on Unsplash -->
  	<img :src="require(`~/assets/${background}`)" class="w-full" />
    <div class="flex justify-center -mt-16">
        <img :src="require(`~/assets/${bio}`)"
             class="h-32 rounded-full mx-auto border-solid border-white border-2 -mt-3">		
    </div>
	<div class="text-center px-3 pb-6 pt-2">
		<h3 class="text-black text-base bold font-sans">{{ name }}</h3>
		<p class="mt-2 font-sans font-light text-grey-dark">{{ intro }}</p>
	</div>
  <div class="text-center px-3 pb-6 pt-2">
    <div v-for="page in pages"
         :key="page">
      <a class="font-semibold hover:underline text-gray-700"
         :href="toUrl(page)">
       {{ page }}
    </a>
    </div>
    
  </div>
</div>
</template>

<script>
export default {
  data() {
      return {
          name: "Pere Miquel Brull",
          intro: "Mathematician | Big Data Developer",
          bio: "images/profile/bio.png",
          background: "images/profile/background.jpg",
          pages: ['About', 'Posts', 'Resume']
      };
  },
  methods: {
    toUrl(s) {
      return '/' + s.toLowerCase() + '/'
    }
  }
};
</script>