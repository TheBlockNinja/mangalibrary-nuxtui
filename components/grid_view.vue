<template>
  <v-container v-if="items.length > 0">
    <v-row>
      <v-col :cols="6">
        <v-text-field v-model=searchString prepend-icon="mdi-magnify" placeholder="Search..." @keydown.enter.prevent="search()"></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-card flat style="justify-content: center;margin-right: auto;margin-left: auto">
        <v-container fluid>
          <v-row>
            <v-col
              v-for="items in getObjectsOnPage()"
              :key="JSON.stringify(items)"
              class="child-flex"
              :cols="(items ===selectedItem && items.description.length > 0) ? 12 : 6"
              :sm="(items ===selectedItem && items.description.length > 0) ? 12 : 6"
              :md="(items ===selectedItem && items.description.length > 0) ? 12 : 6"
              :lg="(items ===selectedItem && items.description.length > 0) ? 6 : 3"
            >
              <v-expand-transition>
              <v-container fluid>
                <v-card-title v-if="(items === selectedItem)" style="font-size: 16px;text-align: center;margin-left: auto;margin-right: auto;overflow-wrap: normal;">
                  {{items.name}}
                </v-card-title>
                <v-row>
                  <v-col class="child-flex" :cols="(items === selectedItem && items.description.length)? 6:12">
                    <book-image :book="items" @click.native="selectItem(items)"></book-image>
                  </v-col>
                  <v-col class="child-flex" :cols="6" v-if="(items === selectedItem && items.description.length > 0)">
                    <v-card >
                      <v-card-text style="font-size: 12px">
                        {{items.description}}
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row v-if="items === selectedItem">
                  <v-col style="font-size: 12px"> Views: {{items.views}}</v-col>
                  <v-col style="font-size: 12px"> Downloads: {{items.downloads}}</v-col>
                  <v-btn @click="show = true"><v-icon>mdi-eye</v-icon></v-btn>
                  <book-pdf :pdf-book="items" :show="show"></book-pdf>
                </v-row>
              </v-container>
              </v-expand-transition>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-row>
      <v-row>
        <v-pagination
          v-model="page"
          style="justify-content: center;margin-right: auto;margin-left: auto"
          :length="Math.ceil(filteredItems.length / page_size)"
          :total-visible="6"
        ></v-pagination>
      </v-row>
    </v-container>

  </template>

  <script>
  import BookImage from "./book-image";
  import PDFViewer from "./pdf_viewer";
  export default {

  name: "grid_view",
    props: ['items','itemsTemplate','testClickFunc'],
    components: {
      "book-image": BookImage,
      "book-pdf":PDFViewer
    },
    data(){
      return{
        page:1,
        page_size:10,
        selectedItem:{},
        show:false,
        searchString:"",
        filteredItems:[]
      }
    },
    watch:{
      items(){
        this.search("")
        this.show = false
        if (this.page > (this.items.length / this.page_size)) {
          this.page = 1
        }
      },
    },
    computed: {
      currentUser() {
        return this.$store.state.login.currentUser
      },
    },
    methods:{
      getObjectsOnPage(){
        let pageObjects = []
        const startingObjectNumber = (this.page - 1) * this.page_size
        const currentPageSize = (startingObjectNumber + this.page_size > this.filteredItems.length) ? this.filteredItems.length - startingObjectNumber : this.page_size;
        console.log(startingObjectNumber)
        console.log(currentPageSize)
        for(let i = startingObjectNumber;i < startingObjectNumber+currentPageSize;i++){
          pageObjects.push(this.filteredItems[i])
        }
        return pageObjects
      },
      search(){
        this.filteredItems = []
        for(let i = 0;i< this.items.length;i++){
          if (this.items[i].name.toLowerCase().includes(this.searchString.toLowerCase()) || this.items[i].description.toLowerCase().includes(this.searchString.toLowerCase())){
            this.filteredItems.push(this.items[i])
          }
        }
      },
      SetItems(items){
        this.items = items
      },
      selectItem(item){
        this.show = false
        if (this.selectedItem === item){
          this.selectedItem = {}
          return
        }
        this.selectedItem = item
        if (this.selectedItem.chapter !== ''){

        }
      }
    }
  }
  </script>

  <style scoped>

  </style>
