// ======================================================
// TOKEN STORAGE
// ======================================================

const ACCESS_TOKEN_KEY = "secure_code_review_access_token";

function saveAccessToken(token) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

function getAccessToken() {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

function removeAccessToken() {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

// ======================================================
// FETCH CURRENT AUTHENTICATED USER
// ======================================================

async function fetchCurrentUser() {
  const token = getAccessToken();

  if (!token) {
    return null;
  }

  const response = await fetch(
    `${API_BASE_URL}/users/me`,

    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    removeAccessToken();

    throw new Error(data.detail || "Authentication failed");
  }

  return data.user;
}

// ======================================================
// BACKEND CONFIGURATION
// ======================================================

const API_BASE_URL = "http://127.0.0.1:8000";

// ======================================================
// TAB ELEMENTS
// ======================================================

const loginTab = document.getElementById("loginTab");

const registerTab = document.getElementById("registerTab");

const loginSection = document.getElementById("loginSection");

const registerSection = document.getElementById("registerSection");

// ======================================================
// LOGIN ELEMENTS
// ======================================================

const loginForm = document.getElementById("loginForm");

const loginUserId = document.getElementById("loginUserId");

const loginPassword = document.getElementById("loginPassword");

const loginButton = document.getElementById("loginButton");

const loginMessage = document.getElementById("loginMessage");

const toggleLoginPassword = document.getElementById("toggleLoginPassword");

// ======================================================
// REGISTRATION ELEMENTS
// ======================================================

const registerForm = document.getElementById("registerForm");

const registerName = document.getElementById("registerName");

const registerUserId = document.getElementById("registerUserId");

const registerPassword = document.getElementById("registerPassword");

const confirmPassword = document.getElementById("confirmPassword");

const registerButton = document.getElementById("registerButton");

const registerMessage = document.getElementById("registerMessage");

const toggleRegisterPassword = document.getElementById(
  "toggleRegisterPassword",
);

const toggleConfirmPassword = document.getElementById("toggleConfirmPassword");

// ======================================================
// TAB SWITCHING
// ======================================================

function showLoginTab() {
  loginTab.classList.add("active");

  registerTab.classList.remove("active");

  loginSection.classList.add("active-section");

  registerSection.classList.remove("active-section");

  clearMessage(registerMessage);
}

function showRegisterTab() {
  registerTab.classList.add("active");

  loginTab.classList.remove("active");

  registerSection.classList.add("active-section");

  loginSection.classList.remove("active-section");

  clearMessage(loginMessage);
}

loginTab.addEventListener("click", showLoginTab);

registerTab.addEventListener("click", showRegisterTab);

// ======================================================
// CLIENT-SIDE VALIDATION
// ======================================================

function validateCredentials(userId, password) {
  const alphanumericPattern = /^[a-zA-Z0-9]+$/;

  // --------------------------------------------------
  // USER ID EMPTY
  // --------------------------------------------------

  if (userId === "") {
    return {
      success: false,

      message: "User ID cannot be empty",
    };
  }

  // --------------------------------------------------
  // USER ID ALPHANUMERIC
  // --------------------------------------------------

  if (!alphanumericPattern.test(userId)) {
    return {
      success: false,

      message: "User ID must contain only letters and numbers",
    };
  }

  // --------------------------------------------------
  // PASSWORD EMPTY
  // --------------------------------------------------

  if (password === "") {
    return {
      success: false,

      message: "Password cannot be empty",
    };
  }

  // --------------------------------------------------
  // PASSWORD LENGTH
  // --------------------------------------------------

  if (password.length < 8) {
    return {
      success: false,

      message: "Password must be at least 8 characters",
    };
  }

  return {
    success: true,
  };
}

// ======================================================
// MESSAGE HELPERS
// ======================================================

function showMessage(element, text, type) {
  element.textContent = text;

  element.className = `message ${type}`;
}

function clearMessage(element) {
  element.textContent = "";

  element.className = "message";
}

// ======================================================
// BUTTON LOADING STATE
// ======================================================

function setButtonLoading(button, isLoading, loadingText, normalText) {
  button.disabled = isLoading;

  button.textContent = isLoading ? loadingText : normalText;
}

// ======================================================
// PASSWORD TOGGLE HELPER
// ======================================================

function setupPasswordToggle(inputElement, buttonElement) {
  buttonElement.addEventListener("click", function () {
    const isHidden = inputElement.type === "password";

    if (isHidden) {
      inputElement.type = "text";

      buttonElement.textContent = "Hide";
    } else {
      inputElement.type = "password";

      buttonElement.textContent = "Show";
    }
  });
}

// ======================================================
// INITIALIZE PASSWORD TOGGLES
// ======================================================

setupPasswordToggle(loginPassword, toggleLoginPassword);

setupPasswordToggle(registerPassword, toggleRegisterPassword);

setupPasswordToggle(confirmPassword, toggleConfirmPassword);

// ======================================================
// REGISTER USER
// ======================================================

registerForm.addEventListener(
  "submit",

  async function (event) {
    // ----------------------------------------------
    // STOP NORMAL FORM SUBMISSION
    // ----------------------------------------------

    event.preventDefault();

    // ----------------------------------------------
    // CLEAR PREVIOUS MESSAGE
    // ----------------------------------------------

    clearMessage(registerMessage);

    // ----------------------------------------------
    // READ FORM VALUES
    // ----------------------------------------------

    const name = registerName.value.trim();

    const userId = registerUserId.value.trim();

    const password = registerPassword.value;

    const confirmedPassword = confirmPassword.value;

    // ----------------------------------------------
    // VALIDATE NAME
    // ----------------------------------------------

    if (name === "") {
      showMessage(
        registerMessage,

        "Name cannot be empty",

        "error",
      );

      return;
    }

    // ----------------------------------------------
    // VALIDATE USER ID + PASSWORD
    // ----------------------------------------------

    const validation = validateCredentials(userId, password);

    if (!validation.success) {
      showMessage(
        registerMessage,

        validation.message,

        "error",
      );

      return;
    }

    // ----------------------------------------------
    // CONFIRM PASSWORD
    // ----------------------------------------------

    if (password !== confirmedPassword) {
      showMessage(
        registerMessage,

        "Passwords do not match",

        "error",
      );

      return;
    }

    // ----------------------------------------------
    // START LOADING STATE
    // ----------------------------------------------

    setButtonLoading(
      registerButton,

      true,

      "Creating account...",

      "Create Account",
    );

    try {
      // ------------------------------------------
      // SEND POST /register
      // ------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            name: name,

            user_id: userId,

            password: password,
          }),
        },
      );

      // ------------------------------------------
      // READ JSON RESPONSE
      // ------------------------------------------

      const data = await response.json();

      // ------------------------------------------
      // SUCCESS RESPONSE
      // ------------------------------------------

      if (response.ok) {
        showMessage(
          registerMessage,

          data.message,

          "success",
        );

        // Save ID before reset
        const createdUserId = userId;

        // Clear form
        registerForm.reset();

        // Reset password toggle labels
        registerPassword.type = "password";

        confirmPassword.type = "password";

        toggleRegisterPassword.textContent = "Show";

        toggleConfirmPassword.textContent = "Show";

        // --------------------------------------
        // MOVE TO LOGIN AFTER SHORT DELAY
        // --------------------------------------

        setTimeout(
          function () {
            showLoginTab();

            // Pre-fill created User ID
            loginUserId.value = createdUserId;

            showMessage(
              loginMessage,

              "Account created successfully. You can now log in.",

              "success",
            );
          },

          1000,
        );
      } else {
        // --------------------------------------
        // FASTAPI HTTP ERROR
        // --------------------------------------

        showMessage(
          registerMessage,

          data.detail || "Registration failed",

          "error",
        );
      }
    } catch (error) {
      // ------------------------------------------
      // NETWORK ERROR
      // ------------------------------------------

      console.error("Registration error:", error);

      showMessage(
        registerMessage,

        "Unable to connect to backend server",

        "error",
      );
    } finally {
      // ------------------------------------------
      // RESTORE BUTTON
      // ------------------------------------------

      setButtonLoading(
        registerButton,

        false,

        "Creating account...",

        "Create Account",
      );
    }
  },
);

