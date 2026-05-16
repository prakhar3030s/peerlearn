/**
 * Central error message for API/network errors.
 * 429 → friendly rate limit message; connection/Supabase failures → branded message.
 */
export function getErrorMessage(error) {
  if (!error) return "Something went wrong.";
  const status = error?.response?.status;
  if (status === 429) {
    return "Too many requests — please wait a moment.";
  }
  const body = error?.response?.data;
  const msg = body?.message ?? body?.error ?? error?.message;
  if (msg && typeof msg === "string") return msg;
  if (error?.message === "Network Error" || error?.code === "ECONNABORTED") {
    return "Connection failed. Please check your network and try again.";
  }
  return "Something went wrong.";
}

/** Title for full-page/panel errors when backend/Supabase is unreachable */
export function getErrorPanelTitle(error) {
  const status = error?.response?.status;
  if (status === 429) return "Too many requests";
  if (error?.message === "Network Error" || error?.code === "ECONNABORTED") {
    return "Connection failed";
  }
  return "Something went wrong";
}
