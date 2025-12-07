import { toast } from "sonner";

type ToastData = {
  message: string;
  response?: { data: { message: string } };
};

export function toastSuccess(message: string) {
  toast.success(message);
}

export function toastError(error: ToastData | Error) {
  if (error instanceof Error) {
    const message = error.message || "Something went wrong";
    toast.error(message);
    return;
  }

  const message =
    error?.response?.data?.message || error?.message || "Something went wrong";

  toast.error(message);
}
