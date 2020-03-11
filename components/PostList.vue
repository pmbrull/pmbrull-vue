<template>
  <section>
    <article
      v-for="(post,key) in bloglist" :key="key"
      :class="key == bloglist.length -1 ? '' : 'mb-1'"
      class="ml-10 mr-6 mt-4"
    >
      <div>
        <a class="text-2xl font-semibold hover:underline text-blue-600"
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
        return this.filterBlogList().slice(0,this.postsPerPage);
      } else {
        return this.filterBlogList()
      }
    },
    totalPages() {
      return this.isPaginated ? Math.ceil(this.filterBlogList().length / this.postsPerPage) : 1
    }
  },
  methods: {
    filterBlogList() {
      var rawBlogList = this.$store.state.bloglist
      var filteredBlogList = (this.category === "All") ? rawBlogList : rawBlogList.filter(post => post.category === this.category)
      return filteredBlogList
    }
  },
  props: {
    isPaginated: Boolean,
    postsPerPage: Number,
    category: {
        type: String,
        default: "All"
      }
  }
};
</script>
