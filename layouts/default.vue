<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >

      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-btn
        icon
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon>mdi-{{ `chevron-${miniVariant ? 'right' : 'left'}` }}</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="clipped = !clipped"
      >
        <v-icon>mdi-application</v-icon>
      </v-btn>
      <v-btn
        icon
        @click.stop="fixed = !fixed"
      >
        <v-icon>mdi-minus</v-icon>
      </v-btn>
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <label> <v-icon>mdi-face</v-icon>{{currentUser.name}}</label>
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-card v-for="n in notifications" :key="n.id">
        <v-snackbar
          dense
        >{{n.message}} <v-btn small class="justify-right"><v-icon small>mdi-close</v-icon></v-btn></v-snackbar>
      </v-card>
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
      <v-container>
        <v-card>
                <v-card v-if="currentUser.api_key === ''">
                  <v-toolbar
                    color="primary"
                    dark
                    style="text-align: center"
                  >Sign In
                  </v-toolbar>
                  <v-container>
                    <v-text-field v-model="username" placeholder="username" ></v-text-field>
                    <v-text-field label="Password"
                                  type="password"
                                  v-model="password"
                                  :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
                                  :rules="[rules.required, rules.min]"
                                  :type="show1 ? 'text' : 'password'"
                                  name="input-10-1"
                                  hint="At least 8 characters"
                                  @click:append="show1 = !show1"
                    ></v-text-field>
                    <v-btn @click="signIn(username,password)">Log in</v-btn>
                  </v-container>
                </v-card>
          <v-card v-if="currentUser.api_key !== ''">
            <v-btn @click="logout()">Log out</v-btn>
          </v-card>

        </v-card>
      </v-container>
    </v-navigation-drawer>

    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import Index from "../pages";
import {sha256} from "js-sha256";

export default {
  components: {
    Index
  },
  mounted() {

    this.getPages()
  },
  methods:{
    newNotification(message,type){
      const n = {
        id:Math.random(),
        message:message,
        type:type,
        time:5}
      this.$store.commit('login/addNotification', n)
    },
    logout(){
      console.log(this.currentUser)
      this.$store.commit('login/set', {
        api_key:''
      })
      this.items.pop()
      this.items.pop()
    },
    signIn(username,password){
      console.log(username)
      console.log(password)
      const key = sha256.hmac(username,password)
      this.$axios.post("/v2/user/signin",{
        user_name:  username,
        password: key
      },)
        .then(res => {
          console.log(res.data)
          if (res.data.code === 0){
            this.$store.commit('login/set', res.data.data)
            console.log(this.currentUser)
            this.sign_in = false
            console.log("Success")
            this.getPages()
            this.newNotification("logged in","success")
          }else{
            this.newNotification("failed to login","warn")
          }
        }).catch( error =>{
          this.newNotification("failed to login","error")
        }
      )
    },
    deleteLast() {

    },
     sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    getPages(){
      if (this.currentUser === null){
        return
      }
      if (this.currentUser.api_key !== ''){
        this.items.push(
          {
            icon: 'mdi-briefcase',
            title: 'Job',
            to: '/job'
          }
        )
        this.items.push(
          {
            icon: 'mdi-book',
            title: 'Books',
            to: '/books'
          }
        )
        this.items.push(
          {
            icon: 'mdi-bookshelf',
            title: 'Library',
            to: '/collections'
          }
        )
     }
    }
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

  computed:{
    currentUser(){
      if (this.$store.state.login.currentUser === null){
        return  {api_key:'',name:''}
      }
      return this.$store.state.login.currentUser
    },
    notifications(){
      return this.$store.state.login.notifications
    }
  },
  data () {
    return {
      show1: false,
      username:"",
      password:"",
      sign_in: false,
      clipped: false,
      drawer: false,
      fixed: false,
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        emailMatch: () => ('The email and password you entered don\'t match'),
      },
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        }
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Manga Library'
    }
  }
}
</script>