// ======================================================
// LOGIN USER
// ======================================================

loginForm.addEventListener(
  "submit",

  async function (event) {
    // ----------------------------------------------
    // STOP NORMAL FORM SUBMISSION
    // ----------------------------------------------

    event.preventDefault();

    // ----------------------------------------------
    // CLEAR PREVIOUS MESSAGE
    // ----------------------------------------------

    clearMessage(loginMessage);

    // ----------------------------------------------
    // READ FORM VALUES
    // ----------------------------------------------

    const userId = loginUserId.value.trim();

    const password = loginPassword.value;

    // ----------------------------------------------
    // CLIENT-SIDE VALIDATION
    // ----------------------------------------------

    const validation = validateCredentials(userId, password);

    if (!validation.success) {
      showMessage(
        loginMessage,

        validation.message,

        "error",
      );

      return;
    }

    // ----------------------------------------------
    // START LOADING STATE
    // ----------------------------------------------

    setButtonLoading(
      loginButton,

      true,

      "Logging in...",

      "Login",
    );

    try {
      // ------------------------------------------
      // SEND POST /login
      // ------------------------------------------

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            user_id: userId,

            password: password,
          }),
        },
      );

      // ------------------------------------------
      // READ JSON RESPONSE
      // ------------------------------------------

      const data = await response.json();

      // ------------------------------------------
      // SUCCESS
      // ------------------------------------------

      if (response.ok) {
        // ----------------------------------------------
        // SAVE JWT
        // ----------------------------------------------

        saveAccessToken(data.access_token);

        // ----------------------------------------------
        // PROVE TOKEN WORKS
        // ----------------------------------------------

        const authenticatedUser = await fetchCurrentUser();

        // ----------------------------------------------
        // SHOW SUCCESS
        // ----------------------------------------------

        showMessage(
          loginMessage,

          `Authenticated as ${authenticatedUser.name} (${authenticatedUser.role})`,

          "success",
        );

        // Clear password
        loginPassword.value = "";

        // Reset password visibility
        loginPassword.type = "password";

        toggleLoginPassword.textContent = "Show";

        console.log("Authenticated user:", authenticatedUser);
      } else {
        // --------------------------------------
        // HTTP ERROR
        // Example: 401
        // --------------------------------------

        showMessage(
          loginMessage,

          data.detail || "Login failed",

          "error",
        );
      }
    } catch (error) {
      // ------------------------------------------
      // NETWORK ERROR
      // ------------------------------------------

      console.error("Login error:", error);

      showMessage(
        loginMessage,

        "Unable to connect to backend server",

        "error",
      );
    } finally {
      // ------------------------------------------
      // RESTORE BUTTON
      // ------------------------------------------

      setButtonLoading(
        loginButton,

        false,

        "Logging in...",

        "Login",
      );
    }
  },
);
