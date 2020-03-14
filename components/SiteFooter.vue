<template>
  <footer class="text-center pb-2 pt-4 shadow-inner bg-gray-400">
    <div class="flex justify-center">
      <div v-for="(social,key) in socials" :key="key" :class="key === socials.length - 1 ? '' : 'mr-6'">
        <a :href="social.link" target="_blank" :aria-label="social.label" rel="noopener" class="text-gray-700 hover:text-gray-900">
          <font-awesome-icon class="text-2xl" :icon="[ 'fab' , social.icon ]" />
        </a>
      </div>
    </div>
    <div class="mt-2 text-sm text-gray-600">
      <p>Creat per pmbrull amb 
        <a rel="noopener" 
           class="font-semibold hover:underline text-gray-700" 
           href="https://nuxtjs.org/">
           Nuxtjs</a> + 
        <a rel="noopener" 
           class="font-semibold hover:underline text-gray-700"
           href="https://tailwindcss.com/">
           Tailwind CSS
        </a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      socials: [
        { link: "https://github.com/pmbrull", icon: "github" , label: "Check my Github profile" },
        { link: "www.linkedin.com/in/pere-miquel-brull-borràs", icon: "linkedin" , label: "Find me on Linkedin" },
      ]
    };
  }
};
</script>
