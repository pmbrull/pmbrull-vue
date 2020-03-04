<template>
<div class="px-16">
  <PostList class="mt-6" :isPaginated="true" :postsPerPage="10" />
</div>
</template>

<script>
import PostList from "~/components/PostList";

export default {
  components: {
    PostList
  }
};
</script>