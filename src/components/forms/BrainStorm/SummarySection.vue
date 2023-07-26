<template>
  <div class="row">
    <img src="../../../assets/furqan.svg" alt="Furqan" class="profile-pic" />
    <div class="details">
      <h2 class="name">Muhammad Furqan</h2>
      <p class="profession">Lead UI UX Designer at Plum Tree Group</p>
    </div>
  </div>
  <div class="heading-text">
    Profile Summary
    <p class="settings-description">About MUHAMMAD</p>
  </div>
  <div v-for="(item, index) in items" :key="index" class="item">
    <h2>{{ index + 1 }}.</h2>
    <p>{{ item.text }}</p>
    <input type="checkbox" class="analyzeCheckbox" v-model="item.checked" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      items: [
        {
          text: " Muhammad is a highly analytical and detail-oriented business analyst with experience in improving business processes, identifying growth opportunities, and implementing data-driven solutions.",
          checked: true,
        },
        {
          text: "He is skilled in data analysis, project management, and stakeholder communication, and has a proven ability to turn complex data into actionable insights resulting in increased efficiency and revenue growth.",
          checked: false,
        },
        {
          text: "Muhammad is a strong communicator with a talent for simplifying technical concepts for non-technical stakeholders, making him an effective bridge between technical and business teams.",
          checked: false,
        },
        {
          text: "He is passionate about digital marketing and has been serving the industry for the last two years, committed to helping businesses boost their online presence and reach.",
          checked: false,
        },
        {
          text: "Muhammad is also experienced in digital transformation and brand management, making him a well-rounded professional capable of driving business success through a holistic approach.",
          checked: false,
        },
      ],
    };
  },
};
</script>

<style></style>
