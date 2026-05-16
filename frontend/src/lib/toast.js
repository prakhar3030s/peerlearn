import toast from "react-hot-toast";
import { getErrorMessage } from "./errorMessage.js";

export function toastSuccess(message) {
  toast.success(message, { duration: 4000 });
}

export function toastError(message) {
  toast.error(message, { duration: 4000 });
}

/** Show error toast from an Error object; uses 429-friendly message. */
export function toastErrorFromError(error) {
  toast.error(getErrorMessage(error), { duration: 4000 });
}

export function toastInfo(message) {
  toast(message, { duration: 4000 });
}

export function toastWarning(message) {
  toast(message, { duration: 4000 });
}
