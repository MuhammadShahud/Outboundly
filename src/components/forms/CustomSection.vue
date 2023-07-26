<template>
  <div class="general">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Custom
        <p class="settings-description">
          Lets users specify how to personalize message. It increases engagement
          and response rates by speaking directly to the prospects.
        </p>
      </div>
    </div>
    <DropDown v-model="selectedPreset" :options="Object.values(dropdownOptionsValues)" optionLabel="name"
			placeholder="Select a saved preset" @change="selectPresetAction" :loading="isDropdownLoading" />
    <div class="settings-row">
      <textarea
      v-model="messageSettings.instructions" maxlength="400" :autoResize="true"
        class="settingsInput"
        type="email"
        placeholder="Provide instructions on how to personalize the message"
      />
      <span>{{ messageSettings.instructions.length }}/400</span>
    </div>
    <div class="settings-row">
      <textarea
      v-model="messageSettings.reason" maxlength="400" :autoResize="true"
        class="settingsInput"
        type="email"
        placeholder="Write what your message is about in plain language"
      />
      <span>{{ messageSettings.reason.length }}/400</span>
    </div>
    <div class="settings-row">
      <textarea
      v-model="messageSettings.callToAction" maxlength="100" :autoResize="true"
        class="settingsInput"
        type="email"
        placeholder="Call To Action"
      />
      <span>{{ messageSettings.callToAction.length }}/100</span>
    </div>
    <ActionBar :messageSettings="messageSettings" messageMode="general" messageType="custom" :trashButton="trashDisabled"
			:selectedPreset="selectedPreset" />
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { updateMessageSettings } from "../../snippets/api";
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
    const messageSettings = reactive({
      callToAction: "",
      reason: "",
      instructions: "",
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
        messageSettings.callToAction = config.messageSettings.callToAction;
        messageSettings.reason = config.messageSettings.reason;
        messageSettings.instructions = config.messageSettings.instructions;
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
      dropdownOptions.value = appState["user"]["presets-general-custom"];
    };

    watch(
      () => appState["user"]["presets-general-custom"],
      () => {
        updateDropdownOptions();
      }
    );

    onMounted(() => {
      if ("general-custom" in appState.activeConfigs) {
        messageSettings.callToAction =
          appState.activeConfigs["general-custom"][
            "messageSettings"
          ].callToAction;
        messageSettings.reason =
          appState.activeConfigs["general-custom"]["messageSettings"].reason;
        messageSettings.instructions =
          appState.activeConfigs["general-custom"][
            "messageSettings"
          ].instructions;
        messageSettings.id = appState.activeConfigs["general-custom"]["id"];
      }

      updateDropdownOptions();
    });

    const saveInfo = async () => {
      let settings = {
        id: messageSettings.id,
        messageMode: "general",
        messageType: "custom",
        messageSettings: {
          reason: messageSettings.reason,
          instructions: messageSettings.instructions,
          callToAction: messageSettings.callToAction,
        },
      };

      const response = await updateMessageSettings(settings);
      console.log(response);
    };

    return {
      trashDisabled,
      isDropdownLoading,
      appState,
      selectedPreset,
      presetName,
      messageSettings,
      dropdownOptions,
      dropdownOptionsValues,
      saveInfo,
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

<style></style>
