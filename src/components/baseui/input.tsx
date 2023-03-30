import React, { useId, type FC, type ComponentProps } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useStyletron } from "baseui";
import { FormControl } from "baseui/form-control";
import { Input as BaseUiInput } from "baseui/input";

type Props = {
  name: string;
  label: string;
  caption?: string;
  type?: "text" | "number";
} & ComponentProps<typeof BaseUiInput>;

export const Input: FC<Props> = ({
  name,
  label,
  caption = "",
  type = "text",
  ...restProps
}) => {
  const [css] = useStyletron();
  const id = useId();
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <FormControl
      label={label}
      caption={
        caption === "" ? (
          // prevent Layout Shift without error
          // eslint-disable-next-line no-irregular-whitespace
          <span className={css({ userSelect: "none" })}>　</span>
        ) : (
          <span>{caption}</span>
        )
      }
      error={
        errors[name]?.message && (
          <span>{errors[name]?.message as string | undefined}</span>
        )
      }
      htmlFor={id}
    >
      <Controller
        control={control}
        name={name}
        render={({ field: { ref, onChange, ...restField } }) => (
          <>
            <BaseUiInput
              overrides={{
                EndEnhancer: {
                  style: {
                    "white-space": "nowrap",
                  },
                },
              }}
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
          </>
        )}
      />
    </FormControl>
  );
};
