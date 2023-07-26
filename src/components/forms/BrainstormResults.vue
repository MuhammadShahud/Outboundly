<template>
  <div class="analyzeDiv">
    <div class="sidebar">
      <div class="newLogo">
        <img
          @click="updatePropName('general')"
          src="../../assets/outboundly.svg"
          alt="Logo"
        />
      </div>

      <div class="menu">
        <img
          v-if="activeNav !== 'summary'"
          @click="activeNav = 'summary'"
          src="../../assets/summaryEmpty.svg"
          alt="Logo 1"
        />
        <img v-else src="../../assets/summaryFilled.svg" alt="Logo 1" />
        <img
          v-if="activeNav !== 'challenges'"
          @click="activeNav = 'challenges'"
          src="../../assets/challengesEmpty.svg"
          alt="Logo 2"
        />
        <img v-else src="../../assets/challengesFilled.svg" alt="Logo 2" />

        <img
          v-if="activeNav !== 'sell'"
          @click="activeNav = 'sell'"
          src="../../assets/sellEmpty.svg"
          alt="Logo 3"
        />
        <img v-else src="../../assets/sellFilled.svg" alt="Logo 3" />

        <img
          v-if="activeNav !== 'build'"
          @click="activeNav = 'build'"
          src="../../assets/buildEmpty.svg"
          alt="Logo 4"
        />
        <img v-else src="../../assets/buildFilled.svg" alt="Logo 4" />
      </div>
      <div class="bottom-logo">
        <img
          @click="updatePropName('brainstorm')"
          src="../../assets/analyzeBack.svg"
          alt="Bottom Logo"
        />
      </div>
    </div>
    <div class="rightSide" v-show="activeNav === 'summary'">
      <SummarySection />
    </div>
    <div class="rightSide" v-show="activeNav === 'challenges'">
      <ChallengesSection />
    </div>
    <div class="rightSide" v-show="activeNav === 'sell'">
      <SellSection />
    </div>
    <div class="rightSide" v-show="activeNav === 'build'">
      <BuildSection />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import SummarySection from "./BrainStorm/SummarySection.vue";
import ChallengesSection from "./BrainStorm/ChallengesSection.vue";
import SellSection from "./BrainStorm/SellSection.vue";
import BuildSection from "./BrainStorm/BuildSection.vue";

export default {
  components: {
    SummarySection,
    ChallengesSection,
    SellSection,
    BuildSection,
  },
  props: {
    results: Object,
    profileInfo: Object,
  },
  setup(props) {
    const resultsData = ref(props.results);
    const profileInfoData = ref(props.profileInfo);
    const activeNav = ref("summary");

    onMounted(() => {
      console.log(props.results);
      console.log(props.profileInfo);
    });

    return {
      resultsData,
      profileInfoData,
      activeNav,
    };
  },
  methods: {
    updatePropName(newValue) {
      this.$emit("updatePropName", newValue);
    },
  },
};
</script>

<style>

</style>
