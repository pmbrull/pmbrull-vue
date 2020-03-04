<template>
  <PostList class="mt-6 px-16" :isPaginated="true" :postsPerPage="10" />
</template>

<script>
import PostList from "~/components/PostList";

export default {
  components: {
    PostList
  }
};
</script>
