<template>

  <v-container>
    <v-card v-for="n in notifications" :key="n.id">
      <v-alert
        dense
        prominent
        text
        :type="n.type"
      >{{n.message}} <v-btn small class="justify-right"><v-icon small>mdi-close</v-icon></v-btn></v-alert>
    </v-card>
    <v-row>
      <v-select
        v-model="searchSites"
        :items="sites.map(site => site.name).concat(['All'])"
        attach
        chips
        label="Chips"
        multiple
      ></v-select>
      <button @click="refresh" style="alignment: right"><v-icon medium color="primary">mdi-refresh</v-icon></button>
    </v-row>
    <v-row>

    <v-col>
      <v-card>
        <v-container fluid>
          <v-row>
            <v-col
              v-for="book in getBooksForSite(searchSites)"
              :key="book.id"
              class="child-flex"
              cols="3"
              sm="4" md="4" lg="4"
            >
              <v-card flat tile class="d-flex">

                <v-img :src="getCover(book)" :alt=book.name @click="selectBook(book)">
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
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
    </v-row>


      <v-dialog
        transition="dialog-top-transition"
        max-height="30%"
        v-model="showDialog"

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
              </v-row>
            </v-toolbar>


            <v-card class="justify-center" style="alignment: center;text-align: center;">
                <v-container>
                  <v-col>
                    <v-card>
                      <div v-if="loadedRatio > 0 && loadedRatio < 1" style="background-color: cyan; color: white; text-align: center" :style="{ width: loadedRatio * 100 + '%' }">{{ Math.floor(loadedRatio * 100) }}%</div>
                      <v-card style="text-align: center;margin-left: auto;margin-right: auto" class="justify-center" >
                        <pdf class="justify-center"  v-if="show" ref="pdf" style="border: 1px solid black;alignment: center" :src="currentPDF" :page="page" :rotate="rotate" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event"></pdf>
                        <button @click="(page > 1 )? page -= 1 : prevBook()" style="position:absolute;width: 50%;height:100%;background-color: transparent;transform: translate(-100%, -100%);"></button>
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
    <v-bottom-sheet hide-overlay v-model="showExpand" max-width="85%" :scrollable=true>

      <v-card class="justify-center" style="margin-left: auto;" >
        <v-btn
          class="justify-right"
          absolute
          fab
          @click="showExpand = false"
          style="transform: translate(550%, -550%);"
        >
          <v-icon medium color="cyan">mdi-close</v-icon>
        </v-btn>
            <v-card-title color="primary"><v-col>{{selectedBook.name}}</v-col>
            </v-card-title>
            <v-card-text>
            <v-row style="font-size: 10px;margin-left: auto" class="justify-center">
              <v-col>
                Views:{{selectedBook.views}}
              </v-col>
              <v-col>
                Downloads:{{selectedBook.downloads}}
              </v-col>
            </v-row>
             <p>{{selectedBook.description}}</p>
            <v-row v-if="doesHaveVolumes(selectedBook)">
              <v-data-table
                :items="subBooks"
                :items-per-page="10"
                :headers="subTableHeaders"
                dense
                dark
                style="margin-left: 20px">
                <template v-slot:item.actions="data">
                  <v-btn class="mx-2" fab dark small color="primary" @click="selectBookPDF(data.item);">
                    <v-icon dark>mdi-eye</v-icon>
                  </v-btn>
                  <v-btn class="mx-2" fab dark small color="primary" @click="downloadPDF(data.item)">
                    <v-icon dark>mdi-download</v-icon>
                  </v-btn>
                </template>
              </v-data-table>
            </v-row>
            </v-card-text>
            <v-card-actions>
              <v-row style="font-size: 10px;margin-left: auto">
                <v-col v-if="doesHaveVolumes(selectedBook)">
                  <v-btn><v-icon>mdi-return</v-icon></v-btn>
                </v-col>
                <v-col >
                  <v-btn @click="selectBookPDF(selectedBook)"><v-icon>mdi-eye</v-icon></v-btn>
                </v-col>
                <v-col>
                  <v-btn @click="downloadPDF(selectedBook)"><v-icon>mdi-download</v-icon></v-btn>
                </v-col>
              </v-row>
            </v-card-actions>

            <!--                  <pdf class="justify-center" v-if="show" ref="pdf" style="border: 1px solid black;alignment: center" :src="currentPDF" :page="page" :rotate="rotate" @progress="loadedRatio = $event" @error="error" @num-pages="numPages = $event"></pdf>-->
      </v-card>
    </v-bottom-sheet>
  </v-container>
</template>

<script>
import pdf from 'vue-pdf'

