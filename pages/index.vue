<template>
  <v-row justify="center" align="center">
    <v-col cols="12" sm="8" md="6">
      <div class="text-center">
        <logo />
        <vuetify-logo />
      </div>
      <v-container>
        <v-card v-if="currentUser.api_key === ''">
          <v-card-title>Register</v-card-title>
          <v-text-field label="User Name" v-model="username"></v-text-field>
          <v-text-field label="Email"  v-model="email"></v-text-field>
          <v-text-field label="Age" type="number" v-model="age"></v-text-field>
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
          <v-text-field label="Verify Password"
                        type="password"
                        v-model="verifyPassword"
                        :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
                        :rules="[rules.required, rules.min]"
                        :type="show2 ? 'text' : 'password'"
                        name="input-10-1"
                        hint="At least 8 characters"
                        @click:append="show2 = !show2"
          ></v-text-field>
          <v-card-actions><v-btn :disabled="password !== verifyPassword && age > 8 && age < 150 && email.length > 0" @click="register()">Register</v-btn></v-card-actions>
        </v-card>
        <v-card v-if="currentUser.api_key !== ''">
          <v-card>
            <v-card-title>Welcome {{currentUser.name}}</v-card-title>
            Last Login {{currentUser.last_login}}<br>
            JOBS:{{currentUser.current_jobs}}/{{currentUser.max_jobs}}
          </v-card>
        </v-card>
      </v-container>
    </v-col>
  </v-row>
</template>

<script>
import Logo from '~/components/Logo.vue'
import VuetifyLogo from '~/components/VuetifyLogo.vue'
import {sha256} from "js-sha256";

export default {
  components: {
    Logo,
    VuetifyLogo
  },
  computed:{
    currentUser(){
      if (this.$store.state.login.currentUser === null){
        return  {api_key:'',name:''}
      }
      return this.$store.state.login.currentUser
    },
  },
  methods:{
    register(){
      const key = sha256.hmac(this.username,this.password)
      console.log(key)
      this.$axios.post("/v2/user/new",{
        user_name:  this.username,
        password: key,
        email: this.email,
        age : parseInt(this.age)
      },)
        .then(res => {
          console.log(res.data)
          if (res.data.code === 0){
            this.$store.commit('login/set', res.data.data)
            console.log(this.api_key)
            this.sign_in = false
            console.log("Success")
          }
          console.log("Failed")
          return ""
        }).catch( error =>{
          console.error(error)
        }
      )
    }
  },
  data () {
    return {
      show1: false,
      show2: false,
      username:"",
      password:"",
      verifyPassword:"",
      age:"",
      email:"",
      rules: {
        required: value => !!value || 'Required.',
        min: v => v.length >= 8 || 'Min 8 characters',
        emailMatch: () => ('The email and password you entered don\'t match'),
      },
    }
  }

}
</script>
