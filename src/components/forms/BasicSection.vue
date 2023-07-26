<template>
	<div class="form-section">
		<DropDown v-model="selectedPreset" :options="Object.values(dropdownOptionsValues)" optionLabel="name"
			placeholder="Select a saved preset" @change="selectPresetAction" :loading="isDropdownLoading" />

		<div class="headline">
			<i class="pi pi-info"></i>
			<h4>Message info</h4>
		</div>
		<div class="p-input">
			<TextArea v-model="messageSettings.reason" maxlength="400" :autoResize="true" rows="2" cols="30"
				placeholder="Write what your message is about in plain language" />
			<div class="indicator-wrapper">
				<div class="textarea-length-indicator">
					{{ messageSettings.reason.length }}/400
				</div>
			</div>
		</div>
		<div class="p-input">
			<TextArea v-model="messageSettings.callToAction" maxlength="100" :autoResize="true" rows="2" cols="30"
				placeholder="Call to action" />
			<div class="indicator-wrapper">
				<div class="textarea-length-indicator">
					{{ messageSettings.callToAction.length }}/100
				</div>
			</div>
		</div>
		<ActionBar :messageSettings="messageSettings" messageMode="general" messageType="basic" :trashButton="trashDisabled"
			:selectedPreset="selectedPreset" />
	</div>
</template>

<script>
import { onMounted, ref, reactive, computed, watch } from "vue";
import { updateMessageSettings } from "../../snippets/api";
import { useAppState } from "@/snippets/system";
import ActionBar from "../../components/blocks/ActionBar.vue";
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
				messageSettings.presetName = config.presetName

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

<style></style>