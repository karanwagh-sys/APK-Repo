/**
 * ============================================================
 * TRUE MEDS - RTO & REATTEMPT PORTAL
 * File      : Utility.gs
 * Purpose   : Common Utility Functions
 * Version   : 2.0
 * ============================================================
 */

const Utility = (() => {

  /**
   * ------------------------------------------------------------
   * SAFE STRING
   * ------------------------------------------------------------
   */

  function safeString(value) {

    return value === null || value === undefined
      ? ""
      : String(value).trim();

  }

  /**
   * ------------------------------------------------------------
   * SUCCESS RESPONSE
   * ------------------------------------------------------------
   */

  function success(message, data) {

    return {

      success: true,

      message: message || "Success.",

      data: data === undefined
        ? null
        : data

    };

  }

  /**
   * ------------------------------------------------------------
   * ERROR RESPONSE
   * ------------------------------------------------------------
   */

  function error(message, data) {

    return {

      success: false,

      message: message || ERROR.UNKNOWN,

      data: data === undefined
        ? null
        : data

    };

  }

  /**
   * ------------------------------------------------------------
   * UUID
   * ------------------------------------------------------------
   */

  function uuid() {

    return Utilities.getUuid();

  }

  /**
   * ------------------------------------------------------------
   * UNIVERSAL DATE & TIME
   * Format : DD/MM/YYYY HH:MM:SS
   * ------------------------------------------------------------
   */

  function formatDateTime(date) {

    const value =
      date instanceof Date
        ? date
        : new Date();

    return Utilities.formatDate(

      value,

      Session.getScriptTimeZone(),

      "dd/MM/yyyy HH:mm:ss"

    );

  }

  /**
   * ------------------------------------------------------------
   * DATE ONLY
   * Format : DD/MM/YYYY
   * ------------------------------------------------------------
   */

  function formatDate(date) {

    const value =
      date instanceof Date
        ? date
        : new Date();

    return Utilities.formatDate(

      value,

      Session.getScriptTimeZone(),

      "dd/MM/yyyy"

    );

  }

  /**
   * ------------------------------------------------------------
   * TIME ONLY
   * Format : HH:MM:SS
   * ------------------------------------------------------------
   */

  function formatTime(date) {

    const value =
      date instanceof Date
        ? date
        : new Date();

    return Utilities.formatDate(

      value,

      Session.getScriptTimeZone(),

      "HH:mm:ss"

    );

  }

  /**
   * Parses both a native Sheet date and the portal's DD/MM/YYYY HH:mm:ss text.
   * Native Date parsing is locale-dependent, so do not use new Date(text) for
   * values stored by formatDateTime().
   */
  function parseDateTime(value) {

    if (value instanceof Date)
      return new Date(value.getTime());

    const text = safeString(value);
    let match;
    let year;
    let month;
    let day;
    let hour = 0;
    let minute = 0;
    let second = 0;

    // HTML date inputs use YYYY-MM-DD; the portal stores DD/MM/YYYY HH:mm:ss.
    // Parse both explicitly so the result is independent of browser/server
    // locale (which was the source of incorrect, very large review times).
    if ((match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/))) {
      year = Number(match[1]);
      month = Number(match[2]);
      day = Number(match[3]);
      hour = Number(match[4] || 0);
      minute = Number(match[5] || 0);
      second = Number(match[6] || 0);
    } else if ((match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/))) {
      day = Number(match[1]);
      month = Number(match[2]);
      year = Number(match[3]);
      hour = Number(match[4] || 0);
      minute = Number(match[5] || 0);
      second = Number(match[6] || 0);
    } else {
      return null;
    }

    const parsed = new Date(year, month - 1, day, hour, minute, second);

    return parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day &&
      parsed.getHours() === hour &&
      parsed.getMinutes() === minute &&
      parsed.getSeconds() === second
      ? parsed
      : null;

  }

  /** Formats elapsed milliseconds for operational review-time reporting. */
  function formatElapsedMilliseconds(milliseconds) {

    let minutes = Math.max(0, Math.floor(Number(milliseconds) / 60000));

    if (!isFinite(minutes))
      return "";

    const units = [
      { size: 525600, singular: "Year", plural: "Years" },
      { size: 43200, singular: "Month", plural: "Months" },
      { size: 10080, singular: "Week", plural: "Weeks" },
      { size: 1440, singular: "Day", plural: "Days" },
      { size: 60, singular: "Hour", plural: "Hours" },
      { size: 1, singular: "Minute", plural: "Minutes" }
    ];

    const parts = [];

    units.forEach(unit => {
      const amount = Math.floor(minutes / unit.size);
      minutes %= unit.size;

      if (amount)
        parts.push(amount + " " + (amount === 1 ? unit.singular : unit.plural));
    });

    return parts.length ? parts.join(" ") : "0 Minutes";

  }

  /**
   * ------------------------------------------------------------
   * SUBMISSION ID
   * ------------------------------------------------------------
   */

  function generateSubmissionId() {

    return "SUB-" +

      Utilities.formatDate(

        new Date(),

        Session.getScriptTimeZone(),

        "yyyyMMddHHmmss"

      )

      +

      "-"

      +

      uuid()
        .slice(0, 8)
        .toUpperCase();

  }

  /**
   * ------------------------------------------------------------
   * NOTIFICATION ID
   * ------------------------------------------------------------
   */

  function generateNotificationId() {

    return "NOT-" +

      Utilities.formatDate(

        new Date(),

        Session.getScriptTimeZone(),

        "yyyyMMddHHmmss"

      )

      +

      "-"

      +

      uuid()
        .slice(0, 8)
        .toUpperCase();

  }

  /**
   * CSR Ticket ID. The timestamp makes the ticket operationally readable and
   * the UUID suffix prevents a collision during concurrent approvals.
   */
  function generateCsrTicketId() {

    return "CSR-" +
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyyMMddHHmmss"
      ) +
      "-" +
      uuid().slice(0, 8).toUpperCase();

  }

  return {

    safeString,

    success,

    error,

    uuid,

    formatDate,

    formatTime,

    parseDateTime,

    formatElapsedMilliseconds,

    formatDateTime,

    generateSubmissionId,

    generateNotificationId,

    generateCsrTicketId

  };

})();
