<template>
  <div class="surface-card px-7 shadow-2 border-round w-full">
    <div class="text-center mb-5">
      <img :src="logoUrl" alt="Image" height="50" class="logo" />
      <div class="text-900 text-3xl font-medium mb-3"></div>
      <span class="text-600 font-medium line-height-3"
        ><a>Don't have an account?</a></span
      >
      <a @click="openInNewTab(`https://${appDomain}/#pricing`)" class="font-medium no-underline ml-2 text-blue-500 cursor-pointer"
        >Create today!</a
      >
    </div>

    <div>
      <label for="email1" class="block text-900 font-medium mb-3 text-left">Username</label>
      <InputText id="email1" type="text" class="w-full" v-model="username" />

      <label for="password1" class="block text-900 font-medium mb-3 mt-3 text-left"
        >Password</label
      >
      <InputText
        id="password1"
        type="password"
        class="w-full mb-10"
        v-model="password"
      />

      <div class="flex align-items-center justify-content-between mb-6 mt-5">
        <div class="flex align-items-center">
          <CheckBox
            id="rememberme1"
            :binary="true"
            v-model="checked"
            class="mr-2"
          ></CheckBox>
          <label for="rememberme1">Remember me</label>
        </div>
        <a 
		@click="openInNewTab(`https://${appDomain}/forgot-password`)"
          class="
            font-medium
            no-underline
            ml-2
            text-blue-500 text-right
            cursor-pointer
          "
          >Forgot password?</a
        >
      </div>

      <ButtonMain label="Sign In" :icon="icon" class="w-full" @click="login"></ButtonMain>
	<div class="mt-3 text-red-600 text-center" v-html="error"></div>
	</div>
  </div>
</template>

<script>
import { ref } from "vue";
import { loginAccount } from '@/snippets/api';

//import primeblocks style
import "primevue/resources/themes/saga-blue/theme.css";


export default {
  setup() {
    const username = ref("");
	const password = ref("");
	const checked = ref(false);
	const error = ref("")
	const icon = ref("pi pi-sign-in");
	const logoUrl = ref("/img/" + process.env.VUE_APP_LOGO_URL);
	const appDomain = ref(process.env.VUE_APP_DOMAIN);

	const openInNewTab = (url) => {
      chrome.tabs.create({ url: url, selected: true, active: true });
    };
	
	const login = async () => {
		icon.value = "pi pi-sync fa-spin";
		await loginAccount(username.value, password.value).then((response) => {
			if(!response.email){
				error.value = response;
			}			
		});
		icon.value = "pi pi-sign-in";
	};
	
    return {
		username,
		password,
		checked,
		error,
		icon,
		logoUrl,
		appDomain,
		login,
		openInNewTab,
    };
  },
};
</script>

<style scoped>
.logo  {
    position: initial;  
}
</style>