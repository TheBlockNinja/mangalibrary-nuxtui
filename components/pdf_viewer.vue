<template>
  <v-dialog
    transition="dialog-top-transition"
    max-height="30%"
    v-model="show"

  >
    <template v-slot:default="showDialog" >
      <v-btn
        small
        elevation="2"
        fab
        absolute
        @click="showDialog.value = false"
        class="justify-right"
        color="primary"
        style="transform: translate(850%, -50%);"
      >
        <v-icon small>mdi-close</v-icon>
      </v-btn>
      <v-card :style="`margin-right: auto;margin-left: auto;width: ${imageHeight}; touch-action: none;`" max-height=30%>

        <v-toolbar
          color="primary"
          dark
          style="text-align: center;font-size: 15px"
        >

          <v-row no-gutters>
            <v-col>{{pdfBook.name}} </v-col>
            <v-col :cols="3" flex v-if="pdfBook.chapter !== ''" style="font-size: 12px">
              {{pdfBook.chapter}}
            </v-col>
            <v-col>
              <v-btn @click="refresh()"><v-icon>mdi-refresh</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-toolbar>


        <v-card class="justify-center" style="alignment: center;text-align: center;">
          <v-container>
            <v-col>
              <v-card>
                <div v-if="loadedRatio > 0 && loadedRatio < 1" style="background-color: cyan; color: white; text-align: center" :style="{ width: loadedRatio * 100 + '%' }">{{ Math.floor(loadedRatio * 100) }}%</div>
                <v-card style="text-align: center;margin-left: auto;margin-right: auto" class="justify-center" >
                  <pdf class="justify-center"  v-if="show" ref="pdf" style="border: 1px solid black;alignment: center" :src="currentPDF" :page="page" :rotate="rotate" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event"></pdf>
                  <button @click="(page > 1 )? getPrevPage() : prevBook()" style="position:absolute;width: 50%;height:100%;background-color: transparent;transform: translate(-100%, -100%);"></button>
                  <button @click="(page < numPages)? getNextPage() : nextBook()" style="position:absolute;width: 50%;height:100%;background-color:transparent;transform: translate(-0%, -100%);"></button>
                  <v-col>{{page}}/{{numPages}}</v-col>
                </v-card>
              </v-card>
            </v-col>
          </v-container>
        </v-card>
      </v-card>
    </template>
  </v-dialog>
</template>

<script>
import pdf from "vue-pdf";

export default {
  name: "pdf_viewer",
  components: {
    pdf,
  },
  props: ['pdfBook','show'],
  data(){
    return {
      currentPDF:"",
      subBooks:[],
      src:'',
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      error:""
    }
  },
  computed:{
    currentUser(){
      return this.$store.state.login.currentUser
    },
    imageHeight () {
      switch (this.$vuetify.breakpoint.name) {
        case 'xs': return '100%'
        case 'sm': return '100%'
        case 'md': return '40%'
        case 'lg': return '40%'
        case 'xl': return '40%'
      }
    },
  },
  watch:{
    pdfBook(){
      this.selectBookPDF(this.pdfBook)
    }
  },
  mounted() {
    this.refresh()
  },
  methods:{
    getNextPage(){
      this.page += 1
      this.updateItemToDefaultCollection()
    },
    getPrevPage(){
      this.page -= 1
      this.updateItemToDefaultCollection()
    },
    addItemToDefaultCollection(){
      return this.$axios.post("/v2/library/new",{
          book_id:this.pdfBook.id,
          collection:"default",
          progress:1,
          rating:0,
          favorite:false,
        },
        {
          headers: {"Authentication-Key":this.currentUser.api_key}
        },)
        .then(res => {
          console.log(res.data.data)
        }).catch( error =>{
            this.updateItemToDefaultCollection()
            //this.newNotification("failed adding item",'error')
          }
        )
    },
    updateItemToDefaultCollection(){
      return this.$axios.post("/v2/library/collections/items",{
          book_id:this.pdfBook.id,
          collection:"default",
          progress:this.page,
          rating:0,
          favorite:false,
        },
        {
          headers: {"Authentication-Key":this.currentUser.api_key}
        },)
        .then(res => {
          console.log(res.data.data)
        }).catch( error =>{
            //this.newNotification("failed adding item",'error')
          }
        )
    },
    nextBook(){
      var index = -1
      for(var i = 0; i < this.subBooks.length; i += 1) {
        if(this.subBooks[i]['chapter'] === this.pdfBook.chapter) {
          index = i
          break
        }
      }
      console.log(index)
      if (index > -1 && index < this.subBooks.length && index > 0){
        this.page = 1
        this.selectBookPDF(this.subBooks[index - 1])
      }
      if (this.pdfBook.pages <= this.page + 1){
        this.nextBook()
      }
    },
    prevBook(){
      var index = -1
      for(var i = 0; i < this.subBooks.length; i += 1) {
        if(this.subBooks[i]['chapter'] === this.pdfBook.chapter) {
          index = i
          break
        }
      }
      console.log(index)
      if (index > -1 && index < this.subBooks.length -1){
        this.selectBookPDF(this.subBooks[index + 1])
        this.page = 1
      }
    },
    refresh(){
      if (this.doesHaveVolumes(this.pdfBook)){
        this.getAllBooks(this.pdfBook)
      }
      this.selectBookPDF(this.pdfBook)
    },
    selectBookPDF(book){
      let url = "http://192.168.1.124:8080/v2/books/pdf?api_key="+this.currentUser.api_key+"&book="+book.name
      if (book.chapter !== ""){
        url += "&chapter="+book.chapter
      }
      if (book.volume !== ""){
        url += "&volume="+book.volume
      }

      // url += "&refresh=true"

      url += "&type=pdf"
      url += "&send_file=true"
      //url += "&download=true"
      console.log(encodeURI(url))
      this.currentPDF = encodeURI(url)
      if (this.pdfBook === book){
        this.page = 1
        this.getCollectionsBook()
      }

      this.page = 1
      this.pdfBook = book
      this.getCollectionsBook()
      if (this.page === 1){
        this.addItemToDefaultCollection()
      }

    },
    getCollectionsBook(){
      return this.$axios.post("/v2/library/collections/book",{
        book_id:this.pdfBook.id
      },{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log(res.data.data)
          this.page = res.data.data.progress
        }).catch( error =>{
            //this.newNotification("failed getting collections",'error')
          }
        )
    },
    doesHaveVolumes(book){
      if (book.chapter !== "" || book.volume !== ""){
        return true
      }
      return false
    },
    getAllBooks(bookName){
      return this.$axios.post("/v2/books/name",{
        name: bookName.name.toString()
      },{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log("SUBBOOKS")
          console.log(res.data.data)
          this.subBooks = res.data.data
        }).catch( error =>{
          console.log(error)
            //this.newNotification("failed getting chapters",'error')
          }
        )
    },
  }
}
</script>

<style scoped>

</style>
