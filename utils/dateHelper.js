// utils/dateHelper.js
export const formatDurationInvites = (inviteDate) => {
  const now = new Date();
  const createdAt = new Date(inviteDate);

  // Calculate difference in milliseconds
  const diffMs = now - createdAt;

  // Convert to different units
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  // Return appropriate format based on time difference
  if (diffYears > 0) {
    return {
      number: diffYears,
      period: diffYears === 1 ? "year" : "years",
    };
  } else if (diffMonths > 0) {
    return {
      number: diffMonths,
      period: diffMonths === 1 ? "month" : "months",
    };
  } else if (diffWeeks > 0) {
    return {
      number: diffWeeks,
      period: diffWeeks === 1 ? "week" : "weeks",
    };
  } else if (diffDays > 0) {
    if (diffDays === 1) {
      return {
        number: 0,
        period: "yesterday",
      };
    } else {
      return {
        number: diffDays,
        period: "days",
      };
    }
  } else if (diffHours > 0) {
    return {
      number: diffHours,
      period: diffHours === 1 ? "hour" : "hours",
    };
  } else {
    return {
      number: 0,
      period: "hours", // "< 1 hour ago"
    };
  }
};
