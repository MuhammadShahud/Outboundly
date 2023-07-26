<template>
  <div v-if="appState.loggedIn" class="container">
    <div v-if="activeTab !== 'analyze'">
      <div class="header">
        <div class="logo">
          <img src="./assets/outLogo.svg" alt="Logo" />
        </div>
        <div class="icons">
          <img
            @click="activeTab = 'noti'"
            src="./assets/noti.svg"
            alt="Icon 3"
          />
          <img
            @click="activeTab = 'setting'"
            src="./assets/setting.svg"
            alt="Icon 1"
          />
          <img @click="hideVueApp" src="./assets/cross.svg" alt="Icon 2" />
        </div>
      </div>
      <div
        class="credits"
        v-show="activeTab !== 'noti' && activeTab !== 'compose'"
      >
        <div class="div1">
          <img src="./assets/credit.svg" alt="Credit Icon" />
          <span>{{ appState.user.credits }} credits</span>
        </div>
        <ButtonMain
          class="p-button-sm compose-button"
          icon="pi pi-file-edit"
          label="compose"
          size="small"
          @click="compose"
          :loading="isComposing"
        />
      </div>
      <div
        class="tabs"
        v-show="activeTab !== 'noti' && activeTab !== 'compose'"
      >
        <button
          @click="activeTab = 'general'"
          :class="{ active: activeTab === 'general' }"
        >
          <img
            v-if="activeTab === 'general'"
            src="./assets/generalActive.svg"
          />
          <img v-else src="./assets/generalInactive.svg" />

          General
        </button>

        <button
          @click="activeTab = 'brainstorm'"
          :class="{ active: activeTab === 'brainstorm' }"
        >
          <img
            v-if="activeTab === 'brainstorm'"
            src="./assets/brainActive.svg"
          />
          <img v-else src="./assets/brainInactive.svg" />

          BrainStorm
        </button>

        <button
          @click="activeTab = 'tools'"
          :class="{ active: activeTab === 'tools' }"
        >
          <img v-if="activeTab === 'tools'" src="./assets/toolsActive.png" />
          <img v-else src="./assets/toolsInactive.svg" />

          Tools
        </button>
      </div>
      <div class="" v-show="activeTab === 'general'">
        <GeneralSection />
      </div>
      <div class="" v-show="activeTab === 'tools'">
        <ToolsSection />
      </div>
      <div class="" v-show="activeTab === 'brainstorm'">
        <BrainstormSection @updatePropName="updateParentData" />
      </div>
      <div class="" v-show="activeTab === 'setting'">
        <SettingSection />
      </div>
      <div class="" v-show="activeTab === 'noti'">
        <NotificationSection @updatePropName="updateParentData" />
      </div>
      <div class="" v-show="activeTab === 'compose'">
				<ComposeSection @updatePropName="updateParentData" :message="composedMessage" :status="messageStatus" :pageData="pageData" />
      </div>
    </div>
    <div v-else class="">
      <BrainstormResults @updatePropName="updateParentData" />
    </div>
  </div>
  <div
    v-else
    @mousedown="dragStart"
    @mousemove="drag"
    @mouseup="dragEnd"
    id="draggable"
  >
    <LoginPage />
  </div>
</template>

<script>
import { onMounted, ref } from "@vue/runtime-core";
import BrainstormSection from "./components/forms/BrainstormSection.vue";
import ToolsSection from "./components/forms/ToolsSection.vue";
import GeneralSection from "./components/forms/GeneralSection.vue";
import { useAppState, syncLocalStorage } from "./snippets/system";
import { getUser } from "./snippets/api";
import LoginPage from "./components/support/LoginPage.vue";
import SettingSection from "./components/forms/SettingSection.vue";
import NotificationSection from "./components/forms/NotificationSection.vue";
import ComposeSection from "./components/forms/ComposeSection.vue";
import BrainstormResults from "./components/forms/BrainstormResults.vue";

