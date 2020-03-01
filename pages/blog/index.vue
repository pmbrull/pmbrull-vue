<template>
  <PostList class="mt-6" :isPaginated="true" :postsPerPage="10" />
</template>

<script>
import PostList from "~/components/PostList";

export default {
  components: {
    PostList
  }
};
</script>
