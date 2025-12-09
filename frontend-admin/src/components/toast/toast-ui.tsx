import { AxiosError } from "axios";
import { toast } from "sonner";

export type ToastData = {
  message: string;
  response?: { data: { message: string } };
};

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: unknown) {
  if (error instanceof AxiosError) {
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    toast.error(message);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message || "Something went wrong");
    return;
  }

  toast.error("Something went wrong");
}
