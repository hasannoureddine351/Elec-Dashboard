document.addEventListener("DOMContentLoaded", () => {
  // renderer.js
  const { ipcRenderer } = require("electron");

  document.getElementById("addUserButton").addEventListener("click", () => {
    let name = document.getElementById("newUserName").value; // Retrieve updated value
    let email = document.getElementById("newUserEmail").value; // Retrieve updated value
    ipcRenderer.send("addUser", { name: name, email: email });
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
  ipcRenderer.on("userAdded", (event, data) => {
    const { message } = data;
    displayNotification("success", message);
    getUsers();
  });

  // Example usage for userExistsWarning event
  ipcRenderer.on("userExistsWarning", (event, data) => {
    const { message } = data;
    displayNotification("error", message);
  });

  getUsers = () => {
    ipcRenderer.send("getUsers");
  };

  ipcRenderer.on("userListSent", (event, rows) => {
    displayUsers(rows);
  });

  const displayUsers = (users) => {
    const userList = document.getElementById("userList");
    userList.innerHTML = ""; // Clear previous content before adding new users

    users.forEach((user) => {
      const card = document.createElement("div");
      card.classList.add("userCard"); // Add your card styling class here

      // Display user name at the top left
      const userName = document.createElement("p");
      userName.textContent = user.name; // Assuming user object has a 'name' property
      card.appendChild(userName);

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
      removeButton.dataset.name = user.name;
      removeButton.dataset.email = user.email;
      removeButton.innerHTML =
        '<i class="fa fa-times" aria-hidden="true"></i> Remove';
      // Add event listener or functionality for remove button
      buttonsContainer.appendChild(removeButton);

      // Create View button
      const editButton = document.createElement("button");
      editButton.classList.add("editUserButton");
      editButton.dataset.viewId = user.idusers;
      editButton.dataset.viewEmail = user.email;
      editButton.innerHTML = "View";

      // Add event listener or functionality for edit button
      buttonsContainer.appendChild(editButton);

      card.appendChild(buttonsContainer);
      // Append the card to the userList
      userList.appendChild(card);
    });
  };
  document.getElementById("clearUserButton").addEventListener("click", () => {
    ipcRenderer.send("clearUsers");
    getUsers();
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
    const name = e.target.dataset.valueName;
    const email = e.target.dataset.valueEmail;
    ipcRenderer.send("deleteUser", { name: name, email: email });
    hideOverlay();
  });

  document.addEventListener("click", (e) => {
    // Check if the clicked element or any of its ancestors have dataset 'name'
    const checkName = e.target.hasAttribute("data-name");
    const checkViewId = e.target.dataset.viewId;

    if (checkName) {
      const name = e.target.dataset.name;
      const email = e.target.dataset.email;
      document.getElementById("yesButton").dataset.valueName = name;
      document.getElementById("yesButton").dataset.valueEmail = email;
      showOverlay();
    } else if (checkViewId) {
      const id = e.target.dataset.viewId;
      const email = e.target.dataset.viewEmail;

      // Sending request for active accounts based on the clicked element's data
      ipcRenderer.send("getActiveAccounts", { id: id });

      // Assuming you receive the data in the renderer process like this:
      ipcRenderer.on("ActiveAccountsReceived", (event, rows) => {
        const table = document.createElement("table");
        table.classList.add("custom-table"); // Add the custom-table class to the table

        // Create table header row
        const headerRow = document.createElement("tr");
        const headers = ["Active Accounts" /* Other Headers if needed */];

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
          defaultCell.textContent = "No active accounts for this user !";
          dataRow.appendChild(defaultCell);
          table.appendChild(dataRow);
        } else {
          // Create table body rows with received data
          rows.forEach((row) => {
            const dataRow = document.createElement("tr");
            const cell = document.createElement("td");
            cell.textContent = row.active_account_name; // Update this based on your data structure

            dataRow.appendChild(cell);
            table.appendChild(dataRow);
          });
        }

        const overlayContent = document.getElementById("overlayContent");
        overlayContent.innerHTML = ""; // Clear existing content
        const header = document.createElement("h3");
        header.textContent = `Email: ${email}`;
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

  ipcRenderer.on("userDeleted", (event, args) => {
    // Handle response from main process
    getUsers();
  });

  // Function to filter and display users by name
  const filterUsersByName = () => {
    const input = document.getElementById("filterUserName").value.toLowerCase(); // Get the input value and convert to lowercase for case-insensitive comparison
    const allUserCards = document.querySelectorAll(".userCard"); // Get all user cards

    allUserCards.forEach((card) => {
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
    .getElementById("filterUserName")
    .addEventListener("input", filterUsersByName);

  getUsers();
});
