<template>
  <div class="container mx-auto px-16">      
    <h1 class="font-bold text-4xl text-gray-800 px-3 mt-6 mb-4 text-center">
      About me and this site...
    </h1>  
      <section class="p-4">
        <div class="flex flex-wrap -mx-10 justify-between">
          <div class="md:w-1/3 mt-12 w-full p-6">
            <img :src="require(`~/assets/${maths}`)"
                  alt="feeling"
                  class="h-48 justify-center m-auto">
            <p class="mt-1 text-sm text-gray-700 mt-6 m-auto text-center">
              As a Mathematician, everything is a puzzle! And working with data we have
              a ton of fancy pieces to solve what we have at our hands.
            </p>
          </div>
          <div class="md:w-1/3 mt-12 w-full p-6 m-auto pt-12">
            <img :src="require(`~/assets/${world}`)"
                  alt="world"
                  class="h-40 justify-center m-auto">
            <p class="mt-1 text-sm text-gray-700 mt-6 m-auto text-center pt-2">
              I always try to make our world a bit better. Let's recycle, share, smile
              and have fun! Let's make a change, we're people, not resources.
            </p>
          </div>
          <div class="md:w-1/3 mt-12 w-full p-6 m-auto">
            <img :src="require(`~/assets/${code}`)"
                  alt="code"
                  class="h-48 justify-center m-auto">
            <p class="mt-1 text-sm text-gray-700 mt-6 m-auto text-center">
              ... I just love coding! And with this site I'd want to share my experiences
              and work with all of you.
            </p>
          </div>
        </div>

      <div>
        <p class="mt-1 text-sm text-gray-700 mt-6 m-auto display-inline text-center">
          Finally, I am really curious and passionate about learning. I enjoy looking for new and elegant ways
          to achieve whatever I am working on, both at work and at home. <em>Let's push it to the limit! 
          Have we tried that? </em>
        </p>
        <p class="mt-1 text-sm text-gray-700 mt-6 m-auto display-inline text-center">
          With this blog I'll try to keep my head and ideas organized, while also being able to give back
          to the internet community a bit of content just in return for the thousands of hours spent in Stack Overflow!
        </p>
      </div>

      <div>
        <p class="mt-1 text-sm text-gray-700 mt-6 m-auto display-inline text-center">
         Regarding the blog itself... I started playing around with blogs around 2018.
         I started with a simple Jekyll theme hosted in Github pages, but it lacked the freedom
         I wanted to achieve. By then I was really in love with Scala - I still am - so I
         switched to Play Framework just pour le fun. I was happy with the result but I did not
         integrate any markdown in it as I wanted to mess with ScalaJS. In the end, writing
         was a bit cumbersome, so I thought about another change. I played a bit with a 47 Degree's
         project called microsites, which was really fast to spin up. But again, it did not
         offer much flexibility.

         Now, I just wanted to do something that i'd like the look and feel but that would
         be easy to push me to write new content. Therefore, I went directly to Javascript with
         VueJS and a Markdown plugin.

         I am no frontend developer, and it was not easy to get to this point, but it was indeed
         really fun. I hope you enjoy this as much as I did during all these years! 😍
        </p>
      </div>

      <div>
        <h1 class="font-bold text-lg text-gray-800 mt-10">Credits</h1>
        <div class="mt-2 text-sm text-gray-600">
          <ul class="list-disc">
            <li>
              The SVG illustrations come from
              <a rel="noopener" 
                class="font-semibold hover:underline text-gray-700"
                href="https://undraw.co/illustrations">
                unDraw
              </a>
            </li>
            <li>
              Profile banner is by Fabrizio Conti from
              <a rel="noopener" 
                class="font-semibold hover:underline text-gray-700"
                href="https://unsplash.com">
                Unsplash
              </a>
            </li>
          </ul>
          <p class="mt-4">Thanks for the coolest content!</p>
        </div>
      </div>
        
      </section>
    </div>
</template>

<script>
// import SiteHero from "~/components/SiteHero";
export default {
  components: {
  },
  data() {
    return {
      feeling: "images/about/feeling.svg",
      world: "images/about/world.svg",
      code: "images/about/code.svg",
      maths: "images/about/maths.svg"
    }
  }
};
</script>


<style>
</style>
