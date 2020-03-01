<template>
  <div class="container mx-auto px-4"> 
                
      <section class="p-4">
        <div class="flex flex-wrap -mx-10 ml-12">
          <div class="md:w-1/4 mt-12 w-full">
            <ProfileCard />
          </div>
          <div class="md:w-3/4 py-4 md:px-10 mb-4 md:mb-0">
            <SiteHero class="mt-4"/>
            <PostList class="mt-4" :isPaginated="false" :postsPerPage="2"/>
          </div>
        </div>
      </section>
    </div>
</template>

<script>
import SiteHero from "~/components/SiteHero";
import PostList from "~/components/PostList";
import ProfileCard from "~/components/ProfileCard"

export default {
  layout: 'home',
  components: {
    SiteHero,
    PostList,
    ProfileCard,
  }
};
</script>


<style>
</style>
