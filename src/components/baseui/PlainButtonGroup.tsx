import React, { type FC, type ReactNode } from "react";
import { useStyletron } from "baseui";

interface Props {
  children: ReactNode;
  justifyContent?: "left" | "right";
}

export const PlainButtonGroup: FC<Props> = ({
  children,
  justifyContent = "left",
}) => {
  const [css, theme] = useStyletron();
  return (
    <div
      className={css({
        display: "flex",
        columnGap: theme.sizing.scale800,
        justifyContent,
      })}
    >
      {children}
    </div>
  );
};
