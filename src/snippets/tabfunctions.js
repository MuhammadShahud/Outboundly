function initTabs() {
	const tabHeader = document.querySelector(".tab-header");
	const tabIndicator = document.querySelector(".tab-indicator");
	const tabBody = document.querySelector(".tab-body");
	const tabsPane = tabHeader.querySelectorAll("div");
	// const settingsSection = document.querySelector(".settings-section");
	// const settingsButton = document.querySelector(".settings");
	let currentTab = tabBody.querySelector(".active");

	function activateTab(tab, index) {
		currentTab.classList.add("active");
		tabHeader.querySelector(".active").classList.remove("active");
		tab.classList.add("active");
		currentTab.classList.remove("active");
		tabBody.querySelectorAll(".tab-content").forEach(function (content) {
			content.classList.remove("active");
		});
		tabBody.querySelectorAll(".tab-content")[index].classList.add("active");
		tabIndicator.style.left = `calc(calc(100% / ${tabsPane.length}) * ${index})`;
		currentTab = tab;
	}

	tabsPane.forEach(function (tab, index) {
		tab.addEventListener("click", function () {
			activateTab(tab, index); // change this line
		});
	});

/* 	settingsButton.addEventListener("click", function () {
		tabBody.querySelectorAll(".tab-content").forEach(function (content) {
			content.classList.remove("active");
		});
		settingsSection.classList.add("active");
	}); */
}

export { initTabs };
