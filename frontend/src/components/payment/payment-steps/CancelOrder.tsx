import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

const cancelOrderSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters long"),
});

type CancelOrderProps = z.infer<typeof cancelOrderSchema>;

function CancelOrder({
  reason,
  setReason,
}: {
  reason: string;
  setReason: React.Dispatch<React.SetStateAction<string>>;
}) {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelOrderProps>({
    resolver: zodResolver(cancelOrderSchema),
    defaultValues: {
      reason,
    },
  });

  const onSubmit = (data: CancelOrderProps) => {
    setReason(data.reason);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Label className="font-medium mb-2">Reason for Cancellation</Label>
      <Textarea {...register("reason")}></Textarea>
      {errors.reason && (
        <p className="text-destructive text-xs">
          {errors.reason.message}
        </p>
      )}
    </form>
  );
}

export default CancelOrder;
