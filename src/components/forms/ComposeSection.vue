<template>
  <!-- Compose Component -->
  <div v-show="edit === false" class="generalBig">
    <div class="compose-heading">
      <img @click="updatePropName('general')" src="../../assets/back.svg" />
      <div class="heading-text">
        Message
        <p class="settings-description">
          Copy the message and send to your prospector.
        </p>
      </div>
    </div>
    <div class="row">
      <img src="../../assets/furqan.svg" alt="Furqan" class="profile-pic" />
      <div class="details">
        <h2 class="name">Muhammad Furqan</h2>
        <p class="profession">Lead UI UX Designer at Plum Tree Group</p>
      </div>
    </div>
    <div class="column" style="margin-bottom: 10px">
      <h3 class="info-title">Contact Info:</h3>
      <div class="image-info">
        <img src="../../assets/phone.svg" alt="Email" class="info-icon" />
        <p class="info-text">furqan@plumtreegroup.net</p>
      </div>
      <div class="image-info">
        <img src="../../assets/num.svg" alt="Phone" class="info-icon" />
        <p class="info-text">+1 123 456 789</p>
      </div>
    </div>
    <div class="message-templates-row">
      <textarea
        v-model="localMessage"
        maxlength="3000"
        :autoResize="true"
        style="min-height: 210px"
        id="message-template-content"
        class="message-templates-input2"
        type="text"
        placeholder="Your message here"
      />
      <span style="top: 85%">{{ localMessage.length }}/3000</span>
    </div>
    <div class="orHeading">Rate the content, is it useful?</div>

    <div class="image-text-image">
      <img src="../../assets/thumbsUp.svg" alt="Image 1" class="image" />
      <span class="text">or</span>
      <img src="../../assets/thumbsDown.svg" alt="Image 2" class="image" />
    </div>
    <div class="settings-buttons row">
      <button class="settings-button" @click="copyToClipboard">
        Copy to clipboard
      </button>
      <div
        class="div1 compose"
        ref="editButton"
        @click="toggleEdit"
        severity="success"
        style="margin-left: 5px; height: 40px"
      >
        <img style="padding-top: 0px" src="../../assets/compose.svg" />
        <span>Edit</span>
        <Menu
          ref="menuEdit"
          position="top-start"
          id="overlay_menu"
          :model="itemsEditMenu"
          :popup="true"
        />
        <Toast />
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watchEffect } from "vue";
import { useAppState } from "@/snippets/system";
import Menu from "primevue/menu";
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { requestEdit } from "@/snippets/api";

