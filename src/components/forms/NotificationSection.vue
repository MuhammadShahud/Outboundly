<template>
  <div class="generalBig">
    <div class="settings-heading">
      <img
        class="backButton"
        @click="updatePropName('general')"
        src="../../assets/back.svg"
      />
      <div class="heading-text">
        Notifications
        <p class="settings-description">
          View your recent notifications here...
        </p>
      </div>
    </div>

    <div class="notification-list">
      <div class="notiHeading">Today</div>

      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-box"
        v-show="notification.type === 'today'"
      >
        <img
          src="../../assets/notiOutboundly.svg"
          alt="Notification Image"
          class="notification-image"
        />
        <div class="notification-content">
          <p>{{ notification.text }}</p>
        </div>
      </div>

      <div class="notiHeading">Yesterday</div>

      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification-box"
        v-show="notification.type === 'yesterday'"
      >
        <img
          src="../../assets/notiOutboundly.svg"
          alt="Notification Image"
          class="notification-image"
        />
        <div class="notification-content">
          <p>{{ notification.text }}</p>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      notifications: [
        {
          id: 1,
          type: "today",
          text: "Lorem Ipsum is simply dummy text of the printing and typesetting...",
        },
        {
          id: 2,
          type: "today",
          text: "Lorem Ipsum is simply dummy text of the printing and typesetting...",
        },
        {
          id: 3,
          type: "yesterday",
          text: "Lorem Ipsum is simply dummy text of the printing and typesetting...",
        },
        {
          id: 4,
          type: "yesterday",
          text: "Lorem Ipsum is simply dummy text of the printing and typesetting...",
        },
      ],
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

.generalBig {
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  overflow-y: scroll;
  height: 400px;
  padding-right: 10px;
  padding-left: 10px;
  padding-top: 16px;
  padding-bottom: 10px;

}

.generalBig::-webkit-scrollbar{
	display: none;
}
.notification {
  padding: 1rem;
}

h2 {
  font-size: 16px;
  color: #252525;
  margin-bottom: 8px;
}

.notification-list {
  display: flex;
  flex-direction: column;
}

.notification-box {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: rgba(195, 233, 255, 0.1);;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
}

.notification-image {
  box-shadow: 1px 15px 20px -12px rgba(0, 0, 0, 0.25);
  margin-right: 1rem;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  font-size: 10px;
  color: #ADADAD;
}

.notiHeading {
  color : #4E4E4E;
  font-size :12px;
}
</style>
