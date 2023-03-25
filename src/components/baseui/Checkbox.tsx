import React, { type FC, type ComponentProps } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Checkbox as BaseUiCheckbox } from "baseui/checkbox";

type CheckboxType = ComponentProps<typeof BaseUiCheckbox>;

type Props = {
  name: string;
  label: string;
} & Omit<
  CheckboxType,
  | "name"
  | "onBlur"
  | "onChange"
  | "labelPlacement"
  | "checked"
  | "inputRef"
  | "chidlren"
>;

export const Checkbox: FC<Props> = ({ name, label, ...props }) => {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <BaseUiCheckbox
          // @ts-expect-error
          inputRef={field.ref}
          checked={field.value}
          labelPlacement="right"
          onBlur={field.onBlur}
          onChange={(e) => field.onChange(e.target.checked)}
          {...props}
        >
          {label}
        </BaseUiCheckbox>
      )}
    />
  );
};
