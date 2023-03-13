import React, { type FC, type ReactNode } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { type User } from "@prisma/client";
import { userRoleExtender } from "../prisma/user";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { Button } from "baseui/button";
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
    title: "ユーザー登録",
    itemId: "/dashboard/invite",
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

  if (
    status === "unauthenticated" ||
    !(userRole && userRoleExtender(userRole).includes(authorizedRoles))
  ) {
    return (
      <div>
        <p>Access Denied</p>
        <Link href="/dashboard/signin">SignIn</Link>
      </div>
    );
  }

  return (
    <>
      <HeaderNavigation>
        <NavigationList $align={ALIGN.left}>
          <NavigationItem>IWスクエア管理システム</NavigationItem>
        </NavigationList>
        <NavigationList $align={ALIGN.center} />
        <NavigationList $align={ALIGN.right}>
          <NavigationItem>
            <Link href="#basic-link1">Tab Link One</Link>
          </NavigationItem>
          <NavigationItem>
            <Link href="#basic-link2">Tab Link Two</Link>
          </NavigationItem>
        </NavigationList>
        <NavigationList $align={ALIGN.right}>
          <NavigationItem>
            <Button>Get started</Button>
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
          {children}
        </main>
      </Block>
    </>
  );
};
