<template>
  <div class="container mx-auto px-16"> 
                
      <section class="p-4">
        <div class="flex flex-wrap -mx-10 ml-auto">
          <div class="md:w-1/3 mt-12 w-full align-center">
            <ProfileCard />
          </div>
          <div class="md:w-2/3 w-full -mx-12 ml-auto align-center">
            <SiteHero class="mt-4"/>
            <h3 class="font-bold lg:text-3xl text-gray-800 px-3 mt-6 mb-4">
              Latest posts
            </h3>
            <PostList class="mt-4" :isPaginated="false" :postsPerPage="4" :category="category"/>
          </div>
        </div>
      </section>
    </div>
</template>

<script>
import SiteHero from "~/components/SiteHero";
import PostList from "~/components/PostList";
import ProfileCard from "~/components/ProfileCard";

export default {
  layout: 'home',
  components: {
    SiteHero,
    PostList,
    ProfileCard,
  },
  data() {
    return {
      category: "All"
    }
  }
};
</script>
