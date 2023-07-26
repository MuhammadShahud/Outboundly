// Listen for the message from the background script
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "loadContentScript") {
    if (request.url.includes("linkedin.com/in/")) {
      console.log("script1");
      observeTargetElement();
    }
  }
});

// Function to observe the target element
function observeTargetElement() {
  // Check if the button has already been injected
  const buttonInjected = document.querySelector("#customButton");
  if (buttonInjected) {
    console.log("buttonInjected");
    return; // Button has already been injected, no need to observe further
  }

  // Select the target element for mutation observation

  // Create a MutationObserver to wait for the target element
  const observer = new MutationObserver(function (mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        console.log("observer start");

        const targetElement = document.querySelector(".pvs-profile-actions");
        if (targetElement) {
          console.log("second func");

          // Target element found, inject the custom button
          injectCustomButton(targetElement);

          // Disconnect the observer since we no longer need it
          observer.disconnect();
          break;
        }
      }
    }
  });

  // Start observing changes to the document
  observer.observe(document, { childList: true, subtree: true });
}

// Function to inject the custom button
function injectCustomButton(targetElement) {
  console.log("func start");
  // Create the custom button
  const button = document.createElement("button");
  button.id = "customButton";
  button.innerText = "Custom Button";

  // Style the button (add your own styles or classes here) artdeco-button artdeco-button--2 artdeco-button--primary ember-view
  button.classList.add(
    "artdeco-button",
    "artdeco-button--2",
    "artdeco-button--primary",
    "ember-view"
  );
  button.innerHTML = `<img class="artdeco-button__icon" src=${chrome.runtime.getURL(
    "profileOut.svg"
  )} />
    <span class="artdeco-button__text">Compose</span>
    `;

  // Add an event listener to the button (you can customize the action)
  button.addEventListener("click", function () {
    alert("Custom button clicked!");
  });

  // Insert the button after the target element
  targetElement.parentNode.insertBefore(button, targetElement.nextSibling);


}
