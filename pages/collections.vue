<template>

      <v-container fluid>
        <v-btn fab absolute style="transform: translate(-50%,-50%)" color="primary"><v-icon>mdi-plus</v-icon></v-btn>
        <v-row>
          <v-col
            v-for="collection in collections" :key="collection.title"
            class="child-flex"
            cols="5"
          >
            <v-card>
              <v-card-title style="text-align: center;justify-content: center">{{collection.title}}</v-card-title>
              <v-card-actions>
                <v-btn>
                  <v-icon>
                    mdi-delete
                  </v-icon>
                </v-btn>
                <label>
                  Total Books {{collection.library_books.length}}
                </label>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
</template>

<script>
export default {
  name: "collections",
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
    getCollections(){
      return this.$axios.get("/v2/library/collections",{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {

          for(const v in  res.data.data){
            this.collections.push({
              title:res.data.data[v],
              library_books:[]
            })
          }
          this.getCollectionItems()
          console.log(this.collections)
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
