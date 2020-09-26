<template>
  <section class="px-3 mx-auto flex items-center">
    <div>
      <h1 class="inline text-4xl lg:text-5xl text-gray-800 font-bold">Hola!</h1>
      <p class="inline ml-4 lg:text-2xl text-gray-600">\ɔɫə\</p>
      <p class="font-medium text-gray-700">Welcome to my playground! 👋</p>
      <div class="text-sm text-gray-700 mt-2">
        <p>Here you will find {{ bloglistLen }} different posts (so far!).</p>
        <p>I like to write about Big Data, Cloud, ML, Python, Spark and Scala.</p>
      </div>

      <!-- <p class="font-medium text-gray-700">
        <ul class="align-center justify-center">
          <p v-for="cat in categories" :key="cat">
           {{ cat }} - {{ postsPerCat(cat) }}
          </p>
        </ul>
      </p>-->
    </div>
  </section>
</template>

<script>
export default {
  data() {
    return {
      categories: ["Big Data", "Cloud", "ML", "Python", "Scala", "Spark"],
    };
  },
  computed: {
    bloglistLen() {
      return this.bloglist().length;
    },
  },
  methods: {
    bloglist() {
      return this.$store.state.bloglist;
    },
    postsPerCat(category) {
      return this.bloglist().filter((post) => post.category === category)
        .length;
    },
  },
};
</script>
