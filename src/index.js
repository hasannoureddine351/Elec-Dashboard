const { app, BrowserWindow } = require("electron");
const path = require("path");
const { ipcMain } = require("electron");

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

const sqlite3 = require("sqlite3").verbose();

// Create a database connection

const db = new sqlite3.Database("src\\db\\eapp.db"); // or a file path for persistent storage
db.run("PRAGMA foreign_keys = ON;");

// Create a table

// CRUD operations

// Create

ipcMain.on("addUser", (event, data) => {
  db.get(
    `SELECT idusers FROM users WHERE email = ?`,
    [data.email],
    function (err, row) {
      if (err) {
        // Handle error
        console.error(err.message);
        // Send an error event to the renderer process
        event.sender.send("userAddError", {
          message: "Error checking user existence",
        });
      } else {
        if (row) {
          // User with provided email already exists
          // You can customize the warning message according to your UI
          event.sender.send("userExistsWarning", {
            message: "User with this email already exists",
          });
        } else {
          // User doesn't exist, proceed to insert
          db.run(
            `INSERT INTO users (name, email) VALUES (?, ?)`,
            [data.name, data.email],
            function (insertErr) {
              if (insertErr) {
                // Handle insertion error
                console.error(insertErr.message);
                event.sender.send("userAddError", {
                  message: "Error adding user",
                });
              } else {
                // Data inserted successfully
                console.log(`Row inserted with ID: ${this.lastID}`);
                event.sender.send("userAdded", {
                  message: `User added successfully with ID:${this.lastID}`,
                });
              }
            }
          );
        }
      }
    }
  );
});
ipcMain.on("addServer", (event, data) => {
  db.get(
    `SELECT idservers FROM servers WHERE name = ? OR url = ?`,
    [data.name, data.url],
    function (err, row) {
      if (err) {
        // Handle error
        console.error(err.message);
        // Send an error event to the renderer process
        event.sender.send("serverAddError", {
          message: "Error checking server existence",
        });
      } else {
        if (row) {
          // Server with provided name or URL already exists
          // You can customize the warning message according to your UI
          event.sender.send("serverExistsWarning", {
            message: "Server with this name or URL already exists",
          });
        } else {
          // Server doesn't exist, proceed to insert
          db.run(
            `INSERT INTO servers (name, url, price) VALUES (?, ?, ?)`,
            [data.name, data.url, data.price],
            function (insertErr) {
              if (insertErr) {
                // Handle insertion error
                console.error(insertErr.message);
                event.sender.send("serverAddError", {
                  message: "Error adding server",
                });
              } else {
                // Data inserted successfully
                console.log(`Row inserted with ID: ${this.lastID}`);
                event.sender.send("serverAdded", {
                  message: `Server added successfully with ID:${this.lastID}`,
                });
              }
            }
          );
        }
      }
    }
  );
});

ipcMain.on("addAccount", (event, data) => {
  // Prepare SQL query
  const sql = `
      INSERT INTO accounts (name,password,start_date,expirey_date, price,user_id,server_id)
      VALUES (?, ?, ?, ?, ?, (SELECT idusers FROM users WHERE name = ?),(SELECT idservers FROM servers WHERE name=?))
      `;

  // Check if the account already exists for the specified user and server
  db.get(
    `SELECT idaccounts FROM accounts WHERE name = ? AND user_id = (SELECT idusers FROM users WHERE name = ?) AND server_id = (SELECT idservers FROM servers WHERE name = ?)`,
    [data.name, data.user, data.server],
    function (err, row) {
      if (err) {
        // Handle error
        console.error(err.message);
        event.sender.send("accountAddError", {
          message: "Error checking account existence",
        });
      } else {
        if (row) {
          // Account already exists for this user and server
          event.sender.send("accountExistsWarning", {
            message: "Account already exists for this user and server",
          });
        } else {
          // Account doesn't exist, proceed to insert
          db.run(
            sql,
            [
              data.name,
              data.pass,
              data.start,
              data.end,
              data.price,
              data.user,
              data.server,
            ],
            function (insertErr) {
              if (insertErr) {
                // Handle insertion error
                console.error(insertErr.message);
                event.sender.send("accountAddError", {
                  message: "Error adding account",
                });
              } else {
                // Data inserted successfully
                console.log(`Row inserted with ID: ${this.lastID}`);
                event.sender.send("accountAdded", {
                  message: `Account added successfully with ID:${this.lastID}`,
                });
              }
            }
          );
        }
      }
    }
  );
});

