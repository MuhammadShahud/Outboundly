<template>
  <div class="brainstorm-section">
    <div class="row">
      <img src="../../assets/furqan.svg" alt="Furqan" class="profile-pic" />
      <div class="details">
        <h2 class="name">Muhammad Furqan</h2>
        <p class="profession">Lead UI UX Designer at Plum Tree Group</p>
      </div>
    </div>
    <div class="column">
      <h3 class="info-title">Contact Info:</h3>
      <div class="image-info">
        <img src="../../assets/phone.svg" alt="Email" class="info-icon" />
        <p class="info-text">furqan@plumtreegroup.net</p>
      </div>
      <div class="image-info">
        <img src="../../assets/num.svg" alt="Phone" class="info-icon" />
        <p class="info-text">+1 123 456 789</p>
      </div>
    </div>
    <div class="column">
      <p class="description">
        You messaged them before and the date last messaged is: 04/12/2023
      </p>
    </div>
    <div class="column">
      <button @click="updatePropName('analyze')" class="analyze-button">
        Analyze {{profileInfoData.name}}'s Profile
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, reactive, ref } from "vue";
import { useAppState, syncLocalStorage } from "@/snippets/system";
import { getAnalysis } from "@/snippets/api";
// import BrainstormResults from "./BrainstormResults";

export default {
  //   components: {
  //     BrainstormResults,
  //   },
  setup() {
    const appState = useAppState();
    const presetName = ref("");
    const id = ref("");
    const isOnProfile = ref(false);
    const messageSettings = reactive({
      details: "",
    });

    let profileInfoData = reactive({ name: "" });
    const isAnalyzeLoading = ref(false);
    let responseData = reactive({
      summary: "",
      services: "",
      questions: "",
    });

    const showResults = ref(false);

    onMounted(() => {
      //wait for local storage to finish loading before setting values
      if ("brainstorm" in appState.activeConfigs) {
        presetName.value = appState.activeConfigs["brainstorm"]["presetName"];
        id.value = appState.activeConfigs["brainstorm"]["id"];
        messageSettings.details =
          appState.activeConfigs["brainstorm"]["messageSettings"]["details"];
      }
      // get current url from tab
      //if in chrome extension environment
      if (chrome.tabs) {
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            var activeTab = tabs[0];
            var url = activeTab.url;

            //if url is linkedin profile set isOnProfile to True
            if (url.includes("linkedin.com/in/")) {
              isOnProfile.value = true;
              //get profile info from tab
              chrome.tabs.sendMessage(
                activeTab.id,
                { action: "getProfileInfo" },
                function (response) {
                  console.log(response);
                  profileInfoData.name = response.name;
                  profileInfoData.headline = response.headline;
                  profileInfoData.about = response.about;
                }
              );
            }
          }
        );
      }
    });

    const analyzeProfile = async () => {
      //save preset name and id
      isAnalyzeLoading.value = true;
      appState.activeConfigs["brainstorm"] = {
        presetName: presetName.value,
        id: id.value,
        messageSettings: messageSettings,
      };
      await syncLocalStorage("activeConfigs", appState.activeConfigs);
      const response = await getAnalysis(
        profileInfoData,
        messageSettings.details
      );
      if (response.services) {
        //console.log(response);
        responseData.services = response.services;
        responseData.questions = response.questions;
        responseData.summary = response.summary;
        responseData.approach = response.approach;
        showResults.value = true;
      }
      isAnalyzeLoading.value = false;
    };

    return {
      messageSettings,
      showResults,
      isOnProfile,
      profileInfoData,
      responseData,
      isAnalyzeLoading,
      analyzeProfile,
    };
  },
  methods: {
    updatePropName(newValue) {
      this.$emit("updatePropName", newValue);
    },
  },
};
</script>

<style>

</style>