export default {
  components: {
    GeneralSection,
    BrainstormSection,
    ToolsSection,
    SettingSection,
    NotificationSection,
    ComposeSection,
    BrainstormResults,
    LoginPage,
  },
  //composition api setups for reactive data
  setup() {
    //setup system, get user opject, sync with database local storage
    const appState = useAppState();
    const email = ref("");
    const name = ref("");
    const logoUrl = ref("/img/" + process.env.VUE_APP_LOGO_URL);
    const appDomain = ref(process.env.VUE_APP_DOMAIN);
    const crispId = ref(process.env.VUE_APP_CRISP_ID);
    const displayError = ref(false);
    const errorMessage = ref("Error");
    const composedMessage = ref("");
    const messageStatus = ref("");
    const isComposing = ref(false);
    const pageData = ref({});
    const activeTab = ref("general");

    const openInNewTab = (url) => {
      chrome.tabs.create({ url, selected: true, active: true });
    };

    let timeoutIds = [];

    const compose = async () => {
      clearAllTimeouts();
      if (!appState.user.selectedMode) {
        console.log("mode error");
        displayErrorMessage(
          "You must select a message mode and apply settings before composing a message."
        );
        return;
      }

      try {
        console.log("try1");

        isComposing.value = true;
        messageStatus.value = "Analyzing page information";
        composedMessage.value = "";

        const tabs = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const activeTab2 = tabs[0];
        const url = activeTab2.url;

        if (
          !url.includes("linkedin.com/in/") &&
          !url.includes("linkedin.com/sales/") &&
          appState.webMode === false
        ) {
          console.log("profile error");
          displayErrorMessage(
            "Composing is only available when viewing a LinkedIn profile or website"
          );
          isComposing.value = false;
          return;
        }

        if (appState.webMode === true) requestEmail(activeTab2);
        else requestMessage(activeTab2);

        setTimeout(() => {
          messageStatus.value = "Composing your message";
        }, 12000); // This will execute after 12 seconds

        // if still composing after 60 seconds display error
        let id = setTimeout(() => {
          if (isComposing.value === true) {
            console.log("tryAgain error");

            displayErrorMessage("Opps there was an error, please try again.");
            isComposing.value = false;
            activeTab.value = "general";
          }
        }, 60000);
        timeoutIds.push(id);
      } catch (error) {
        console.log("error error");

        console.error("Error during compose function:", error);
        activeTab.value = "compose";
      }
    };

    const displayErrorMessage = (message) => {
      errorMessage.value = message;
      displayError.value = true;
    };

    onMounted(async () => {
      try {
        if (appState.loggedIn) {
          appState.user = await getUser(
            appState.user.email,
            appState.user.token
          );
          await syncLocalStorage("user", appState.user);
          email.value = encodeURIComponent(appState.user.email);
          name.value = encodeURIComponent(
            appState.user.firstName + " " + appState.user.lastName
          );
        }
      } catch (error) {
        console.error("Error during mounted hook:", error);
      }
    });

    const requestMessage = (activeTab2) => {
      console.log("requestMessage");

      chrome.tabs.sendMessage(
        activeTab2.id,
        { action: "getProfileInfo" },
        async (response) => {
          if (response) {
            const profileInfo = response;

            const recipientData = {
              recipientFirstName: profileInfo.name,
              recipientLastName: profileInfo.name,
              recipientHeadline: profileInfo.headline,
              recipientProfile: profileInfo.about,
              recipientUrl: profileInfo.currentUrl,
              startPhrase: "",
            };
console.log("requestMessage working");

            const { status, message } = await new Promise((resolve) =>
              chrome.runtime.sendMessage(
                { action: "generateMessage", ...recipientData },
                resolve
              )
            );

            if (status === "ok") {
              pageData.value = {
                emails: profileInfo.emailsList,
                phones: profileInfo.phoneList,
                contact: "",
                logo: profileInfo.logo || "",
                recipientBusinessName:
                  profileInfo.firstName + " " + profileInfo.lastName,
                recipientBusinessCategory: profileInfo.headline,
              };

              composedMessage.value = message;
              isComposing.value = false;
              activeTab.value = "compose";

            } else if (
              message === "You don't have enough credits to send a message"
            ) {
              displayErrorMessage(
                "You don't have enough credits to send a message. Please purchase more credits."
              );
              isComposing.value = false;
              activeTab.value = "general";
            } else {
              displayErrorMessage("Opps there was an error, please try again.");
              isComposing.value = false;
              activeTab.value = "general";
            }
          } else {
            displayErrorMessage(
              "No profile detected. Ensure you are viewing a full profile on LinkedIn or Sales Navigator and refresh the page."
            );
            console.error("No response received from content script.");
            isComposing.value = false;
          }
        }
      );
    };

    const requestEmail = (activeTab2) => {
      console.log("requestEmail");
      chrome.tabs.sendMessage(
        activeTab2.id,
        { action: "getPageInfo" },
        async (response) => {
          if (response) {
            const { text, emails, phones, contact, logo } = response;

            pageData.value = {
              text: text,
              emails: emails,
              phones: phones,
              contact: contact,
              logo: logo,
            };
            console.log("requestEmail working");

            activeTab.value = "compose";

            const {
              status,
              message,
              recipientBusinessName,
              recipientBusinessCategory,
            } = await new Promise((resolve) =>
              chrome.runtime.sendMessage(
                { action: "generateEmail", pageText: pageData.value.text },
                resolve
              )
            );

            if (status === "ok") {
              composedMessage.value = message;
              isComposing.value = false;
              pageData.value.recipientBusinessName = recipientBusinessName;
              pageData.value.recipientBusinessCategory =
                recipientBusinessCategory;
            } else {
              displayErrorMessage(
                "Opps there was an error. Try refreshing the page and reopening the extension popup."
              );
              isComposing.value = false;
              activeTab.value = "general";
            }
          } else {
            displayErrorMessage(
              "Unable to read the webpage. Refresh the page and try again"
            );
            console.error("No response received from content script.");
            isComposing.value = false;
          }
        }
      );
    };

    function clearAllTimeouts() {
      for (let i = 0; i < timeoutIds.length; i++) {
        clearTimeout(timeoutIds[i]);
      }
      // Clear the array
      timeoutIds = [];
    }

    return {
      appState,
      useAppState,
      displayError,
      errorMessage,
      composedMessage,
      isComposing,
      messageStatus,
      pageData,
      openInNewTab,
      compose,
      email,
      name,
      logoUrl,
      appDomain,
      crispId,
      activeTab,
    };
  },

  methods: {
    updateParentData(newValue) {
      this.activeTab = newValue;
    },
    hideVueApp() {
      console.log("working");
      this.$rootEventBus.hideVueApp();
    },
  },
};
</script>

<style>
/*import font awesome*/
@import url("./assets/fonts/font-awesome/css/all.min.css");

@import "./styles/tabs.css";
@import "./styles/forms.css";
@import "./styles/app.css";


</style>
