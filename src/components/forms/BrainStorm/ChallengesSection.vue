<template>
  <div class="heading-text">
    Challenges
    <p class="settings-description">Pain points MUHAMMAD may have</p>
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
          text: "Difficulty in identifying growth opportunities for businesses due to limited data or incomplete information.",
          checked: true,
        },
        {
          text: "Challenges in effectively communicating technical concepts and data analysis to non-technical stakeholders.",
          checked: false,
        },
        {
          text: "Struggles in managing multiple projects simultaneously, resulting in delayed timelines and decreased efficiency.",
          checked: false,
        },
        {
          text: "Limited resources, such as budget or manpower, hindering the implementation of data-driven solutions.",
          checked: false,
        },
        {
          text: "Difficulty in keeping up with the constantly evolving digital marketing landscape and identifying new trends and strategies to stay competitive.",
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
.settings-input{
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
