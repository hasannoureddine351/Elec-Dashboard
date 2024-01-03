document.addEventListener("DOMContentLoaded", () => {
  // renderer.js
  const { ipcRenderer } = require("electron");

  document.getElementById("addServerButton").addEventListener("click", () => {
    let name = document.getElementById("newServerName").value; // Retrieve updated value
    let url = document.getElementById("newServerUrl").value; // Retrieve updated value
    let price = document.getElementById("newServerPrice").value; // Retrieve updated value
    ipcRenderer.send("addServer", { name: name, url: url, price: price });
  });

  function displayNotification(type, message) {
    const notificationMessages = document.getElementById(
      "notification-messages"
    );

    const notificationMessage = document.createElement("div");
    notificationMessage.classList.add("notification-message");
    notificationMessage.classList.add(
      type === "success" ? "success-message" : "error-message"
    );
    notificationMessage.textContent = message;

    notificationMessages.appendChild(notificationMessage);

    setTimeout(() => {
      notificationMessage.classList.add("show");
    }, 100);

    setTimeout(() => {
      notificationMessage.classList.remove("show");
      setTimeout(() => {
        notificationMessage.remove();
      }, 300);
    }, 5000);
  }

  // Example usage for userAdded event
  ipcRenderer.on("serverAdded", (event, data) => {
    const { message } = data;
    displayNotification("success", message);
    getServers();
  });

  // Example usage for userExistsWarning event
  ipcRenderer.on("serverExistsWarning", (event, data) => {
    const { message } = data;
    displayNotification("error", message);
    getServers();
  });

  getServers = () => {
    ipcRenderer.send("getServers");
  };

  ipcRenderer.on("serverListSent", (event, rows) => {
    displayServers(rows);
  });

  const displayServers = (servers) => {
    const serverList = document.getElementById("serverList");
    serverList.innerHTML = ""; // Clear previous content before adding new users

    servers.forEach((server) => {
      const card = document.createElement("div");
      card.classList.add("serverCard"); // Add your card styling class here

      // Display user name at the top left
      const serverName = document.createElement("p");
      serverName.textContent = server.name; // Assuming user object has a 'name' property
      card.appendChild(serverName);

      // Display image at the top right
      const imageContainer = document.createElement("div");
      imageContainer.classList.add("imageContainer");
      const a = document.createElement("a");
      imageContainer.appendChild(a);

      const image = document.createElement("img");
      image.classList.add("profilePicture");
      image.setAttribute("src", "../assets/default.jpg");
      a.appendChild(image);

      card.appendChild(imageContainer);

      // Create buttons container
      const buttonsContainer = document.createElement("div");
      buttonsContainer.classList.add("buttonsContainer");

      // Create remove button
      const removeButton = document.createElement("button");
      removeButton.classList.add("removeUserButton");
      removeButton.dataset.name = server.name;
      removeButton.innerHTML =
        '<i class="fa fa-times" aria-hidden="true"></i> Remove';
      // Add event listener or functionality for remove button
      buttonsContainer.appendChild(removeButton);

      // Create edit button
      const editButton = document.createElement("button");
      editButton.classList.add("editUserButton");
      editButton.dataset.serverid = server.idservers;
      editButton.dataset.servername = server.name;
      editButton.innerHTML = "View";
      // Add event listener or functionality for edit button
      buttonsContainer.appendChild(editButton);

      card.appendChild(buttonsContainer);
      // Append the card to the userList
      serverList.appendChild(card);
    });
  };
  document.getElementById("clearServerButton").addEventListener("click", () => {
    ipcRenderer.send("clearServers");
    getServers();
  });

  // Function to show the overlay
  function showOverlay() {
    document.getElementById("overlay").style.display = "flex";
  }

  // Function to hide the overlay
  function hideOverlay() {
    document.getElementById("overlay").style.display = "none";
  }
  function closeOverlay() {
    document.getElementById("viewOverlay").style.display = "none";
  }
  function openOverlay() {
    document.getElementById("viewOverlay").style.display = "flex";
  }

  // Add event listener to the 'No' button
  document.getElementById("noButton").addEventListener("click", hideOverlay);

  // Add event listener to the 'Yes' button
  document.getElementById("yesButton").addEventListener("click", (e) => {
    const name = e.target.dataset.value;
    ipcRenderer.send("deleteServer", { name: name });
    hideOverlay();
  });

  document.addEventListener("click", (e) => {
    // Check if the clicked element or any of its ancestors have dataset 'name'
    const checkName = e.target.hasAttribute("data-name");
    const checkServerId = e.target.hasAttribute("data-serverid");

    if (checkName) {
      const name = e.target.dataset.name;
      document.getElementById("yesButton").dataset.value = name;
      showOverlay();
    } else if (checkServerId) {
      const id = e.target.dataset.serverid;
      const name = e.target.dataset.servername;

      // Sending request for active accounts based on the clicked element's data
      ipcRenderer.send("getServerAccounts", { id: id });

      // Assuming you receive the data in the renderer process like this:
      ipcRenderer.on("ServerDataReceived", (event, rows) => {
        const table = document.createElement("table");
        table.classList.add("custom-table"); // Add the custom-table class to the table

        // Create table header row
        const headerRow = document.createElement("tr");
        const headers = ["Server Accounts" /* Other Headers if needed */];

        headers.forEach((headerText) => {
          const th = document.createElement("th");
          th.textContent = headerText;
          headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Check if there are no rows received
        if (rows.length === 0) {
          const dataRow = document.createElement("tr");
          const defaultCell = document.createElement("td");
          defaultCell.colSpan = headers.length; // Span the cell across all columns
          defaultCell.textContent = "No Accounts for this Server !";
          dataRow.appendChild(defaultCell);
          table.appendChild(dataRow);
        } else {
          // Create table body rows with received data
          rows.forEach((row) => {
            const dataRow = document.createElement("tr");
            const cell = document.createElement("td");
            cell.textContent = row.name; // Update this based on your data structure

            dataRow.appendChild(cell);
            table.appendChild(dataRow);
          });
        }

        const overlayContent = document.getElementById("overlayContent");
        overlayContent.innerHTML = ""; // Clear existing content
        const header = document.createElement("h3");
        header.textContent = `Server: ${name}`;
        overlayContent.appendChild(header);
        overlayContent.appendChild(table);

        // Create a close button
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.classList.add("closeButton");
        closeButton.onclick = closeOverlay;
        overlayContent.appendChild(closeButton);
        openOverlay();
      });
    }
  });

  ipcRenderer.on("serverDeleted", (event, args) => {
    // Handle response from main process
    getServers();
  });

  // Function to filter and display users by name
  const filterServersByName = () => {
    const input = document
      .getElementById("filterServerName")
      .value.toLowerCase(); // Get the input value and convert to lowercase for case-insensitive comparison
    const allServerCards = document.querySelectorAll(".serverCard"); // Get all user cards

    allServerCards.forEach((card) => {
      const serverName = card.querySelector("p").textContent.toLowerCase(); // Get the user name and convert to lowercase

      // Check if the user name contains the input value, hide/show the card accordingly
      if (input === "" || serverName.includes(input)) {
        card.style.display = "block"; // Show the card if it matches or if the input is empty
      } else {
        card.style.display = "none"; // Hide the card if it doesn't match
      }
    });
  };

  // Event listener for real-time filtering as the user types
  document
    .getElementById("filterServerName")
    .addEventListener("input", filterServersByName);

  getServers();
});
