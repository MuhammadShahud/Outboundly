<template>
  <div class="tools">
    <div class="tools-heading">Tools</div>
    <div class="tools-content">
      <p>Lorem Ipsum is simply dummy Lorem Ipsum is simply dummy</p>
      <div class="upload-csv" @dragover.prevent @drop="handleFileUpload">
        <div class="csv-title">Upload a CSV list</div>
        <img src="../../assets/uploadCsv.svg" alt="Upload icon" />
      </div>
      <div class="tools-boxes">
        <div class="tools-box">
          <img src="../../assets/email.svg" />
          <span>Email Integration</span>
        </div>
        <div class="tools-box">
          <img src="../../assets/crm.svg" />
          <span>CRM Integration</span>
        </div>
        <div class="tools-box">
          <img src="../../assets/msg.svg" />
          <span>Message Stats</span>
        </div>
      </div>
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

    const handleFileUpload = (event) => {
      event.preventDefault();
      // const files = event.dataTransfer.files;
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
      handleFileUpload,
    };
  },
};
</script>

<style>

</style>
