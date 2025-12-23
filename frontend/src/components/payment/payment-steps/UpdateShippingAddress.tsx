import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { usePaymentStore } from "@/store/payment-store";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useUpdateShippingAddress } from "@/hooks/transaction-hooks";
import {
  toastError,
  toastSuccess,
} from "@/components/custom-ui/toast/toast-ui";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const updateShippingPaymentSchema = z.object({
  shippingAddress: z
    .string()
    .min(5, "Shipping address must be at least 5 characters long"),
});

type UpdateShippingAddressProps = z.infer<typeof updateShippingPaymentSchema>;

function UpdateShippingAddress() {
  const { transactionId, shippingAddress, setShippingAddress } =
    usePaymentStore();
  const { mutate } = useUpdateShippingAddress();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateShippingAddressProps>({
    resolver: zodResolver(updateShippingPaymentSchema),
    defaultValues: {
      shippingAddress,
    },
  });

  const onSubmit = (data: UpdateShippingAddressProps) => {
    mutate(
      {
        transactionId: Number(transactionId),
        shippingAddress: data.shippingAddress,
      },
      {
        onSuccess: (result) => {
          setShippingAddress(data.shippingAddress);
          toastSuccess(
            result.message || "Shipping address updated successfully"
          );
        },
        onError: (error) => {
          toastError(error || "Failed to update shipping address");
        },
      }
    );
  };

  return (
    <form
      className="flex flex-col gap-2 mt-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Label className="font-medium mb-2">Shipping Address</Label>
      <p className="text-sm text-gray-500 italic">
        Please guarantee the accuracy of your shipping address to avoid delivery
        issues.
      </p>
      <p className="text-sm text-gray-500 italic">
        Remember to press UPDATE button.
      </p>
      <div className="flex items-center gap-8">
        <Input
          placeholder="Enter your shipping address (e.g., 123 Le Loi Street, District 1, HCMC)"
          {...register("shippingAddress")}
        />
        <Button variant="default" type="submit">
          Update
        </Button>
      </div>
      {errors.shippingAddress && (
        <p className="text-destructive text-xs">
          {errors.shippingAddress.message}
        </p>
      )}
    </form>
  );
}

export default UpdateShippingAddress;
