<template>
  <div>
    <v-dialog
      transition="dialog-top-transition"
      style="width: 50%"
      v-model="showDialog"
    >
      <template v-slot:default="showDialogs" style="width: 50%">
        <v-card style="width: 50%;margin-left: auto;margin-right: auto">
          <v-toolbar-title>New Job</v-toolbar-title>
          <v-text-field v-model="jobRequest.name" label="Job Name"></v-text-field>
          <v-select
            v-model="jobRequest.site_name"
            :items="sites.map(site => site.name)"
            attach
            chips
            label="Chips"
          ></v-select>
          <v-text-field v-model="jobRequest.search.manga_id" label="Manga ID"></v-text-field>
          <v-card-actions>
            <v-btn @click="newJob">Create Job</v-btn>
            <v-btn @click="showDialog = false">Close</v-btn>
          </v-card-actions>
        </v-card>
      </template>
    </v-dialog>
    <button @click="getJobs" style="alignment: right"><v-icon medium color="primary">mdi-refresh</v-icon></button>
    <button @click="showDialog = true" style="alignment: right"><v-icon medium color="primary">mdi-plus</v-icon></button>
    <v-data-table dark
                  :headers="headers"
                  :items="jobs"
                  :items-per-page="7"
                  class="elevation-1"
    ></v-data-table>
<!--    <v-simple-table     :items-per-page="7"-->
<!--                        class="elevation-1">-->
<!--      <template v-slot:default>-->
<!--        <thead>-->
<!--        <tr>-->
<!--          <th class="text-left">Id</th>-->
<!--          <th class="text-left">Name</th>-->
<!--          <th class="text-left">Current</th>-->
<!--          <th class="text-left">Total</th>-->
<!--          <th class="text-left">Finish</th>-->
<!--        </tr>-->
<!--        </thead>-->
<!--        <tbody>-->
<!--        <tr v-for="job in jobs" :key="job.ID">-->
<!--          <td>{{ job.id }}</td>-->
<!--          <td>{{ job.name }}</td>-->
<!--          <td>{{ job.current }}</td>-->
<!--          <td>{{ job.total }}</td>-->
<!--          <td>{{ job.est_finish }}</td>-->
<!--        </tr>-->
<!--        </tbody>-->
<!--      </template>-->
<!--    </v-simple-table>-->
  </div>
</template>

<script>
import socket from '~/plugins/socket.client.js'
import socketIOClient from "socket.io-client";

export default {
  name: "job",
  beforeMount(){
    this.getJobs()
    this.getSites()
  },
  data(){
    return {
      sites:[],
      keys: "0",
      values:"211730",
      parameters:{},
      response: {},
      jobs: [],
      showDialog:false,
      jobRequest:{
        name:"",
        site_name:"",
        "search":{

        },
        types:["process","download"]
      },
      jobTypes:["process","download"],
      headers:[
        {
          text : "id",
          sortable: true,
          value: "id"
        },
        {
          text : "Name",
          sortable: true,
          value: "name"
        },
        {
          text : "current",
          sortable: false,
          value: "current"
        },
        {
          text : "total",
          sortable: false,
          value: "total"
        },
        {
          text : "Status",
          sortable: true,
          value: "message"
        },
        {
          text : "Est Time",
          sortable: false,
          value: "est_finish"
        },
        ]
    }
  },
  computed:{
    currentUser(){
      return this.$store.state.login.currentUser
    },
  },
  watch: {
    currentUser() {
      this.getJobs()
      this.getSites()
    }
  },
  methods:{
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
    clearJob(){
      this.jobRequest ={
        name:"",
          site_name:"",
          "search":{

        },
        types:["process","download"]
      }
    },
    newJob(){
      if (this.jobRequest.name === "" && this.jobRequest.site_name === ""){
        return
      }
      this.$axios.post("/v2/job",this.jobRequest,{
        headers: {"Authentication-Key":this.currentUser.api_key}
      },)
        .then(res => {
          console.log(res.data)
          this.getJobs()

        }).catch( error =>{
          console.error(error)
        }
      )
      this.showDialog = false
    },
    getJobs(){
      // const endpoint = 'http://127.0.0.1:8080/socket/library/'+this.currentSite+"?manga_id="+this.values;
      //
      //
      //   const socket = socketIOClient(endpoint);
      //   socket.on("Emit1", data => {
      //     console.log(data)
      //   });
       if (Object.values(this.currentUser).indexOf('api_key') > -1){
         return
       }

       this.$axios.get("/v2/job",{
         headers: {"Authentication-Key":this.currentUser.api_key}
       },)
         .then(res => {
           console.log(res.data)
           if (res.data.data){
             this.jobs = res.data.data
           }

         }).catch( error =>{
           console.error(error)
       }
      )
    }
  }
}
</script>

<style scoped>

</style>
