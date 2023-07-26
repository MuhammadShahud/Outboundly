<template>
  <div class="general">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Connection Request
        <p class="settings-description">
          Generates tailored LinkedIn connection requests to increase acceptance
          rates and foster meaningful conversations.
        </p>
      </div>
    </div>
    <span class="diffPara"
      >Choose how to personalize the connection request to the recipient</span
    >
    <DropDown
      v-model="selectedPreset"
      :options="Object.values(dropdownOptionsValues)"
      optionLabel="name"
      placeholder="Select a saved preset"
      @change="selectPresetAction"
      :loading="isDropdownLoading"
    />
    <DropDown
      class="general-settings-dropdown"
      v-model="personalization"
      :options="personalizationOptions"
      optionLabel="name"
      placeholder="Choose personalization option"
      @change="selectPersonalization"
    />
    <div class="settings-row">
      <textarea
        v-model="messageSettings.reason"
        maxlength="100"
        :autoResize="true"
        class="settingsInput"
        type="email"
        placeholder="Call To Action"
      />
      <span>{{ messageSettings.reason.length }}/100</span>
    </div>
    <ActionBar
      :messageSettings="messageSettings"
      messageMode="connect"
      messageType="request"
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

    const presetName = ref("");
    const isDropdownLoading = ref(false);
    const selectedPreset = ref();

    const personalization = ref("general");
    const personalizationOptions = ref([
      { name: "Their overall profile", code: "general" },
      { name: "Their achievements", code: "achievements" },
      { name: "Similar job/industry", code: "job-industry" },
      { name: "Shared interests", code: "shared-interest" },
      { name: "Shared goals", code: "shared-goals" },
      { name: "Expand my network", code: "expand-network" },
    ]);

    const messageSettings = reactive({
      personalization: "",
      reason: "",
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
        messageSettings.personalization =
          config.messageSettings.personalization;
        messageSettings.reason = config.messageSettings.reason;
        messageSettings.id = config.id;
        messageSettings.presetName = config.presetName;

        trashDisabled.value = false;
      }

      isDropdownLoading.value = false;
    };

    const dropdownOptions = ref([]);
    const dropdownOptionsValues = computed(() => {
      return dropdownOptions.value ? Object.values(dropdownOptions.value) : [];
    });

    const updateDropdownOptions = () => {
      dropdownOptions.value = appState["user"]["presets-connect-request"];
    };

    watch(
      () => appState["user"]["presets-connect-request"],
      () => {
        updateDropdownOptions();
      }
    );

    onMounted(() => {
      if ("connect-request" in appState.activeConfigs) {
        messageSettings.personalization =
          appState.activeConfigs["connect-request"][
            "messageSettings"
          ].personalization;
        personalization.value =
          appState.activeConfigs["connect-request"][
            "messageSettings"
          ].personalization;
        messageSettings.reason =
          appState.activeConfigs["connect-request"]["messageSettings"].reason;
        messageSettings.id = appState.activeConfigs["connect-request"]["id"];
      }
      updateDropdownOptions();
    });

    const selectPersonalization = () => {
      messageSettings.personalization = personalization.value;
    };

    return {
      trashDisabled,
      isDropdownLoading,
      appState,
      selectedPreset,
      presetName,
      messageSettings,
      personalization,
      personalizationOptions,
      dropdownOptions,
      dropdownOptionsValues,
      selectPresetAction,
      selectPersonalization,
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
