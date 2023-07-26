var linkElement = document.createElement("link");
linkElement.rel = "stylesheet";
linkElement.href = chrome.runtime.getURL("contentscript.css");

var container = document.querySelector(".outWhole");
var iframe;

if (!container) {
  container = document.createElement("div");
  container.classList.add("outWhole");
  container.style.position = "absolute";
  container.style.top = "50%";
  container.style.right = "0";
  container.style.transform = "translateY(-50%)";
  container.style.zIndex = "9999";

  // Make the container draggable

  var img = document.createElement("div");
  img.classList.add("image");
  img.style.backgroundImage = 'url("' + chrome.runtime.getURL("l1.png") + '")';

  img.addEventListener("mouseover", function () {
    img.classList.add("hover");
  });

  img.addEventListener("mouseout", function () {
    img.classList.remove("hover");
  });

  img.addEventListener("click", function () {
    createIframe();
  });

  container.appendChild(img);
  document.body.appendChild(container);
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  console.log("Content Script Received Message:", message);

  if (message.type === "showImageDiv") {
    var img = document.createElement("div");
    img.classList.add("image");
    img.style.backgroundImage =
      'url("' + chrome.runtime.getURL("l1.png") + '")';

    img.addEventListener("mouseover", function () {
      img.classList.add("hover");
    });

    img.addEventListener("mouseout", function () {
      img.classList.remove("hover");
    });

    img.addEventListener("click", function () {
      createIframe();
    });

    container.innerHTML = "";
    container.style.removeProperty("width");
    container.style.removeProperty("height");
    disableDrag();
    // Remove existing content
    container.appendChild(img);
  }
});

function createIframe() {
  iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("index.html");
  iframe.id = "app";
  iframe.style.position = "absolute";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.borderRadius = "0px 10px 10px 0px";

  dragBtn = document.createElement("div");
  dragBtn.classList.add("dragBtn");
  var dragImg = document.createElement("img");
  dragImg.src = chrome.runtime.getURL("dragLogo.svg");
  dragBtn.appendChild(dragImg);
  dragBtn.addEventListener("click", function () {
    iframe.style.pointerEvents = "none";
    dragBtn.style.backgroundColor = "#3B82F6";
    iframe.style.opacity = "0.7";
  });

  container.style.width = "314px";
  container.style.height = "440px";

  container.innerHTML = ""; // Remove existing content
  container.appendChild(dragBtn);
  container.appendChild(iframe);

  // Make the container and iframe draggable
  makeElementDraggable(container);
  makeElementDraggable(iframe);
}

function makeElementDraggable(element) {
  var pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;

  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    console.log("startDrag");
    e = e || window.event;
    e.preventDefault();
    // get the mouse cursor position at startup:
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // call a function whenever the cursor moves:
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    console.log("draggingg");

    e = e || window.event;
    e.preventDefault();
    // calculate the new cursor position:
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // set the element's new position:
    element.style.top = element.offsetTop - pos2 + "px";
    element.style.left = element.offsetLeft - pos1 + "px";
  }

  function closeDragElement() {
    console.log("StopDraggingg");

    // stop moving when mouse button is released:
    document.onmouseup = null;
    document.onmousemove = null;

    // Adjust the position of the iframe within the container
    if (iframe) {
      iframe.style.top = iframe.offsetTop - pos2 + "px";
      iframe.style.left = iframe.offsetLeft - pos1 + "px";
      iframe.style.pointerEvents = "auto";
      iframe.style.opacity = "1";
      dragBtn.style.backgroundColor = "#858585";
    }
  }
}

function disableDrag() {
  container.onmousedown = null;
  container.onmousemove = null;
  container.onmouseup = null;
  container.onmouseleave = null;
  container.style.cursor = "default";
  container.style.removeProperty("left");
  container.style.top = "50%";
}
