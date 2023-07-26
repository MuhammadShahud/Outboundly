<template>
  <div class="general">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        General
        <p class="settings-description">
          Open ended mode great at crafting engaging messages that appeal to a
          prospect’s interests and background.
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

    <div class="settings-row">
      <textarea
        v-model="messageSettings.reason"
        maxlength="400"
        :autoResize="true"
        class="settingsInput"
        type="email"
        placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting..."
      />
      <span>{{ messageSettings.reason.length }}/400</span>
    </div>
    <div class="settings-row">
      <textarea
        v-model="messageSettings.callToAction"
        maxlength="100"
        class="settingsInput"
        type="tel"
        placeholder="Call To Action"
      />
      <span>{{ messageSettings.callToAction.length }}/100</span>
    </div>
    <ActionBar
      :messageSettings="messageSettings"
      messageMode="general"
      messageType="basic"
      :trashButton="trashDisabled"
      :selectedPreset="selectedPreset"
    />
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { useAppState } from "@/snippets/system";
import { getPreset } from "@/snippets/api";
import { updateMessageSettings } from "../../snippets/api";
import ActionBar from "../../components/blocks/ActionBar.vue";

export default {
  props: ["propName"],
  components: { ActionBar },
  methods: {
    updatePropName(newValue) {
      this.$emit("updatePropName", newValue);
    },
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.dropdownOpen = false;
    },
  },
  data() {
    return {
      dropdownOpen: false,
      selectedOption: null,
      options: [
        {
          id: 1,
          image: "../../assets/makeShorter.svg",
          text: "Make Shorter",
        },
        {
          id: 2,
          image: "../../assets/makeDetail.svg",
          text: "Make Detailed",
        },
      ],
    };
  },
  setup() {
    const appState = useAppState();

    const presetName = ref("");
    const isDropdownLoading = ref(false);
    const selectedPreset = ref();
    const messageSettings = reactive({
      callToAction: "",
      reason: "",
      presetName: "",
      id: "",
    });

    const trashDisabled = computed(() => {
      return selectedPreset.value === undefined ? true : false;
    });

    const dropdownOptions = ref([]);
    const dropdownOptionsValues = computed(() => {
      return dropdownOptions.value ? Object.values(dropdownOptions.value) : [];
    });

    const updateDropdownOptions = () => {
      dropdownOptions.value = appState["user"]["presets-general-basic"];
    };

    watch(
      () => appState["user"]["presets-general-basic"],
      () => {
        updateDropdownOptions();
      }
    );

    //computed value for if selectedPreset is empty object set to false
    const selectPresetAction = async () => {
      isDropdownLoading.value = true;
      const config = await getPreset(selectedPreset.value);
      if (config.messageSettings) {
        messageSettings.callToAction = config.messageSettings.callToAction;
        messageSettings.reason = config.messageSettings.reason;
        messageSettings.id = config.id;
        messageSettings.presetName = config.presetName;

        trashDisabled.value = false;
      }

      isDropdownLoading.value = false;
    };

    onMounted(() => {
      if ("general-basic" in appState.activeConfigs) {
        messageSettings.callToAction =
          appState.activeConfigs["general-basic"][
            "messageSettings"
          ].callToAction;
        messageSettings.reason =
          appState.activeConfigs["general-basic"]["messageSettings"].reason;
        messageSettings.id = appState.activeConfigs["general-basic"]["id"];
      }
      updateDropdownOptions();
    });

    const saveInfo = async () => {
      let settings = {
        id: messageSettings.id,
        messageMode: "general",
        messageType: "basic",
        messageSettings: {
          reason: messageSettings.reason,
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
};
</script>

<style>

.backButton {
}
</style>
