<template>
  <div class="buttons-section">
    <ButtonMain
      class="save-button"
      :loading="isSaveLoading"
      label="Apply Settings"
      @click="saveInfo"
    />
    <ButtonMain
      class="form-action-button"
      icon="pi pi-save"
      v-tooltip.top="'Save as preset'"
      @click="showSavePresetDialog"
    />
    <ButtonMain
      class="form-action-button"
      icon="pi pi-trash"
      :loading="isTrashLoading"
      v-tooltip.top="'Delete preset'"
      :disabled="trashButton"
      @click="deletePresetAction"
    />
  </div>
  <DialogMain v-model:visible="displaySavePreset" @after-hide="afterHide">
    <template #header>
      <h3>Save Template Preset</h3>
    </template>
    <InputText
      class=""
      type="text"
      v-model="presetName"
      maxlength="40"
      minlength="3"
      placeholder="Enter a preset name"
    />
    <template #footer>
      <ButtonMain
        :loading="isSavePresetLoading"
        label="Save"
        @click="savePreset"
      />
      <p class="text-red-600">{{ error }}</p></template
    >
  </DialogMain>
  <DialogMain v-model:visible="displayFieldError">
    <template #header>
      <h2 style="font-size: 24px">Error...</h2>
    </template>
    <p style="text-align: center">Please in fill all the fields</p>
  </DialogMain>
</template>

<script>
import { ref } from "vue";
import { useAppState } from "@/snippets/system";
import {
  updateMessageSettings,
  savePresetSettings,
  deletePreset,
} from "../../snippets/api";

export default {
  props: {
    messageMode: String,
    messageType: String,
    messageSettings: Object,
    trashButton: Boolean,
    selectedPreset: Object,
  },
  setup(props) {
    const appState = useAppState();

    const presetName = ref("");
    const id = ref("");
    const isSaveLoading = ref(false);
    const isTrashLoading = ref(false);
    const isSavePresetLoading = ref(false);
    const displaySavePreset = ref(false);
    const displayFieldError = ref(false);
    const error = ref("");

    const showSavePresetDialog = () => {
      if (!checkObjectValues(props.messageSettings)) {
        displayFieldError.value = true;
        return;
      }
      displaySavePreset.value = true;
    };

    const saveInfo = async () => {
      //make sure none of the messageSettings are undefined or empty
      console.log(props.messageSettings);
      if (!checkObjectValues(props.messageSettings)) {
        displayFieldError.value = true;
        return;
      }

      isSaveLoading.value = true;
      let config = {
        id: id.value,
        messageMode: props.messageMode,
        messageType: props.messageType,
        messageSettings: props.messageSettings,
      };

      const response = await updateMessageSettings(config);
      console.log(response);
      isSaveLoading.value = false;
    };

    const afterHide = () => {
      error.value = "";
      presetName.value = "";
    };

    const deletePresetAction = async () => {
      isTrashLoading.value = true;
      await deletePreset(props.selectedPreset);
      isTrashLoading.value = false;
    };

    // returns true if all values are not undefined or empty
    const checkObjectValues = (obj) => {
      for (let key in obj) {
        if (
          Object.prototype.hasOwnProperty.call(obj, key) &&
          key !== "id" &&
          key !== "presetName"
        ) {
          if (typeof obj[key] === "object") {
            if (!checkObjectValues(obj[key])) {
              return false;
            }
          } else if (!obj[key]) {
            return false;
          }
        }
      }
      return true;
    };

    const savePreset = async () => {
      if (presetName.value.length < 3) {
        error.value = "Preset name must be at least 3 characters long";
        return;
      }

      isSavePresetLoading.value = true;
      let settings = {
        id: id.value,
        presetName: presetName.value,
        messageMode: props.messageMode,
        messageType: props.messageType,
        messageSettings: props.messageSettings,
      };
      try {
        const response = await savePresetSettings(settings);
        if (response.status === "ok") {
          displaySavePreset.value = false;
        } else {
          error.value = response.message;
        }
        //console.log(response);
        isSavePresetLoading.value = false;
      } catch (e) {
        console.log(e);
        error.value = "Unknown error. Try again later.";
      }
      isSavePresetLoading.value = false;
    };

    return {
      displaySavePreset,
      isSaveLoading,
      isTrashLoading,
      isSavePresetLoading,
      presetName,
      error,
      appState,
      saveInfo,
      showSavePresetDialog,
      savePreset,
      afterHide,
      deletePresetAction,
      displayFieldError,
    };
  },
};
</script>

<style scoped>
.buttons-section {
  margin-bottom: 20px;
}
</style>