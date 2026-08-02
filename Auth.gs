/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Auth.gs
 * Purpose   : Authentication Module
 * Version   : 3.0
 * ============================================================
 */

const Auth = (() => {

  const SESSION_PREFIX = "rto.session.";

  /**
   * ============================================================
   * PASSWORD HASH
   * ============================================================
   */

  function hash(password) {

    const bytes = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      Utility.safeString(password)
    );

    return bytes
      .map(b => {
        const value = (b < 0 ? b + 256 : b).toString(16);
        return ("0" + value).slice(-2);
      })
      .join("");

  }

  /**
   * ============================================================
   * VERIFY PASSWORD
   * ============================================================
   */

  function verify(password, passwordHash) {

    return hash(password) === passwordHash;

  }

  /**
   * ============================================================
   * SESSION ID
   * ============================================================
   */

  function sessionId() {

    return Utility.uuid();

  }

  function sessionDurationMs() {
    const minutes = Number(Config.get("SESSION_TIMEOUT_MIN"));

    if (!isFinite(minutes) || minutes < 1)
      throw new Error("Configuration setting 'SESSION_TIMEOUT_MIN' must be a positive number.");

    return minutes * 60 * 1000;

  }

  function sessionKey(id) {
    return SESSION_PREFIX + Utility.safeString(id);
  }

  /**
   * Returns a browser-safe image URL from the User Photo cell.  The column can
   * hold either a normal https URL or a Google Sheets in-cell image.
   */
  function profilePhotoUrl(value) {

    let url = "";

    if (typeof value === "string") {
      url = value;
    } else if (value) {
      try {
        if (typeof value.getContentUrl === "function") {
          url = value.getContentUrl();
        } else if (typeof value.getUrl === "function") {
          url = value.getUrl();
        }
      } catch (error) {
        url = "";
      }
    }

    url = Utility.safeString(url);

    return /^https:\/\//i.test(url) ? url : "";

  }

  function storeSession(id, username) {

    PropertiesService.getScriptProperties().setProperty(
      sessionKey(id),
      JSON.stringify({
        username: Utility.safeString(username),
        expiresAt: Date.now() + sessionDurationMs()
      })
    );

  }

  function readSession(id) {

    const key = sessionKey(id);
    const raw = PropertiesService.getScriptProperties().getProperty(key);

    if (!raw) return null;

    try {
      const session = JSON.parse(raw);

      if (!session.expiresAt || Number(session.expiresAt) <= Date.now()) {
        PropertiesService.getScriptProperties().deleteProperty(key);
        return null;
      }

      return session;
    } catch (error) {
      PropertiesService.getScriptProperties().deleteProperty(key);
      return null;
    }

  }

  function deleteSession(id) {

    if (Utility.safeString(id))
      PropertiesService.getScriptProperties().deleteProperty(sessionKey(id));

  }

  /**
   * ============================================================
   * FIND USER
   * ============================================================
   */

  function findUser(username) {

    return Database.users.findByUsername(username);

  }

  /**
   * ============================================================
   * LOGIN
   * ============================================================
   */

function login(username, password) {

  username = Utility.safeString(username);
  password = Utility.safeString(password);


    let result;

    result = Validation.username(username);
    if (!result.success) return result;

    result = Validation.password(password);
    if (!result.success) return result;

    const user = findUser(username);

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    const data = user.data;

    if (Utility.safeString(data.STATUS) !== STATUS.ACTIVE)
      return Utility.error(ERROR.ACCOUNT_INACTIVE);

    if (Utility.safeString(data.LOCKED).toUpperCase() === "YES")
      return Utility.error(ERROR.ACCOUNT_LOCKED);

    if (!verify(password, data.PASSWORD)) {

      const attempts =
        Database.users.incrementFailedAttempts(user);

      const maxAttempts = Number(Config.get("MAX_FAILED_LOGIN"));
      if (!isFinite(maxAttempts) || maxAttempts < 1)
        throw new Error("Configuration setting 'MAX_FAILED_LOGIN' must be a positive number.");

      if (attempts >= maxAttempts) {

        Database.users.lock(user.row);

        return Utility.error(ERROR.ACCOUNT_LOCKED);

      }

      return Utility.error(ERROR.INVALID_PASSWORD);

    }

    Database.users.resetFailedAttempts(user.row);

    const id = sessionId();

    deleteSession(data.SESSION_ID);

    Database.users.saveSession(
      user.row,
      id
    );

    storeSession(id, data.USERNAME);

    return Utility.success(
      SUCCESS.LOGIN,
      {
        sessionId: id,
        username: data.USERNAME,
        riderName: data.RIDER_NAME,
        employeeId: data.EMPLOYEE_ID,
        zone: data.ZONE,
        warehouse: data.WAREHOUSE,
        lmHub: data.LM_HUB,
        role: data.ROLE,
        access: data.ACCESS_SCOPE,
        email: data.REGISTERED_EMAIL,
        status: data.STATUS,
        profilePhoto: profilePhotoUrl(data.USER_PHOTO)
      }
    );

  }

  /**
   * ============================================================
   * LOGOUT
   * ============================================================
   */
  function logout(username, activeSessionId) {

    const user = findUser(username);

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    deleteSession(activeSessionId || user.data.SESSION_ID);

    Database.users.clearSession(user.row);

    return Utility.success(
      SUCCESS.LOGOUT
    );

  }

  /**
   * ============================================================
   * VALIDATE SESSION
   * ============================================================
   */

  function validateSession(sessionId) {

    sessionId = Utility.safeString(sessionId);

    if (!sessionId)
      return null;

    const session = readSession(sessionId);

    if (!session)
      return null;

    const user = Database.users.findBySession(sessionId);

    if (!user)
      return null;

    if (
      Utility.safeString(session.username).toLowerCase() !==
      Utility.safeString(user.data.USERNAME).toLowerCase()
    ) {
      return null;
    }

    if (
      Utility.safeString(user.data.STATUS) !== STATUS.ACTIVE ||
      Utility.safeString(user.data.LOCKED).toUpperCase() === "YES"
    ) {

      return null;

    }

    return user.data;

  }

  /**
   * ============================================================
   * CHANGE PASSWORD
   * ============================================================
   */

  function changePassword(username, oldPassword, newPassword) {

    const user = findUser(username);

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    if (!verify(oldPassword, user.data.PASSWORD))
      return Utility.error(ERROR.INVALID_PASSWORD);

    const result = Validation.password(newPassword);

    if (!result.success)
      return result;

    Database.users.updateCell(
      user.row,
      "PASSWORD",
      hash(newPassword)
    );

    return Utility.success(
      SUCCESS.PASSWORD_CHANGED
    );

  }

  /**
   * ============================================================
   * RESET PASSWORD
   * ============================================================
   */

  function resetPassword(username, newPassword) {

    const user = findUser(username);

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    const result = Validation.password(newPassword);

    if (!result.success)
      return result;

    Database.users.updateCell(
      user.row,
      "PASSWORD",
      hash(newPassword)
    );

    Database.users.resetFailedAttempts(user.row);

    Database.users.unlock(user.row);

    deleteSession(user.data.SESSION_ID);
    Database.users.clearSession(user.row);

    return Utility.success(
      SUCCESS.PASSWORD_RESET
    );

  }

  /**
   * ============================================================
   * UNLOCK USER
   * ============================================================
   */

  function unlockUser(username) {

    const user = findUser(username);

    if (!user)
      return Utility.error(ERROR.USER_NOT_FOUND);

    Database.users.unlock(user.row);

    Database.users.resetFailedAttempts(user.row);

    return Utility.success(
      SUCCESS.USER_UNLOCKED
    );

  }

  /**
   * ============================================================
   * PUBLIC API
   * ============================================================
   */

  return {

    hash,
    verify,

    sessionId,

    sessionDurationMs,

    findUser,

    login,
    logout,

    profilePhotoUrl,

    validateSession,

    changePassword,
    resetPassword,

    unlockUser

  };

})();
