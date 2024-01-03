document.addEventListener("DOMContentLoaded", () => {
  const { ipcRenderer } = require("electron");

  document.getElementById("addAccountButton").addEventListener("click", () => {
    let name = document.getElementById("newAccountName").value; // Retrieve updated value
    let pass = document.getElementById("newAccountPass").value; // Retrieve updated value
    let price = document.getElementById("newAccountPass").value; // Retrieve updated value
    let user = document.getElementById("newAccountUser").value; // Retrieve updated value
    let server = document.getElementById("newAccountServer").value; // Retrieve updated value
    let start = document.getElementById("newAccountStart").value; // Retrieve updated value
    let end = document.getElementById("newAccountEnd").value; // Retrieve updated value
    ipcRenderer.send("addAccount", {
      name: name,
      price: price,
      pass: pass,
      user: user,
      server: server,
      start: start,
      end: end,
    });
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

  // Example usage for accountAdded event
  ipcRenderer.on("accountAdded", (event, data) => {
    const { message } = data;
    displayNotification("success", message);
    getAccounts();
  });

  ipcRenderer.on("accountDeleted", (event, args) => {
    // Handle response from main process
    getAccounts();
    hideOverlay();
  });

  // Example usage for accountActivated event
  ipcRenderer.on("accountActivated", (event, data) => {
    const { message } = data;
    displayNotification("success", message);
  });
  // Example usage for accountDeactivated event
  ipcRenderer.on("accountDeactivated", (event, data) => {
    const { message } = data;
    displayNotification("error", message);
  });

  // Example usage for userExistsWarning event
  ipcRenderer.on("accountExistsWarning", (event, data) => {
    const { message } = data;
    displayNotification("error", message);
  });

  getAccounts = () => {
    ipcRenderer.send("getAccounts");
  };

  ipcRenderer.on("accountListSent", (event, rows) => {
    displayAccounts(rows);
  });

  const displayAccounts = (accounts) => {
    const accountList = document.getElementById("accountList");
    accountList.innerHTML = ""; // Clear previous content before adding new users

    accounts.forEach((account) => {
      const card = document.createElement("div");
      card.classList.add("accountCard"); // Add your card styling class here

      // Display user name at the top left
      const accountName = document.createElement("p");
      accountName.textContent = account.name; // Assuming user object has a 'name' property
      card.appendChild(accountName);

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
      removeButton.classList.add("removeAccountButton");
      removeButton.dataset.name = account.name;
      removeButton.innerHTML =
        '<i class="fa fa-times" aria-hidden="true"></i> Remove';
      // Add event listener or functionality for remove button
      buttonsContainer.appendChild(removeButton);
      // Create edit button
      const editButton = document.createElement("button");
      editButton.classList.add("editAccountButton");
      editButton.innerHTML = "View";
      editButton.dataset.viewID = account.idaccounts;
      // Add event listener or functionality for edit button
      buttonsContainer.appendChild(editButton);

      // Create activate button
      const activeButton = document.createElement("button");
      activeButton.classList.add("activeAccountButton");
      activeButton.dataset.activatename = account.name;
      activeButton.dataset.activateuserid = account.user_id;
      activeButton.dataset.uniqueid = account.idaccounts;

      // Inside your displayAccounts function

      const user_id = account.user_id;
      id = account.idaccounts;
      ipcRenderer.send("checkActiveStatus", {
        user_id,
        id,
      });

      // Add event listener or functionality for remove button
      buttonsContainer.appendChild(activeButton);

      card.appendChild(buttonsContainer);
      // Append the card to the userList
      accountList.appendChild(card);
    });
  };

  // Listen for the result of the query
  ipcRenderer.on("activeStatusResult", (event, result) => {
    const id = result.id;
    const activeButton = document.querySelector(`[data-uniqueid="${id}"]`);

    if (activeButton) {
      console.log(result.status);
      if (result.status) {
        // Account is active
        activeButton.innerHTML =
          '<i class="fa fa-check" aria-hidden="true"></i> Activated';
      } else {
        // Account is inactive
        activeButton.innerHTML = "Activate";
      }
    }
  });

  document
    .getElementById("clearAccountButton")
    .addEventListener("click", () => {
      ipcRenderer.send("clearAccounts");
      getAccounts();
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
    const name = e.target.dataset.name;
    ipcRenderer.send("deleteAccount", { name: name });
  });

  document.addEventListener("click", (e) => {
    // Check if the clicked element or any of its ancestors have dataset 'data-name'
    const checkDelName = e.target.hasAttribute("data-name");
    const checkActivate = e.target.hasAttribute("data-activatename");
    const checkViewID = e.target.dataset.viewID;

    if (checkDelName) {
      const name = e.target.dataset.name;
      document.getElementById("yesButton").dataset.name = name;
      showOverlay();
    } else if (checkActivate) {
      const name = e.target.dataset.activatename;
      const user_id = e.target.dataset.activateuserid;
      const value = e.target.innerHTML;
      switch (value) {
        case "Activate":
          e.target.innerHTML =
            '<i class="fa fa-check" aria-hidden="true"></i> Activated';
          ipcRenderer.send("accountActivated", {
            name: name,
            user_id: user_id,
          });
          break;
        case '<i class="fa fa-check" aria-hidden="true"></i> Activated':
          e.target.textContent = "Activate";
          ipcRenderer.send("accountDeactivated", {
            name: name,
            user_id: user_id,
          });

          break;
      }
    } else if (checkViewID) {
      const id = e.target.dataset.viewID;

      // Sending request for active accounts based on the clicked element's data
      ipcRenderer.send("getAccountsData", { id: id });
    }
  });

  // Listening for the response from the main process
  ipcRenderer.on("AccountsDataReceived", (event, Data) => {
    // Get the viewOverlay element by its ID
    const viewOverlay = document.getElementById("overlayContent");

    // Clear any existing content in viewOverlay
    viewOverlay.innerHTML = "";

    // Create a header for the active accounts
    const header = document.createElement("h2");
    header.textContent = "Account Info";

    // Append the header to the viewOverlay
    viewOverlay.appendChild(header);

    // Create a list for the active accounts// Select the table element
    const table = document.createElement("table");
    table.classList.add("custom-table"); // Add the custom-table class

    // Create table header row
    const headerRow = document.createElement("tr");
    for (const header of [
      "Name",
      "Server",
      "Start",
      "End",
      "Password",
      "Price",
    ]) {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Loop through the active accounts data and create table rows with cells
    Data.forEach((row) => {
      const tableRow = document.createElement("tr");

      for (const key of [
        "name",
        "server_id",
        "start_date",
        "expirey_date",
        "password",
        "price",
      ]) {
        const cell = document.createElement("td");
        cell.textContent = row[key];
        tableRow.appendChild(cell);
      }

      table.appendChild(tableRow);
    });

    // Append the table to the overlayContent
    const overlayContent = document.getElementById("overlayContent");
    overlayContent.appendChild(table);
    // Create a close button
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close";
    closeButton.classList.add("closeButton");
    closeButton.onclick = closeOverlay;
    viewOverlay.appendChild(closeButton);
    openOverlay();
  });

  // Function to filter and display users by name
  const filterAccountsByName = () => {
    const input = document
      .getElementById("filterAccountName")
      .value.toLowerCase(); // Get the input value and convert to lowercase for case-insensitive comparison
    const allAccountCards = document.querySelectorAll(".accountCard"); // Get all user cards

    allAccountCards.forEach((card) => {
      const userName = card.querySelector("p").textContent.toLowerCase(); // Get the user name and convert to lowercase

      // Check if the user name contains the input value, hide/show the card accordingly
      if (input === "" || userName.includes(input)) {
        card.style.display = "block"; // Show the card if it matches or if the input is empty
      } else {
        card.style.display = "none"; // Hide the card if it doesn't match
      }
    });
  };

  // Event listener for real-time filtering as the user types
  document
    .getElementById("filterAccountName")
    .addEventListener("input", filterAccountsByName);

  getAccounts();
});
