import React, { useId, type FC, type ComponentProps } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { FormControl } from "baseui/form-control";
import { Input as BaseUiInput } from "baseui/input";

type Props = {
  name: string;
  label: string;
  caption: string;
  type?: "text" | "number";
} & ComponentProps<typeof BaseUiInput>;

export const Input: FC<Props> = ({
  name,
  label,
  caption,
  type = "text",
  ...restProps
}) => {
  const id = useId();
  const { control } = useFormContext();

  return (
    <FormControl label={label} caption={caption} htmlFor={id}>
      <Controller
        control={control}
        name={name}
        render={({ field: { ref, onChange, ...restField } }) => (
          <BaseUiInput
            id={id}
            // @ts-expect-error
            inputRef={ref}
            type={type}
            required
            onChange={(event) => {
              if (type === "number") {
                // @ts-expect-error
                onChange(event.target.valueAsNumber);
              } else {
                onChange(event.target.value);
              }
            }}
            {...restField}
            {...restProps}
          />
        )}
      />
    </FormControl>
  );
};
