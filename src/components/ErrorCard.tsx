import { type FC } from "react";
import { Card, StyledBody } from "baseui/card";

interface Props {
  message: string;
}

export const ErrorCard: FC<Props> = ({ message }) => {
  return (
    <Card title="エラー">
      <StyledBody>{message}</StyledBody>
    </Card>
  );
};