ipcMain.on("accountActivated", (event, data) => {
  // Prepare SQL query
  const sql = `
      INSERT INTO active_accounts (users_id, accounts_id)
      VALUES (?,(SELECT idaccounts FROM accounts WHERE name=?))
      `;

  // Check if the account is already activated for the specified user and account
  db.get(
    `SELECT accounts_id FROM active_accounts aa JOIN accounts a ON a.idaccounts = aa.accounts_id WHERE a.name = ? AND aa.users_id = ?`,
    [data.name, data.user_id],
    function (err, row) {
      if (err) {
        // Handle error
        console.error(err.message);
        event.sender.send("accountAddError", {
          message: "Error checking account existence",
        });
      } else {
        if (row) {
          // Account already exists for this user and server
          event.sender.send("accountExistsWarning", {
            message: "Account already Active for this user and account",
          });
        } else {
          // Account isn't active, proceed to insert
          db.run(sql, [data.user_id, data.name], function (insertErr) {
            if (insertErr) {
              // Handle insertion error
              console.error(insertErr.message);
              event.sender.send("accountActivationError", {
                message: "Error activating account",
              });
            } else {
              // Data inserted successfully
              console.log(
                `Account Activated Successfully with ID: ${this.lastID}`
              );
              event.sender.send("accountActivated", {
                message: `Account Activated Successfully !`,
              });
            }
          });
        }
      }
    }
  );
});

// Handle IPC message for checking active status
ipcMain.on("checkActiveStatus", (event, data) => {
  // Query to check if the account is active
  const sql = `SELECT accounts_id FROM active_accounts WHERE accounts_id = ? AND users_id = ?`;

  db.get(sql, [data.id, data.user_id], (err, row) => {
    if (err) {
      console.error(err.message);
      event.reply("activeStatusResult", { status: false, error: err.message });
    } else if (row) {
      event.reply("activeStatusResult", {
        status: true,
        id: data.id,
      });
    } else {
      event.reply("activeStatusResult", {
        status: false,
        id: data.id,
      });
    }
  });
});

// Read

ipcMain.on("getUsers", (event) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("userListSent", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("userListSent", rows); // Send retrieved data to the renderer process
    }
  });
});
ipcMain.on("getAccounts", (event) => {
  db.all("SELECT * FROM accounts", (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("accountListSent", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("accountListSent", rows); // Send retrieved data to the renderer process
    }
  });
});
ipcMain.on("getServers", (event) => {
  db.all("SELECT * FROM servers", (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("serverListSent", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("serverListSent", rows); // Send retrieved data to the renderer process
    }
  });
});

ipcMain.on("getActiveAccounts", (event, data) => {
  const sql = `
    SELECT accounts.name AS active_account_name
    FROM accounts
    JOIN active_accounts ON active_accounts.accounts_id = accounts.idaccounts
    WHERE active_accounts.users_id = ?;
  `;

  db.all(sql, [data.id], (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("ActiveAccountsReceived", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("ActiveAccountsReceived", rows); // Send retrieved data to the renderer process
    }
  });
});
ipcMain.on("getAccountsData", (event, data) => {
  const sql = `
    SELECT *
    FROM accounts a
    JOIN 
    users u
    ON
    u.idusers=a.user_id
    WHERE idaccounts = ?;
  `;

  db.all(sql, [data.id], (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("AccountsDataReceived", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("AccountsDataReceived", rows); // Send retrieved data to the renderer process
    }
  });
});
ipcMain.on("getServerAccounts", (event, data) => {
  const sql = `
    SELECT name
    FROM accounts 
    WHERE server_id = ?;
  `;

  db.all(sql, [data.id], (err, rows) => {
    if (err) {
      console.error(err);
      event.sender.send("ServerDataReceived", []); // Send an empty array or handle error in the renderer process
    } else {
      event.sender.send("ServerDataReceived", rows); // Send retrieved data to the renderer process
    }
  });
});

//Update

// Main process (assuming database connection and required modules are set up)

