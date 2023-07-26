import { validateToken } from "./api";
import { defineStore } from "pinia";

export const useAppState = defineStore("appState", {
  state: () => {
    return {
      activeTab: "general",
      loggedIn: false,
      user: {},
      activeConfigs: {},
      selectedMode: {},
    };
  },
  actions: {
    setActiveTab(tab) {
      this.activeTab = tab;
    },
    setLoggedIn() {
      this.loggedIn = true;
    },
    setUserData(user) {
      this.user = user;
      syncLocalStorage("user", this.user);
    },
    setLoggedOut() {
      this.user = {};
      this.activeConfigs = {};
      localStorage.clear();
      //clear chrome extension storage if running in extension environment
      if (chrome && chrome.storage) {
        chrome.storage.local.clear();
        chrome.storage.sync.clear();
        console.log("cleared chrome storage");
      }
      this.loggedIn = false;
    },
    syncMessageSettings(messageData) {
      let templateMode = messageData.messageMode;
      let templateType = messageData.messageType;
      let keyName = `${templateMode}-${templateType}`;
      let newData = { [keyName]: messageData };

      //merge messagedata to activetemplate using
      this.activeConfigs = { ...this.activeConfigs, ...newData };
      syncLocalStorage("activeConfigs", this.activeConfigs);
    },
    setMode(mode) {
      this.selectedMode = mode;
      syncLocalStorage("selectedMode", this.selectedMode);
      //console.log('set mode', this.selectedMode)
    },
  },
});

export const init = async (appState) => {
  //console.log('init started')

  //init user
  //get from local storage
  //check if running in extension environment

  if (chrome && chrome.storage) {
    const resultUser = await getStorageData("user");

    if (resultUser.user) {
      appState.user = resultUser.user;
      appState.setLoggedIn();
      //appState.user = await syncUser(appState.user.userId)
    }

    const resultactiveConfigs = await getStorageData("activeConfigs");
    if (resultactiveConfigs.activeConfigs) {
      appState.activeConfigs = resultactiveConfigs.activeConfigs;
    }
  } else {
    // get from local storage
    let user = localStorage.getItem("user");
    if (user) {
      try {
        appState.user = JSON?.parse(user);
        appState.setLoggedIn();
      } catch (e) {
        appState.user = {};
      }
    }
  }
  // get active templates from local storage
  let activeConfigs = localStorage.getItem("activeConfigs");
  if (activeConfigs) {
    try {
      appState.activeConfigs = JSON?.parse(activeConfigs);
    } catch (e) {
      appState.activeConfigs = {};
    }
  }

  // validate user check if user info exists if not set status to logged out
  if (!appState.user.token) {
    appState.setLoggedOut();
    return;
  }

  validateToken(appState.user.token).then((response) => {
    if (response.code !== "jwt_auth_valid_token") {
      appState.setLoggedOut();
    }
  });

  return true;
};

export async function syncLocalStorage(key, data) {
  //store user to local storage
  if (chrome && chrome.storage) {
    chrome.storage.sync.set({ [key]: data });
  } else {
    localStorage.setItem(key, JSON.stringify(data));
  }
  //console.log('Data saved to local storage');
}

function getStorageData(key) {
  //console.log('getting data from local storage', key)
  if (chrome && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(key, function (result) {
        if (result) {
          resolve(result);
        } else {
          reject("no data found");
        }
      });
    });
  } else {
    let data = localStorage.getItem(key);
    if (data) {
      try {
        return JSON?.parse(data);
      } catch (e) {
        return {};
      }
    }
  }
}
