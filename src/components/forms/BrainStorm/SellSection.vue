<template>
  <div class="heading-text">
    Sell to MUHAMMAD
    <p class="settings-description">One liners to use</p>
  </div>
  <div v-for="(item, index) in items" :key="index" class="item">
    <h2>{{ index + 1 }}.</h2>
    <p>{{ item.text }}</p>
    <input type="checkbox" class="analyzeCheckbox" v-model="item.checked" />
  </div>
  <div style="display: flex">
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
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          text: "Improve your business processes and drive revenue growth with the analytical expertise of our experienced Business Analyst Muhammad.",
          checked: true,
        },
        {
          text: "Unlock opportunities for growth and success with Muhammad's data-driven solutions and project management skills.",
          checked: false,
        },
        {
          text: "Transform your digital presence and elevate your brand with the digital marketing expertise of Muhammad.",
          checked: false,
        },
        {
          text: "Communicate effectively with stakeholders and simplify technical concepts with the strong communication skills of Muhammad.",
          checked: false,
        },
        {
          text: "Enhance your business strategy and gain valuable insights with Muhammad's talent for turning complex data into actionable solutions.",
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