ipcMain.on("getLineChartData", async (event) => {
  try {
    // Fetch data from accounts table for profit calculation
    const accountsData = await db.query("SELECT * FROM accounts");

    // Fetch data from servers table for cost calculation
    const serversData = await db.query("SELECT * FROM servers");

    // Process data to calculate profit per month
    const profitPerMonth = {};

    accountsData.forEach((account) => {
      const startDate = new Date(account.start_date);
      // Calculate profit for the account
      const accountProfit = account.price;
      if (!profitPerMonth[startDate.getMonth]) {
        profitPerMonth[startDate.getMonth] += accountProfit;
      } else {
        profitPerMonth[startDate.getMonth] = accountProfit;
      }
    });

    // Process data to calculate cost per month from servers
    const costPerMonth = {};

    serversData.forEach((server) => {
      // Your server data structure might not have start and end dates.
      // Adjust calculation logic based on how server costs are determined.

      const serverCost = server.price;

      if (!costPerMonth[monthKey]) {
        costPerMonth[monthKey] = 0;
      } else {
        costPerMonth[monthKey] += serverCost / 12;
      } // Equally distributed for a year
    });

    // Convert profitPerMonth and costPerMonth objects into arrays for Chart.js
    const profitData = Object.values(profitPerMonth);
    const costData = Object.values(costPerMonth);
    const labels = Object.keys(profitPerMonth); // Assuming both objects have the same months

    // Send the aggregated profit and cost data back to the renderer process
    event.sender.send("LineChartDataReceived", {
      labels,
      profitData,
      costData,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    event.reply("LineChartDataError", error.message);
  }
});

//Delete

ipcMain.on("clearUsers", (event) => {
  db.all("DELETE FROM users", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Database connection closed");
    }
  });
});

ipcMain.on("clearAccounts", (event) => {
  db.all("DELETE FROM accounts", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Database connection closed");
    }
  });
});

ipcMain.on("clearServers", (event) => {
  db.all("DELETE FROM servers", (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Database connection closed");
    }
  });
});
ipcMain.on("deleteUser", (event, data) => {
  db.run(
    `DELETE FROM users WHERE name=? and email=?`,
    [data.name, data.email],
    function (err) {
      if (err) {
        // Handle error
        console.error(err.message);
      } else {
        // Server deleted successfully
        console.log(`Server deleted with name: ${data.name}`);
        // Send an event or callback to confirm successful deletion
        event.sender.send("userDeleted");
      }
    }
  );
});

ipcMain.on("deleteServer", (event, data) => {
  db.run(`DELETE FROM servers WHERE name=?`, [data.name], function (err) {
    if (err) {
      // Handle error
      console.error(err.message);
    } else {
      // Server deleted successfully
      console.log(`Server deleted with name: ${data.name}`);
      // Send an event or callback to confirm successful deletion
      event.sender.send("serverDeleted");
    }
  });
});
ipcMain.on("deleteAccount", (event, data) => {
  db.run(`DELETE FROM accounts WHERE name=?`, [data.name], function (err) {
    if (err) {
      // Handle error
      console.error(err.message);
    } else {
      // Server deleted successfully
      console.log(`Account deleted with name: ${data.name}`);
      // Send an event or callback to confirm successful deletion
      event.sender.send("accountDeleted");
    }
  });
});

ipcMain.on("accountDeactivated", (event, data) => {
  // Prepare SQL query
  const sql = `
      DELETE FROM active_accounts WHERE accounts_id=(SELECT idaccounts FROM accounts WHERE name = ?) AND users_id=?
      `;

  // Check if the account is already activated for the specified user and account
  db.get(
    `SELECT accounts_id FROM active_accounts aa JOIN accounts a ON a.idaccounts = aa.accounts_id WHERE a.name = ? AND users_id = ?`,
    [data.name, data.user_id],
    function (err, row) {
      if (err) {
        // Handle error
        console.error(err.message);
        event.sender.send("accountAddError", {
          message: "Error checking account existence",
        });
      } else {
        if (row) {
          // Account is active, proceed to delete
          db.run(sql, [data.name, data.user_id], function (deleteErr) {
            if (deleteErr) {
              // Handle deletion error
              console.error(deleteErr.message);
              event.sender.send("accountDeactivationError", {
                message: "Error deactivating account",
              });
            } else {
              // Data deleted successfully
              console.log("Account Deactivated Successfully");
              event.sender.send("accountDeactivated", {
                message: "Account Deactivated Successfully !",
              });
            }
          });
        } else {
          // Account doesn't exist for this user and server
          event.sender.send("accountNotExistError", {
            message: "Account not active for this user and account",
          });
        }
      }
    }
  );
});

// Close the database connection when done
ipcMain.on("closeDatabase", () => {
  db.close((err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("Database connection closed");
    }
  });
});
