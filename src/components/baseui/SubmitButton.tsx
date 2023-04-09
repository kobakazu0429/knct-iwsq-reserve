import { type ComponentProps, type FC } from "react";
import { useFormContext } from "react-hook-form";
import { Button } from "baseui/button";

type ButtonType = ComponentProps<typeof Button>;

type Props = Omit<ButtonType, "type" | "isLoading" | "isSelected" | "onClick">;

export const SubmitButton: FC<Props> = ({ children, ...props }) => {
  const { formState } = useFormContext();

  return (
    <Button
      type="submit"
      isLoading={
        formState.isSubmitting ||
        formState.isSubmitSuccessful ||
        formState.isSubmitted
      }
      isSelected={
        formState.isSubmitting ||
        formState.isSubmitSuccessful ||
        formState.isSubmitted
      }
      {...props}
    >
      {children}
    </Button>
  );
};
