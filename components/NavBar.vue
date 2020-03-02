<template>
  <nav class="flex items-center justify-between flex-wrap bg-blue-500 p-4">
    <div class="flex items-center flex-shrink-0 text-white mr-6">
      <!-- svg? -->
      <span class="font-semibold text-xl tracking-tight">pmbru\\</span>
    </div>
    <div class="block lg:hidden"  @click="open = !open">
      <button class="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
        <svg class="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z"/></svg>
      </button>
    </div>
    <div :class="open ? 'block': 'hidden'" class="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
      <div>
        <div class="text-sm lg:flex-grow">
          <a  v-for="page in pages"
            :key="page" :href="toUrl(page)"
            class="block mt-4 lg:inline-block lg:mt-0 text-teal-200 hover:text-white mr-8">
            {{ page }}
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "Navbar",
  data() {
    return {
      open: true,
      pages: ['Home', 'Posts', 'About', 'Resume']
    }
  },
  methods: {
    toUrl(s) {
      return (s === 'Home') ? '/' : '/' + s.toLowerCase() + '/'
    }
  }
};
</script>
