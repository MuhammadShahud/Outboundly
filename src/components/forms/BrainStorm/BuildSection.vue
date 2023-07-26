<template>
  <div class="heading-text">
    Build rapport with MUHAMMAD
    <p class="settings-description">Suggested Questions to Ask</p>
  </div>
  <div v-for="(item, index) in items" :key="index" class="item">
    <h2>{{ index + 1 }}.</h2>
    <p>{{ item.text }}</p>
    <input type="checkbox" class="analyzeCheckbox" v-model="item.checked" />
  </div>
  <div style="display: flex; margin-bottom: 10px">
    <div class="compose" @click="activeTab = 'compose'">
      <img src="../../../assets/compose.svg" />
      <span>Compose</span>
    </div>
    <select
      value="Select a saved preset"
      id="language-select"
      v-model="language"
      class="settings-input"
      @change="handleChangeLanguage"
    >
      <option value="" selected>Message Mode</option>
    </select>
  </div>
  <div class="heading-text">Enter your business details</div>
  <textarea
    class="settingsInput"
    type="email"
    placeholder="Lorem Ipsum is simply dummy text of the printing and typesetting..."
  />
  <div class="column">
    <button @click="updatePropName('analyze')" class="analyze-button">
      Analyze Furqan's Profile
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          text: "What led you to become a Business Analyst?",
          checked: true,
        },
        {
          text: "How do you approach identifying growth opportunities in a business?",
          checked: false,
        },
        {
          text: "Could you share an example of a successful project you managed?",
          checked: false,
        },
        {
          text: "How do you communicate complex data and technical concepts to non-technical stakeholders?",
          checked: false,
        },
        {
          text: "What are some common challenges you face in implementing data-driven solutions?",
          checked: false,
        },
        {
          text: "How do you measure the success of a project or solution?",
          checked: false,
        },
        {
          text: "Could you share your experience with digital transformation initiatives?",
          checked: false,
        },
        {
          text: "What are some digital marketing strategies that you believe are most effective?",
          checked: false,
        },
        {
          text: "How do you stay up-to-date with the latest industry trends and best practices?",
          checked: false,
        },
        {
          text: "Could you tell me about a time when you had to troubleshoot a problem in a project or initiative?",
          checked: false,
        },
      ],
    };
  },
};
</script>

<style scoped>
.compose {
  display: flex;
  align-items: center;
  color: white;
  background-color: #3b82f6;
  width: 42%;
  height: 28px;
  border-radius: 3px;
  justify-content: center;
  transition: background-color 0.3s ease;
  margin-right: 4%;
}

.settingsInput {
  min-height: 124px;
  margin-top: 5px;
}
.settings-input {
  padding: 0.5rem;
  border-radius: 6px;
  border: none;
  background-color: rgba(228, 245, 255, 0.45);
  font-size: 12px;
  box-sizing: border-box;
  width: 54%;
  color: #adadad;
  min-height: 30px;
}
</style>
