<template>
<div class="px-16">

  <h3 class="font-bold text-3xl text-center text-gray-800 px-3 mt-6 mb-4">
    Latest Posts
  </h3>

<div>
  <div class="mb-4">
    <ul class="flex align-center justify-center">
    <button class="py-1 px-3 m-4 rounded"
            v-for="cat in categories" :key="cat"
            :class="cat === postCategory ? 'text-white bg-blue-600 hover:bg-gray-300 hover:bg-blue-700'
                 :'text-blue-600 border border-blue-600 hover:bg-blue-700 hover:text-white hover:border-gray-300'"
            @click="changeCategory(cat)">
    {{ cat }}
    </button>
    </ul>
  </div>

  <hr/>
  </div>
  
  <PostList class="m-auto justify-center align-center mt-4" :isPaginated="false" :postsPerPage="100" :category="postCategory"/>
</div>
</template>

<script>
import PostList from "~/components/PostList";

export default {
  components: {
    PostList
  },
  data() {
    return {
      postCategory: "All",
      categories: ['All', 'Big Data', 'Machine Learning', 'Scala', 'Spark']
    }
  },
  methods: {
    changeCategory(toCategory) {
      this.postCategory = toCategory
    }
  }
};
</script>

<style>

hr {
    border: 0;
    height: 1px;
    background-image: linear-gradient(to right, rgba(177, 177, 177, 0), rgba(177, 177, 177, 0.75), rgba(177, 177, 177, 0));
}
</style>