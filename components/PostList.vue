<template>
  <section>
    <h3 class="font-bold text-3xl lg:text-4xl text-gray-800 px-3 mt-6 mb-4">
      Latest posts
    </h3>
    <article
      v-for="(post,key) in bloglist" :key="key"
      :class="key == bloglist.length -1 ? '' : 'mb-1'"
      class="ml-10"
    >
      <div>
        <a class="text-xl font-semibold hover:underline text-blue-600"
           :href="`/post/${post.slug}`">
          {{ post.title }}
        </a>
        <p class="mt-1 text-sm text-gray-700">{{ post.description }}</p>
        <p class="mt-1 text-sm text-blue-600">Published on {{ post.ctime }}</p>
      </div>
    </article>
    <div
      v-if="$store.state.bloglist.length > postsPerPage && !isPaginated"
      class="px-3"
    >
    </div>
  </section>
</template>

<script>
export default {
  computed: {
    bloglist() {
      if ( ! this.isPaginated ) {
        return this.$store.state.bloglist.slice(0,this.postsPerPage);
      } else {
        return this.$store.state.bloglist;
      }
    },
    totalPages() {
      return this.isPaginated ? Math.ceil(this.$store.state.bloglist.length / this.postsPerPage) : 1
    }
  },
  props: {
    isPaginated: Boolean,
    postsPerPage: Number
  }
};
</script>
