import React, { type FC } from "react";
import { Button } from "baseui/button";
import { ListItem, ListItemLabel } from "baseui/list";

interface Event {
  url: string;
  name: string;
  remaining: number;
  waitingMembersCount: number;
  startTime: string;
}

const EventList: FC<{ event: Event }> = ({ event }) => {
  return (
    <ListItem
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
  events: Event[];
}> = ({ events }) => {
  return (
    <ul>
      {events.map((event) => (
        <EventList key={event.url} event={event} />
      ))}
    </ul>
  );
};