export default {
  name: "books",
  components: {
    pdf
  },
  computed:{
    currentUser(){
      return this.$store.state.login.currentUser
    },
    notifications(){
      return this.$store.state.login.notifications
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
  watch: {
    notifications(){
      if (this.notifications.length > 0){
        setTimeout(() => {
          this.$store.commit('login/removeNotification', this.notifications[0])
        }, this.notifications[0].time * 1000);

      }
    }
  },
  data(){
    return {
      selectedSubBook:0,
      subBooks:[],
      subTableHeaders:[
        {text:"Chapter",value:"chapter"},
        {text:"",value:"actions",sortable:false}
      ],
      searchSites:[],
      sites:[],
      currentPage: 0,
      pageCount: 0,
      books:[],
      selectedBook:{},
      resp:{},
      currentPDF:"",
      show: true,
      src:'',
      loadedRatio: 0,
      page: 1,
      numPages: 0,
      rotate: 0,
      showDialog:false,
      showExpand:false,
      error:"",
      pdfBook:{},
      foundBook:false
    }
  },
  beforeMount(){
    this.sendMessage()
    this.getSites()
    console.log(this.$vuetify.breakpoint)
  },
  methods:{
    getNextPage(){
      this.page += 1
      this.updateItemToDefaultCollection()
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
            this.newNotification("failed getting collections",'error')
          }
        )
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
            this.newNotification("failed adding item",'error')
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
            this.newNotification("failed adding item",'error')
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
        this.selectBookPDF(this.subBooks[index - 1])
        this.page = 1
        this.showDialog = true
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
        this.showDialog = true
      }
    },
    refresh(){
      this.sendMessage()
      this.getSites()
    },
    newNotification(message,type){
      const n = {
        id:Math.random(),
        message:message,
        type:type,
        time:5}
      this.$store.commit('login/addNotification', n)
    },
    getAllBooks(bookName){
      return this.$axios.post("/v2/books/name",{
        name:bookName
      },{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log(res.data.data)
          this.subBooks = res.data.data
        }).catch( error =>{
          this.newNotification("failed getting chapters",'error')
        }
      )
    },
    doesHaveVolumes(book){
      if (book.chapter !== "" || book.volume !== ""){
        return true
      }
      return false
    },
    getBooksForSite(site_id){
      var output = []
      var s_id = []
      if (site_id.length  === 0){
        return output
      }
      for (var i =0; i< this.sites.length;i++){
        if (site_id.includes(this.sites[i]["name"]) || site_id.includes("All")){
          s_id.push(this.sites[i].id)
        }
      }
      for (var i =0; i< this.books.length;i++){
        if (s_id.includes(this.books[i]["site_id"])){
          output.push(this.books[i])
        }
      }
      return output
    },
    getSites(){
      this.$axios.get("/v2/site",{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log(res.data)
          if (res.data.data){
            this.sites = res.data.data
          }
        }).catch( error =>{
          this.newNotification("failed getting sites",'error')

        }
      )
    },
    selectBook(book){
      if (this.selectedBook === book){
        this.showExpand = !this.showExpand
        this.page = 1
        this.selectedBook = book
        return
      }
      if (this.doesHaveVolumes(book)){
        this.getAllBooks(book.name)
      }
      this.page = 1
      this.showExpand= true
      this.selectedBook = book
    },
    selectBookPDF(book){
      var url = "http://192.168.1.124:8080/v2/books/pdf?api_key="+this.currentUser.api_key+"&book="+book.name
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
        this.showDialog = !this.showDialog
        this.page = 1
        this.pdfBook = book
        this.getCollectionsBook()
        return
      }
      if (this.doesHaveVolumes(book)){
        this.getAllBooks(book.name)
      }
      this.page = 1
      this.showDialog= true
      this.pdfBook = book
      this.getCollectionsBook()
      if (this.page === 1){
        this.addItemToDefaultCollection()
      }


    },
    downloadPDF(book){
      var url = "http://192.168.1.124:8080/v2/books/pdf?api_key="+this.currentUser.api_key+"&book="+book.name
      if (book.chapter !== ""){
        url += "&chapter="+book.chapter
      }
      if (book.volume !== ""){
        url += "&volume="+book.volume
      }

      // url += "&refresh=true"

      url += "&type=pdf"
      url += "&send_file=true"
      url += "&download=true"
      console.log(encodeURI(url))
      this.currentPDF = encodeURI(url)
      this.$axios.get(url,{responseType:"blob"},)
        .then(res => {

          const blob = new Blob([res.data],{type:"application/pdf"})
          const link = document.createElement('a')
          link.href = URL.createObjectURL(blob)
          link.download = 'download'
          link.click()
          URL.revokeObjectURL(link.href)
          console.log(res.data)

        }).catch( error =>{
          this.newNotification("failed getting distinct books",'error')
        }
      )
    },
    getCover(book){
      var url = "http://192.168.1.124:8080/v2/books/cover?api_key="+this.currentUser.api_key+"&book="+book.name+"&image="+book.cover_img
      if (book.chapter !== ""){
        url += "&chapter="+book.chapter
      }
      if (book.volume !== ""){
        url += "&volume="+book.volume
      }
      return encodeURI(url)
    },
    sendMessage(){
    console.log(this.api_key)
      this.$axios.post("/v2/books/distinct",{},{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log(res.data)
          if (res.data.data){
            this.books = res.data.data
          }
        }).catch( error =>{
          this.newNotification("failed getting distinct books",'error')
        }
      )
    }
  }
}
</script>

<style scoped>

</style>
