<template>

      <v-container fluid>

        <v-btn fab absolute style="transform: translate(-50%,-50%)" color="primary"><v-icon>mdi-plus</v-icon></v-btn>

        <v-row>
          <v-col
            v-for="collection in collections" :key="collection.title"
            class="child-flex"
            :cols="(collection.show_books) ? 12 : 6"
          >
            <v-card v-if="!collection.show_books">
              <v-card-title style="text-align: center;justify-content: center">{{collection.title}}</v-card-title>
              <label style="text-align: center;justify-content: center">
                Total Books {{collection.library_books.length}}
              </label>
              <v-card-actions>
                <v-btn>
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
                <v-btn @click="collection.show_books = true;getBooks(collection)">
                  <v-icon>
                    mdi-eye
                  </v-icon>
                </v-btn>
              </v-card-actions>
            </v-card>
            <v-card v-if="collection.show_books">
              <v-btn @click="collection.show_books = false"><v-icon>mdi-close</v-icon></v-btn>
            </v-card>
            <grid-view  :items="filterBooks(collection.books)" v-if="collection.show_books">
            </grid-view>
          </v-col>

        </v-row>

      </v-container>
</template>

<script>
import GridView from '../components/grid_view'
export default {
  name: "collections",
  components:{
    'grid-view' : GridView
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
  beforeMount(){
    this.getCollections()
  },
  data(){
    return {
      collections:[],
      currentCollection:"",
      collectionBooks:"",
    }
  },
  methods:{
    filterBooks(books){
      let outputB = []
      for(let i = books.length-1;i>=0;i--){
        if (!this.doesBookExist(outputB,books[i].name)){
          outputB.push(books[i])
        }
      }
      return outputB
    },
    doesBookExist(books,name){
      for(let i = 0;i < books.length;i++){
        if (books[i].name === name){
          return true
        }
      }
      return false
    },
    getCollections(){
      return this.$axios.get("/v2/library/collections",{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {

          for(const v in  res.data.data){
            this.collections.push({
              title:res.data.data[v],
              library_books:[],
              show_books:false,
              books:[],
            })
          }
          this.getCollectionItems()
          console.log(this.collections)
        }).catch( error =>{
            this.newNotification("failed getting collections",'error')
          }
        )
    },
    async getBooks(librayBooks){
      librayBooks.books = await this.$axios.post("/v2/books/library",{
        library_books: librayBooks.library_books
      },{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          return res.data.data
        }).catch( error =>{
            this.newNotification("failed getting collections",'error')
          }
        )
    },
    async getCollectionItems(){
      for(const v in  this.collections){
        const response = await this.$axios.get("/v2/library/collections/items?collection="+encodeURI(this.collections[v].title),{
            headers: {"Authentication-Key":this.currentUser.api_key}
          },)
            .then(res => {
              //this.collections[v].library_books = res.data.data
              return res.data.data
            }).catch( error =>{
              this.newNotification("failed getting collections",'error')
            }
          )
        this.collections[v].library_books = response
      }
    }
  },


}
</script>

<style scoped>

</style>
