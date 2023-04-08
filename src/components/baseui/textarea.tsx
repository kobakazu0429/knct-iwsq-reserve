import React, { useId, type FC } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { FormControl } from "baseui/form-control";
import { Textarea as BaseUiTextarea } from "baseui/textarea";

interface Props {
  name: string;
  label: string;
  caption: string;
}

export const Textarea: FC<Props> = ({ name, label, caption }) => {
  const id = useId();
  const { control } = useFormContext();

  return (
    <FormControl label={label} caption={caption} htmlFor={id}>
      <Controller
        control={control}
        name={name}
        render={({ field: { ref, ...rest } }) => (
          <BaseUiTextarea
            id={id}
            //  @ts-expect-error
            inputRef={ref}
            {...rest}
            // value={value}
          />
        )}
      />
    </FormControl>
  );
};
