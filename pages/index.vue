<template>
  <div>
    <SiteHero class="mt-4"/>
    <PostList class="mt-4" :isPaginated="false" :postsPerPage="2"/>
  </div>
</template>

<script>
import SiteHero from "~/components/SiteHero";
import PostList from "~/components/PostList";

export default {
  components: {
    SiteHero,
    PostList,
  }
};
</script>


<style>
</style>