export default {
  props: {
    message: String,
    status: String,
    pageData: Object,
  },
  components: {
    Menu,
    Toast,
  },
  setup(props) {
    const appState = useAppState();
    const composeComplete = ref(false);
    const localMessage = ref(props.message || "");
    const timer = ref(30);
    const toast = useToast();
    const messageStatus = ref(props.status);
    const currentPageData = ref(props.pageData);

    const isMessageValid = computed(() => {
      return localMessage.value && localMessage.value.trim().length > 0;
    });

    watchEffect(() => {
      localMessage.value = props.message || "";
    });

    watchEffect(() => {
      messageStatus.value = props.status || "";
    });

    watchEffect(() => {
      currentPageData.value = props.pageData || "";
    });

    const copyToClipboard = () => {
      navigator.clipboard.writeText(localMessage.value);
      toast.add({
        severity: "success",
        summary: "Copied",
        detail: "Message copied to clipboard",
        life: 3000,
      });
    };

    let interruptReverseType = false;

    const reverseTypeEffect = async () => {
      interruptReverseType = false;
      while (localMessage.value.length > 0 && !interruptReverseType) {
        localMessage.value = localMessage.value.slice(0, -3);
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    };

    const typingEffect = async (stringToType) => {
      interruptReverseType = true; // Interrupt the reverse typing effect if it's running
      await new Promise((resolve) => setTimeout(resolve, 50)); // Small delay to allow the reverse typing effect to stop

      for (const char of stringToType) {
        localMessage.value += char;
        await new Promise((resolve) => setTimeout(resolve, 0.01));
      }
    };

    const openEmail = (email) => {
      let subject = encodeURIComponent("Reaching Out");
      let body = encodeURIComponent(localMessage.value);
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
      toast.add({
        severity: "success",
        summary: "Copied",
        detail: "Message sent to email software",
        life: 3000,
      });
    };

    const callPhone = (phone) => {
      navigator.clipboard.writeText(phone);
      toast.add({
        severity: "success",
        summary: "Copied",
        detail: "Phone number copied to clipboard",
        life: 3000,
      });
    };

    const openInCurrentTab = (url) => {
      chrome.tabs.update({ url, selected: true, active: true });
      navigator.clipboard.writeText(localMessage.value);
      toast.add({
        severity: "success",
        summary: "Copied",
        detail: "Message copied to clipboard",
        life: 3000,
      });
    };

    const menuEdit = ref(null);
    const itemsEditMenu = ref([
      {
        label: "Length Options",
        items: [
          {
            label: "Make Shorter",
            icon: "pi pi-minus",
            command: async () => {
              await editMessage("shorter");
            },
          },
          {
            label: "Make Longer",
            icon: "pi pi-plus",
            command: async () => {
              await editMessage("longer");
            },
          },
        ],
      },
      {
        label: "Tone Options",
        items: [
          {
            label: "More Professional",
            icon: "pi pi-briefcase",
            command: async () => {
              await editMessage("professional");
            },
          },
          {
            label: "More Engaging",
            icon: "pi pi-comments",
            command: async () => {
              await editMessage("engaging");
            },
          },
          {
            label: "More Casual",
            icon: "pi pi-comment",
            command: async () => {
              await editMessage("casual");
            },
          },
          {
            label: "More Witty",
            icon: "pi pi-star",
            command: async () => {
              await editMessage("witty");
            },
          },
          {
            label: "More Persuasive",
            icon: "pi pi-megaphone",
            command: async () => {
              await editMessage("persuasive");
            },
          },
          {
            label: "More Friendly",
            icon: "pi pi-heart",
            command: async () => {
              await editMessage("friendly");
            },
          },
        ],
      },
      {
        label: "Message Options",
        items: [
          {
            label: "Reset Edits",
            icon: "pi pi-arrow-circle-left",
            command: async () => {
              localMessage.value = props.message;
              toast.add({
                severity: "success",
                summary: "Updated",
                detail: "Message Reset",
                life: 3000,
              });
            },
          },
        ],
      },
    ]);

    const toggleEdit = (event) => {
      menuEdit.value.toggle(event);
    };

    const editMessage = async (mode) => {
      const tempMessage = localMessage.value;
      reverseTypeEffect();
      const response = await requestEdit(tempMessage, mode);
      if (response.status == "error") {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: response.message,
          life: 3000,
        });
        return;
      } else {
        await typingEffect(response.message);
      }
    };

    return {
      appState,
      composeComplete,
      localMessage,
      messageStatus,
      currentPageData,
      isMessageValid,
      timer,
      itemsEditMenu,
      menuEdit,
      toggleEdit,
      copyToClipboard,
      openInCurrentTab,
      openEmail,
      callPhone,
    };
  },
  data() {
    return {
      edit: false,
      dropdownOpen: false,
      dropdownOpen2: false,
      selectedOption: null,
      selectedOption2: null,

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
      options2: [
        {
          id: 1,
          image: "../../assets/moreEngaging.svg",
          text: "More Engaging",
        },
        {
          id: 2,
          image: "../../assets/witty.svg",
          text: "More Witty",
        },
        {
          id: 3,
          image: "../../assets/moreProf.svg",
          text: "More Professional",
        },
        {
          id: 4,
          image: "../../assets/moreCasual.svg",
          text: "More Casual",
        },
        {
          id: 5,
          image: "../../assets/makeNeutral.svg",
          text: "Make Neutral",
        },
      ],
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    },
    toggleDropdown2() {
      this.dropdownOpen2 = !this.dropdownOpen2;
    },
    selectOption(option) {
      this.selectedOption = option;
      this.dropdownOpen = false;
    },
    selectOption2(option) {
      this.selectedOption2 = option;
      this.dropdownOpen2 = false;
    },
    updatePropName(newValue) {
      this.$emit("updatePropName", newValue);
    },
  },
};
</script>

<style>

</style>
