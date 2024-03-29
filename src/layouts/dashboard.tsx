import React, { type FC, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { type User } from "@prisma/client";
import { userRoleExtender } from "../prisma/user";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { HeadingLevel } from "baseui/heading";
import { Navigation, type Item } from "baseui/side-navigation";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from "baseui/header-navigation";
import { Link, NavLink } from "../components/baseui/Link";

const nav: Item[] = [
  {
    title: "イベント",
    itemId: "/dashboard/events",
    subNav: [
      {
        title: "作成",
        itemId: "/dashboard/events/create",
      },
    ],
  },
  {
    title: "メール",
    itemId: "/dashboard/mails",
  },
  {
    title: "ユーザー(Admin)",
    itemId: "/dashboard/users",
  },
  {
    title: "Teams(Admin)",
    itemId: "/dashboard/teams/inviteMembers",
  },
];

interface Props {
  children: ReactNode;
  authorizedRoles?: User["role"];
}

export const Dashboard: FC<Props> = ({
  children,
  authorizedRoles = "GUEST",
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [css, theme] = useStyletron();

  const userRole = session?.user.role;

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div>
        <p>Access Denied</p>
        <Link href="/api/auth/signin">SignIn</Link>
      </div>
    );
  }

  if (!(userRole && userRoleExtender(userRole).includes(authorizedRoles))) {
    return (
      <div>
        <p>Access Denied</p>
        <p>
          Access level is {authorizedRoles}. (You are {userRole ?? "unknown"})
        </p>
        <Link href="/dashboard">to Dashboard</Link>
      </div>
    );
  }

  return (
    <>
      <HeaderNavigation
        overrides={{
          Root: {
            style: {
              // short hand is not recommended to avoid conflicts
              paddingTop: theme.sizing.scale600,
              paddingBottom: theme.sizing.scale600,
              paddingLeft: theme.sizing.scale1200,
              paddingRight: theme.sizing.scale1200,
            },
          },
        }}
      >
        <NavigationList $align={ALIGN.left}>
          <NavigationItem className={css({ paddingLeft: 0 })}>
            スクエア管理システム
          </NavigationItem>
        </NavigationList>
        <NavigationList $align={ALIGN.right}>
          <NavigationItem>
            <p>
              {session?.user.name} / {session?.user.role}
            </p>
          </NavigationItem>
        </NavigationList>
      </HeaderNavigation>

      <Block display="flex">
        <Navigation
          items={nav}
          activeItemId={router.pathname}
          overrides={{
            Root: {
              style: {
                width: "300px",
                height: "100dvh",
                borderRightColor: theme.colors.borderOpaque,
                borderRightWidth: "1px",
                borderRightStyle: "solid",
              },
            },
            NavItem: {
              style: ({ $active }) => {
                if (!$active) {
                  return {
                    ":hover": {
                      color: theme.colors.positive400,
                    },
                  };
                }
                return {
                  backgroundColor: theme.colors.positive400,
                  borderLeftColor: theme.colors.mono900,
                  color: theme.colors.mono900,
                  ":hover": {
                    color: theme.colors.positive400,
                  },
                };
              },
            },
            NavLink: {
              component: (props) => {
                return <NavLink {...props} />;
              },
            },
          }}
        />

        <main
          className={css({
            width: "100%",
            padding: `${theme.sizing.scale600} ${theme.sizing.scale1200}`,
          })}
        >
          <HeadingLevel>{children}</HeadingLevel>
        </main>
      </Block>
    </>
  );
};
