import React, { type FC } from "react";
import { Button } from "baseui/button";
import { ListItem, ListItemLabel } from "baseui/list";
import { onlyMobile } from "../../style/mediaQuery";

export interface EventProps {
  url: string;
  name: string;
  remaining: number;
  waitingMembersCount: number;
  startTime: string;
}

const EventList: FC<{ event: EventProps }> = ({ event }) => {
  return (
    <ListItem
      overrides={{
        Root: {
          style: {
            [onlyMobile]: {
              marginBottom: "50px",
            },
          },
        },
        Content: {
          style: {
            [onlyMobile]: {
              marginLeft: 0,
              paddingRight: 0,
              flexDirection: "column",
              alignItems: "left",
            },
          },
        },
        EndEnhancerContainer: {
          style: {
            [onlyMobile]: {
              width: "100%",
            },
          },
        },
      }}
      endEnhancer={() => (
        <Button
          overrides={{ BaseButton: { style: { width: "100%" } } }}
          $as="a"
          href={event.url}
        >
          参加する
        </Button>
      )}
    >
      <ListItemLabel
        description={`${event.startTime}〜、残り ${event.remaining} 人（キャンセル待ち ${event.waitingMembersCount} 人）`}
      >
        {event.name}
      </ListItemLabel>
    </ListItem>
  );
};

export const EventLists: FC<{
  events: EventProps[];
}> = ({ events }) => {
  return (
    <ul>
      {events.map((event) => (
        <EventList key={event.url} event={event} />
      ))}
    </ul>
  );
};
