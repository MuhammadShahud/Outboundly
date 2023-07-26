<template>
  <div class="settings">
    <div class="heading">General Message Settings</div>
    <div class="settings-content">
      <DropDown class="general-settings-dropdown" v-model="messageTone" :options="toneOptions" optionLabel="name"
			placeholder="Choose message tone" @change="updateMessageTone" />
      <DropDown class="general-settings-dropdown" v-model="messageLength" :options="lengthOptions" optionLabel="name"
			placeholder="Choose message length" />
    </div>
    <div class="heading">Personal Info</div>
    <div class="settings-content">
      <div class="settings-row">
        <input
          id="name-input"
          class="settings-input"
          type="text"
          v-model="firstName"
          maxlength="30"
          placeholder="First Name"
        />
      </div>
      <div class="settings-row">
        <input
          id="email-input"
          v-model="lastName"
          maxlength="25"
          class="settings-input"
          type="email"
          placeholder="Last Name"
        />
      </div>
      <div class="settings-row">
        <input
          id="phone-input"
          v-model="businessName"
          maxlength="40"
          class="settings-input"
          type="tel"
          placeholder="Buisness Name"
        />
      </div>
    </div>
    <div class="settings-buttons">
      <button class="settings-button" style="margin-bottom:16px" @click="saveInfo" :loading="isSaveLoading">Save</button>
      <button class="settings-button2" @click="logout">
        Logout
      </button>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { updateUserSettings } from "../../snippets/api";
import { useAppState } from "../../snippets/system";
export default {
  setup() {
    const appState = useAppState();

    const isSaveLoading = ref(false);

    const toneOptions = ref([
      {
        name: "Mirror",
        code: "mirror",
        description:
          "A versatile tone that adjusts to the recipient's communication style, fostering maximum rapport and effective engagement.",
      },
      {
        name: "Neutral",
        code: "neutral",
        description:
          "A balanced and impartial tone, suitable for most situations.",
      },
      {
        name: "Engaging",
        code: "engaging",
        description:
          "A captivating and attention-grabbing tone that draws readers in.",
      },
      {
        name: "Professional",
        code: "professional",
        description:
          "A formal and polished tone that conveys expertise and competence.",
      },
      {
        name: "Witty",
        code: "witty",
        description: "A clever and humorous tone that adds a touch of levity.",
      },
      {
        name: "Conversational",
        code: "conversational casual",
        description:
          "A friendly and informal tone that encourages dialogue and connection.",
      },
      {
        name: "Laid back",
        code: "Laid back",
        description: "A relaxed and easygoing tone that puts readers at ease.",
      },
      {
        name: "Assertive",
        code: "assertive",
        description:
          "A confident and forceful tone that conveys self-assurance and determination.",
      },
      {
        name: "Enthusiastic",
        code: "enthusiastic",
        description:
          "A passionate and energetic tone that expresses excitement and optimism.",
      },
      {
        name: "Charismatic",
        code: "charismatic",
        description:
          "An engaging and charming tone that captures the reader's imagination.",
      },
      {
        name: "Confident",
        code: "confident",
        description:
          "A self-assured and decisive tone that projects authority and conviction.",
      },
      {
        name: "Persuasive",
        code: "persuasive",
        description:
          "A convincing and compelling tone that influences and motivates readers.",
      },
      {
        name: "Empathetic",
        code: "empathetic",
        description:
          "A compassionate and understanding tone that fosters connection and trust.",
      },
    ]);

    const lengthOptions = ref([
      { name: "Normal", code: "normal" },
      { name: "Brief", code: "brief" },
    ]);

    const firstName = ref("");
    const lastName = ref("");
    const businessName = ref("");
    const messageTone = ref("mirror");
    const messageLength = ref("normal");
    const toneDescription = ref("");

    // update tone description when tone is changed

    const updateMessageTone = () => {
      toneDescription.value = toneOptions.value.find(
        (x) => x.code === messageTone.value.code
      ).description;
    };

    onMounted(() => {
      if (appState.user) {
        firstName.value = appState.user.firstName;
        lastName.value = appState.user.lastName;
        businessName.value = appState.user.businessName;
        messageTone.value = appState.user.messageTone;
        messageLength.value = appState.user.messageLength;
      }
    });

    const saveInfo = async () => {
      isSaveLoading.value = true;
      let settings = {
        userId: useAppState.userId,
        firstName: firstName.value,
        lastName: lastName.value,
        businessName: businessName.value,
        messageTone: messageTone.value,
        messageLength: messageLength.value,
      };

      await updateUserSettings(settings);
      isSaveLoading.value = false;
    };

    const logout = async () => {
      appState.setLoggedOut();
    };

    return {
      firstName,
      lastName,
      businessName,
      messageTone,
      messageLength,
      toneOptions,
      lengthOptions,
      isSaveLoading,
      toneDescription,
      saveInfo,
      logout,
      updateMessageTone,
    };
  },
};
</script>

<style>

</style>
