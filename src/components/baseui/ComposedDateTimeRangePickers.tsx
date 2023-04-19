import React, {
  useState,
  useEffect,
  useMemo,
  type FC,
  type ComponentProps,
} from "react";
import { useFormContext } from "react-hook-form";
import { isAfter, isBefore, add, roundToNearestMinutes } from "date-fns";
import { z } from "zod";
import { useStyletron } from "baseui";
import { FormControl } from "baseui/form-control";
import { ArrowRight } from "baseui/icon";
import { DatePicker } from "baseui/datepicker";
import { TimePicker } from "baseui/timepicker";

type DatePickerType = ComponentProps<typeof DatePicker>;
type TimePickerType = ComponentProps<typeof TimePicker>;

const DateTimePicker: FC<{
  name: string;
  label: string;
  value: Date[];
  datePickerOnChange: DatePickerType["onChange"];
  timePickerOnChange: TimePickerType["onChange"];
  type: "start" | "end";
}> = ({ name, type, label, value, datePickerOnChange, timePickerOnChange }) => {
  const { register } = useFormContext();
  const [css, theme] = useStyletron();

  return (
    <div className={css({ display: "flex" })}>
      <div
        className={css({
          width: "120px",
          marginRight: theme.sizing.scale300,
        })}
      >
        <FormControl label={label} caption="　">
          <DatePicker
            {...register(name)}
            value={value}
            onChange={datePickerOnChange}
            range
            mask="9999/99/99"
            displayValueAtRangeIndex={type === "start" ? 0 : 1}
          />
        </FormControl>
      </div>
      <div
        className={css({
          width: "120px",
          marginRight: theme.sizing.scale300,
        })}
      >
        <FormControl label="　" caption="　">
          <TimePicker
            format="24"
            step={300}
            value={value[type === "start" ? 0 : 1]}
            onChange={timePickerOnChange}
          />
        </FormControl>
      </div>
    </div>
  );
};

export const ComposedDateTimeRangePickers: FC = () => {
  const [css, theme] = useStyletron();
  const { getValues, setValue } = useFormContext();

  const defaultValue = useMemo(() => {
    const values = [getValues("start_time"), getValues("end_time")];
    if (values.every((v) => z.string().datetime().safeParse(v).success)) {
      return values.map((v) => new Date(v));
    }
  }, [getValues]);

  const [dates, setDates] = useState(
    defaultValue ?? [
      roundToNearestMinutes(new Date(), { nearestTo: 15 }),
      roundToNearestMinutes(add(new Date(), { hours: 1 }), { nearestTo: 15 }),
    ]
  );

  useEffect(() => {
    setValue("start_time", dates[0]);
    setValue("end_time", dates[1]);
  }, [dates, setValue]);

  return (
    <div
      className={css({
        [theme.mediaQuery.medium]: {
          display: "flex",
          alignItems: "center",
        },
      })}
    >
      <DateTimePicker
        name="start_time"
        type="start"
        label="開始時間"
        value={dates}
        datePickerOnChange={({ date }) => {
          setDates(date as Array<Date>);
        }}
        timePickerOnChange={(time: any) => {
          if (time) {
            if (isAfter(time, dates[1])) {
              setDates([time, time]);
            } else {
              setDates([time, dates[1]]);
            }
          }
        }}
      />

      <div
        className={css({
          display: "none",
          marginRight: theme.sizing.scale300,
          [theme.mediaQuery.medium]: {
            display: "block",
          },
        })}
      >
        <ArrowRight size={24} />
      </div>

      <DateTimePicker
        name="end_time"
        type="end"
        label="終了時間"
        value={dates}
        datePickerOnChange={({ date }) => setDates(date as Array<Date>)}
        timePickerOnChange={(time: any) => {
          if (time) {
            if (isBefore(time, dates[0])) {
              setDates([time, time]);
            } else {
              setDates([dates[0], time]);
            }
          }
        }}
      />
    </div>
  );
};
