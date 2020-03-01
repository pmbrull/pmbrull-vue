<template>
  <div class="flex flex-col min-h-screen bg-gray-300">
    <div class="px-12 flex-grow lg:container">
      <nuxt />
    </div>
    <SiteFooter class="mt-6" />
  </div>
</template>

<script>
import SiteFooter from '~/components/SiteFooter';

export default {
  components:{
    SiteFooter
  }
}
</script>
