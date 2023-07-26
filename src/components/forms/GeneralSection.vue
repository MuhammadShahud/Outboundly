<template>
  <div v-if="activeBtn === 'home'">
    <div class="messaging">
      <h3>Messaging Modes</h3>
      <p>
        Choose a mode to get started. Each mode has a different purpose and is
        designed to help you craft the perfect message for your prospect.
      </p>
    </div>
    <div class="boxes">
      <div class="row">
        <div class="box" @click="activeBtn = 'general'">
          <img src="../../assets/general.svg" />
          <span>General</span>
        </div>
        <div class="box" @click="activeBtn = 'template'">
          <img src="../../assets/starter.svg" />
          <span>Template</span>
        </div>
        <div class="box" @click="activeBtn = 'pitch'">
          <img src="../../assets/pitch.svg" />
          <span>Pitch</span>
        </div>
      </div>
      <div class="row">
        <div class="box" @click="activeBtn = 'connection'">
          <img src="../../assets/connection.svg" />
          <span>Connection Request</span>
        </div>
        <div class="box" @click="activeBtn = 'recruiter'">
          <img src="../../assets/recruiter.svg" />
          <span>Recruiter</span>
        </div>
        <div class="box" @click="activeBtn = 'custom'">
          <img src="../../assets/custom.svg" />
          <span>Custom</span>
        </div>
      </div>
    </div>
  </div>
  <div class="backDiv" v-if="activeBtn === 'general'">
    <GeneralTab :propName="activeBtn" @updatePropName="updateParentData" />
  </div>
  <div class="backDiv" v-if="activeBtn === 'template'">
    <TemplateSection @updatePropName="updateParentData" />
  </div>
  <div class="backDiv" v-if="activeBtn === 'pitch'">
    <PitchSection @updatePropName="updateParentData" />
  </div>
  <div class="backDiv" v-if="activeBtn === 'connection'">
    <ConnectionSection @updatePropName="updateParentData" />
  </div>
  <div class="backDiv" v-if="activeBtn === 'recruiter'">
    <RecruitSection @updatePropName="updateParentData" />
  </div>
  <div class="backDiv" v-if="activeBtn === 'custom'">
    <CustomSection @updatePropName="updateParentData" />
  </div>
</template>
<script>
import { ref } from "vue";
import GeneralTab from "./GeneralTab.vue";
import TemplateSection from "./TemplateSection.vue";
import PitchSection from "./PitchSection.vue";
import ConnectionSection from "./ConnectionSection.vue";
import RecruitSection from "./RecruitSection.vue";
import CustomSection from "./CustomSection.vue";

export default {
  name: "GeneralSection",
  components: {
    GeneralTab,
    TemplateSection,
    PitchSection,
    ConnectionSection,
    RecruitSection,
    CustomSection,
  },
  setup() {
    const activeBtn = ref("home");
    console.log("done", activeBtn);
    return {
      activeBtn,
    };
  },
  methods: {
    updateParentData(newValue) {
      this.activeBtn = newValue;
    },
  },
};
</script>
<style scoped>

</style>
