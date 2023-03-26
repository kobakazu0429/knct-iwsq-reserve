import React, {
  useState,
  type FC,
  type ComponentProps,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { useFormContext, Controller } from "react-hook-form";
import { FormControl } from "baseui/form-control";
import { Combobox as BaseUiCombobox } from "baseui/combobox";

type ComboboxType = ComponentProps<typeof BaseUiCombobox>;

type Props<Option extends string = any> = {
  name: string;
  label: string;
  options: Option[];
  optionsValueMapper: Record<Option, string>;
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
  optionsValueMapper,
  ...props
}) => {
  const { control, setValue, watch } = useFormContext();
  const [comboboxLabel, setComboboxLabel] = useState<string | undefined>("");
  const optionsValueMapperReversed = useMemo(() => {
    return Object.fromEntries(
      Object.entries(optionsValueMapper).map((kv) => kv.reverse())
    );
  }, [optionsValueMapper]);

  const onChnage = useCallback(
    (v: string) => {
      setComboboxLabel(v);
      setValue(name, optionsValueMapper[v]);
    },
    [setComboboxLabel, setValue, name, optionsValueMapper]
  );

  const formValue = watch(name);
  useEffect(() => {
    if (!options.includes(comboboxLabel)) {
      setComboboxLabel(optionsValueMapperReversed[formValue]);
    }
  }, [formValue, options, comboboxLabel, optionsValueMapperReversed]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormControl label={label}>
          <BaseUiCombobox
            inputRef={field.ref}
            mapOptionToString={(option) => option as string}
            value={comboboxLabel ?? ""}
            onChange={onChnage}
            // onBlur={field.onBlur}
            options={options}
            name={field.name}
            {...props}
          />
        </FormControl>
      )}
    />
  );
};
