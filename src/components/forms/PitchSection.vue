<template>
  <div class="general">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Pitch
        <p class="settings-description">
          Creates targeted pitches based on a prospect’s pain points and
          interests. Focuses on the value of your offering.
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
    <div class="heading row">
      Pitch Type:
      <div class="checkbox-container">
        <RadioButton
          inputId="product"
          name="offertype"
          value="product"
          v-model="messageSettings.offerType"
          @change="onOfferChange"
        />
        <label class="checkbox-label" for="product">Product</label>
      </div>
      <div class="checkbox-container">
        <RadioButton
          inputId="service"
          name="offertype"
          value="service"
          v-model="messageSettings.offerType"
          @change="onOfferChange"
        />
        <label class="checkbox-label" for="service">Service</label>
      </div>
      
    </div>

    <div class="settings-row2">
      <input
        class="settingsInput2"
        type="text"
        :placeholder="offerTypeDisplayed + ' name'"
      />
    </div>
    <div class="settings-row2">
      <input
        class="settingsInput2"
        type="text"
        :placeholder="offerTypeDisplayed + ' category'"
      />
    </div>
    <div class="settings-row">
      <textarea
        class="settingsInput"
        type="email"
        :placeholder="offerTypeDisplayed + ' description'"
      />
      <span> {{ messageSettings.description.length }}/400 </span>
    </div>
    <div class="settings-row">
      <textarea
        class="settingsInput"
        type="email"
        :placeholder="offerTypeDisplayed + ' benefits'"
      />
      <span>{{ messageSettings.benefits.length }}/400</span>
    </div>
    <div class="settings-row">
      <textarea
        class="settingsInput"
        type="email"
        placeholder="Pain points that your product/service solves"
      />
      <span> {{ messageSettings.challenges.length }}/125 </span>
    </div>
    <div class="heading">Message Info:</div>
    <div class="settings-row">
      <textarea
        class="settingsInput"
        type="email"
        placeholder="Reason for message"
      />
      <span> {{ messageSettings.reason.length }}/300 </span>
    </div>
    <div class="settings-row">
      <textarea
        class="settingsInput"
        type="email"
        placeholder="Call to action"
      />
      <span> {{ messageSettings.callToAction.length }}/400 </span>
    </div>
    <ActionBar
      :messageSettings="messageSettings"
      messageMode="general"
      messageType="pitch"
      :trashButton="trashDisabled"
      :selectedPreset="selectedPreset"
    />
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { useAppState } from "@/snippets/system";
import ActionBar from "../../components/blocks/ActionBar.vue";
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
      offerName: "",
      offerCategory: "",
      challenges: "",
      description: "",
      benefits: "",
      callToAction: "",
      reason: "",
      offerType: "product",
      presetName: "",
      id: "",
    });

    //set offertype display each time it's changed to match the value
    offerTypeDisplayed.value =
      messageSettings.offerType.charAt(0).toUpperCase() +
      messageSettings.offerType.slice(1);

    const onOfferChange = () => {
      offerTypeDisplayed.value =
        messageSettings.offerType.charAt(0).toUpperCase() +
        messageSettings.offerType.slice(1);
    };

    const trashDisabled = computed(() => {
      return selectedPreset.value === undefined ? true : false;
    });

    //computed value for if selectedPreset is empty object set to false
    const selectPresetAction = async () => {
      isDropdownLoading.value = true;
      const config = await getPreset(selectedPreset.value);
      if (config.messageSettings) {
        messageSettings.offerName = config.messageSettings.offerName;
        messageSettings.offerCategory = config.messageSettings.offerCategory;
        messageSettings.challenges = config.messageSettings.challenges;
        messageSettings.description = config.messageSettings.description;
        messageSettings.benefits = config.messageSettings.benefits;
        messageSettings.callToAction = config.messageSettings.callToAction;
        messageSettings.reason = config.messageSettings.reason;
        messageSettings.offerType = config.messageSettings.offerType;
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
      dropdownOptions.value = appState["user"]["presets-general-pitch"];
    };

    watch(
      () => appState["user"]["presets-general-pitch"],
      () => {
        updateDropdownOptions();
      }
    );

    onMounted(() => {
      console.log(appState.activeConfigs);
      if ("general-pitch" in appState.activeConfigs) {
        messageSettings.offerName =
          appState.activeConfigs["general-pitch"]["messageSettings"].offerName;
        messageSettings.offerCategory =
          appState.activeConfigs["general-pitch"][
            "messageSettings"
          ].offerCategory;
        messageSettings.challenges =
          appState.activeConfigs["general-pitch"]["messageSettings"].challenges;
        messageSettings.description =
          appState.activeConfigs["general-pitch"][
            "messageSettings"
          ].description;
        messageSettings.benefits =
          appState.activeConfigs["general-pitch"]["messageSettings"].benefits;
        messageSettings.callToAction =
          appState.activeConfigs["general-pitch"][
            "messageSettings"
          ].callToAction;
        messageSettings.reason =
          appState.activeConfigs["general-pitch"]["messageSettings"].reason;
        messageSettings.id = appState.activeConfigs["general-pitch"].id;
        messageSettings.offerType =
          appState.activeConfigs["general-pitch"]["messageSettings"].offerType;
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
      onOfferChange,
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
