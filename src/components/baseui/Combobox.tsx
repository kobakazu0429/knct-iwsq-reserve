import type { FC, ComponentProps } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { useStyletron } from "baseui";
import { FormControl } from "baseui/form-control";
import { Combobox as BaseUiCombobox } from "baseui/combobox";

type ComboboxType = ComponentProps<typeof BaseUiCombobox>;

type Props<Option extends string = any> = {
  name: string;
  label: string;
  options: Option[] | readonly Option[];
  caption?: string;
  errorsName: string;
  onChnage?: (newLabel: string) => void;
} & Omit<
  ComboboxType,
  | "name"
  | "onBlur"
  | "onChange"
  | "inputRef"
  | "mapOptionToString"
  | "value"
  | "options"
>;

export const Combobox: FC<Props> = ({
  name,
  label,
  options,
  caption = "",
  errorsName,
  ...props
}) => {
  const [css] = useStyletron();
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  return (
    <div className={css({ width: "100%" })}>
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
          errors[errorsName]?.message && (
            <span>{errors[errorsName]?.message as string | undefined}</span>
          )
        }
      >
        <Controller
          control={control}
          name={name}
          render={({ field }) => (
            <BaseUiCombobox
              inputRef={field.ref}
              mapOptionToString={(option) => option as string}
              value={field.value}
              onChange={(newLabel: string) => {
                setValue(name, newLabel);
                props.onChnage?.(newLabel);
              }}
              // onBlur={field.onBlur}
              // @ts-expect-error
              options={options}
              name={field.name}
              {...props}
            />
          )}
        />
      </FormControl>
    </div>
  );
};
