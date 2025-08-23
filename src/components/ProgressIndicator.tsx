import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export const ProgressIndicator = ({ currentStep, totalSteps, steps }: ProgressIndicatorProps) => {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300",
                    {
                      "bg-accent text-accent-foreground": isCompleted,
                      "bg-gradient-primary text-primary-foreground shadow-elegant": isCurrent,
                      "bg-muted text-muted-foreground": !isCompleted && !isCurrent,
                    }
                  )}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>
                {index < totalSteps - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 transition-all duration-300",
                      {
                        "bg-accent": isCompleted || isCurrent,
                        "bg-muted": !isCompleted && !isCurrent,
                      }
                    )}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-2 text-center transition-all duration-300 max-w-20",
                  {
                    "text-accent font-medium": isCompleted || isCurrent,
                    "text-muted-foreground": !isCompleted && !isCurrent,
                  }
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};