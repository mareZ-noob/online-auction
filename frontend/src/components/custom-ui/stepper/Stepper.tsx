import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

export type Step = {
  title: string;
  content: ReactNode;
  disabled?: boolean;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
  onStepChange?: (index: number) => void;
}

export function Stepper({
  steps,
  currentStep,
  className,
  onStepChange,
}: StepperProps) {
  return (
    <Tabs
      value={`${currentStep}`}
      onValueChange={(val) => onStepChange?.(Number(val))}
      className={className}
    >
      <TabsList className="grid grid-cols-4 gap-2 h-fit w-full">
        {steps.map((step, idx) => (
          <TabsTrigger
            key={idx}
            value={`${idx}`}
            disabled={step.disabled || idx > currentStep}
            className={cn(
              "text-sm font-medium",
              idx === currentStep && "text-primary"
            )}
          >
            <div className="flex flex-col items-center">
              <span className="font-semibold">{step.title}</span>
            </div>
          </TabsTrigger>
        ))}
      </TabsList>

      {steps.map((step, idx) => (
        <TabsContent key={idx} value={`${idx}`}>
          {step.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
