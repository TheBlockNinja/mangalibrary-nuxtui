<template>
  <v-img :src="getCover(book)">
    <template v-slot:placeholder>
      <v-row
        class="fill-height ma-0"
        align="center"
        justify="center"
      >
        <v-progress-circular indeterminate color="grey lighten-5"></v-progress-circular>
      </v-row>
    </template>
  </v-img>
</template>

<script>
export default {
name: "book-image",
  computed: {
    currentUser() {
      return this.$store.state.login.currentUser
    },
  },
  props:["book"],
  data(){
  return{

  }
  },
  methods:{
    getCover(book){
      let url = "http://192.168.1.124:8080/v2/books/cover?api_key="+this.currentUser.api_key+"&book="+book.name+"&image="+book['cover_img']
      if (book.chapter !== ""){
        url += "&chapter="+book.chapter
      }
      if (book.volume !== ""){
        url += "&volume="+book.volume
      }
      return encodeURI(url)
    },
  },
}
</script>

<style scoped>

</style>
