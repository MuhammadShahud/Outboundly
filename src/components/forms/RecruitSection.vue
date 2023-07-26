<template>
  <div class="general">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Recruiter
        <p class="settings-description">
          This mode helps find the best talent by crafting messages that speak
          to candidates’ experiences and aspirations.
        </p>
      </div>
    </div>
    <DropDown
      v-model="selectedPreset"
      :options="Object.values(dropdownOptionsValues)"
      optionLabel="name"
      placeholder="Select a saved preset"
      @change="selectPresetAction"
      :loading="isDropdownLoading"
    />
    <div class="settings-row2">
      <input
        v-model="messageSettings.jobTitle"
        maxlength="30"
        class="settingsInput2"
        type="text"
        placeholder="Job title"
      />
    </div>
    <div class="settings-row2">
      <input
        v-model="messageSettings.company"
        maxlength="25"
        class="settingsInput2"
        type="text"
        placeholder="Company name"
      />
    </div>
    <div class="settings-row">
      <textarea
        v-model="messageSettings.description"
        maxlength="400"
        :autoResize="true"
        class="settingsInput"
        placeholder="Describe the opportunity"
      />
      <span>{{ messageSettings.description.length }}/400</span>
    </div>
    <div class="settings-row">
      <textarea
        v-model="messageSettings.callToAction"
        maxlength="400"
        :autoResize="true"
        class="settingsInput"
        placeholder="Call to action"
      />
      <span>{{ messageSettings.description.length }}/400</span>
    </div>
    <ActionBar
      :messageSettings="messageSettings"
      messageMode="general"
      messageType="recruiter"
      :trashButton="trashDisabled"
      :selectedPreset="selectedPreset"
    />
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { useAppState } from "@/snippets/system";
import ActionBar from "../blocks/ActionBar.vue";
import { getPreset } from "@/snippets/api";

export default {
  components: { ActionBar },
  setup() {
    const appState = useAppState();

    const offerTypeDisplayed = ref("");
    const presetName = ref("");
    const isDropdownLoading = ref(false);
    const selectedPreset = ref();
    const messageSettings = reactive({
      jobTitle: "",
      company: "",
      description: "",
      callToAction: "",
      presetName: "",
      id: "",
    });

    const trashDisabled = computed(() => {
      return selectedPreset.value === undefined ? true : false;
    });

    //computed value for if selectedPreset is empty object set to false
    const selectPresetAction = async () => {
      isDropdownLoading.value = true;
      const config = await getPreset(selectedPreset.value);
      if (config.messageSettings) {
        messageSettings.jobTitle = config.messageSettings.jobTitle;
        messageSettings.company = config.messageSettings.company;
        messageSettings.description = config.messageSettings.description;
        messageSettings.callToAction = config.messageSettings.callToAction;
        messageSettings.presetName = config.presetName;
        messageSettings.id = config.id;

        trashDisabled.value = false;
      }

      isDropdownLoading.value = false;
    };

    const dropdownOptions = ref([]);
    const dropdownOptionsValues = computed(() => {
      return dropdownOptions.value ? Object.values(dropdownOptions.value) : [];
    });

    const updateDropdownOptions = () => {
      dropdownOptions.value = appState["user"]["presets-general-recruiter"];
    };

    watch(
      () => appState["user"]["presets-general-recruiter"],
      () => {
        updateDropdownOptions();
      }
    );

    onMounted(() => {
      console.log(appState.activeConfigs);
      if ("general-recruiter" in appState.activeConfigs) {
        messageSettings.jobTitle =
          appState.activeConfigs["general-recruiter"][
            "messageSettings"
          ].jobTitle;
        messageSettings.company =
          appState.activeConfigs["general-recruiter"][
            "messageSettings"
          ].company;
        messageSettings.description =
          appState.activeConfigs["general-recruiter"][
            "messageSettings"
          ].description;
        messageSettings.callToAction =
          appState.activeConfigs["general-recruiter"][
            "messageSettings"
          ].callToAction;
        messageSettings.id = appState.activeConfigs["general-recruiter"].id;
        messageSettings.offerType =
          appState.activeConfigs["general-recruiter"][
            "messageSettings"
          ].offerType;
      }
      updateDropdownOptions();
    });

    return {
      trashDisabled,
      isDropdownLoading,
      selectedPreset,
      presetName,
      appState,
      offerTypeDisplayed,
      messageSettings,
      dropdownOptions,
      dropdownOptionsValues,
      selectPresetAction,
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
