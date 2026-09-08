const JOIN_WINDOW_BEFORE_MINUTES = 15; // can join 15 min early
const GRACE_AFTER_MINUTES = 30; // still joinable up to 30 min after scheduled end

export const getCallAvailability = (interview) => {
  if (interview.status === "cancelled") {
    return { canJoin: false, label: "This interview was cancelled" };
  }
  if (interview.status === "completed") {
    return { canJoin: false, label: "This interview has already taken place" };
  }

  const now = new Date();
  const start = new Date(interview.scheduledFor);
  const end = new Date(start.getTime() + interview.durationMinutes * 60000);

  const opensAt = new Date(start.getTime() - JOIN_WINDOW_BEFORE_MINUTES * 60000);
  const closesAt = new Date(end.getTime() + GRACE_AFTER_MINUTES * 60000);

  if (now < opensAt) {
    const minutesUntilOpen = Math.ceil((opensAt - now) / 60000);
    const label =
      minutesUntilOpen > 60
        ? `Call opens ${opensAt.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`
        : `Call opens in ${minutesUntilOpen} min`;
    return { canJoin: false, label };
  }

  if (now > closesAt) {
    return { canJoin: false, label: "The call window for this interview has passed" };
  }

  return { canJoin: true, label: "Join the call now" };
};