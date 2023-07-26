<template>
  <div class="message-templates">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('home')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Message Templates
        <p class="settings-description">Select the saved massage templates</p>
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
    <div class="message-templates-row">
      <textarea
        v-model="messageSettings.template"
        maxlength="2000"
        :autoResize="true"
        id="message-template-content"
        class="message-templates-input2"
        type="text"
        placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry"
      />
      <span>{{ messageSettings.template.length }}/2000</span>
    </div>
    <ActionBar
      :messageSettings="messageSettings"
      messageMode="template"
      messageType="basic"
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
    const presetName = ref("");
    const id = ref("");
    const isDropdownLoading = ref(false);
    const selectedPreset = ref();
    const messageSettings = reactive({
      template: "",
    });

    const trashDisabled = computed(() => {
      return selectedPreset.value === undefined ? true : false;
    });

    const dropdownOptions = ref([]);
    const dropdownOptionsValues = computed(() => {
      return dropdownOptions.value ? Object.values(dropdownOptions.value) : [];
    });

    const updateDropdownOptions = () => {
      dropdownOptions.value = appState["user"]["presets-template-basic"];
    };

    watch(
      () => appState["user"]["presets-template-basic"],
      () => {
        updateDropdownOptions();
      }
    );

    onMounted(() => {
      //wait for local storage to finish loading before setting values
      if ("template-basic" in appState.activeConfigs) {
        presetName.value =
          appState.activeConfigs["template-basic"]["presetName"];
        id.value = appState.activeConfigs["template-basic"]["id"];
        messageSettings.template =
          appState.activeConfigs["template-basic"]["messageSettings"][
            "template"
          ];
      }
      updateDropdownOptions();
    });

    //computed value for if selectedPreset is empty object set to false
    const selectPresetAction = async () => {
      isDropdownLoading.value = true;
      const config = await getPreset(selectedPreset.value);
      console.log(config);
      if (config.messageSettings.template) {
        messageSettings.template = config.messageSettings.template;
        trashDisabled.value = false;
      }

      isDropdownLoading.value = false;
    };

    return {
      trashDisabled,
      isDropdownLoading,
      selectedPreset,
      presetName,
      appState,
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
