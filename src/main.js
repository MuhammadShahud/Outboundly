import { createApp, h } from "vue";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import SelectButton from "primevue/selectbutton";
import Textarea from "primevue/textarea";
import RadioButton from "primevue/radiobutton";
import Checkbox from "primevue/checkbox";
import Dropdown from "primevue/dropdown";

import "./assets/tailwind.css";

import "primevue/resources/themes/lara-light-blue/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import { createPinia } from "pinia";

import { useAppState, init } from "./snippets/system";
import Tooltip from "primevue/tooltip";
import Dialog from "primevue/dialog";
import ToastService from 'primevue/toastservice';


const app = createApp({
  render: () => h(App),
});
app.config.globalProperties.$rootEventBus = {
  hideVueApp() {
	console.log("shahudd");
    chrome.runtime.sendMessage({ type: "hideVueApp" });
  },
};
const pinia = createPinia();
app.use(ToastService);
app.use(PrimeVue);
app.use(pinia);

const appState = useAppState();
init(appState).then(() => {
  app.directive("tooltip", Tooltip);
  app.component("DialogMain", Dialog);
  app.component("ButtonMain", Button);
  app.component("InputText", InputText);
  app.component("SelectButton", SelectButton);
  app.component("TextArea", Textarea);
  app.component("RadioButton", RadioButton);
  app.component("CheckBox", Checkbox);
  app.component("DropDown", Dropdown);
  app.mount("#app");
});
