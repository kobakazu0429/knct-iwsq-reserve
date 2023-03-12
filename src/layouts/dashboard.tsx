import React, { ReactNode, useState, type FC } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { type User } from "@prisma/client";
import { userRoleExtender } from "../prisma/user";
import { Block } from "baseui/block";
import { StyledLink } from "baseui/link";
import { Button } from "baseui/button";
import { Navigation, StyledNavLink, type Item } from "baseui/side-navigation";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from "baseui/header-navigation";

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

        <Link href="/dashboard/signin" passHref>
          <StyledLink>SignIn</StyledLink>
        </Link>
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
              style: ({ $active, $theme }) => {
                return {
                  width: "300px",
                  height: "100%",
                  borderRightColor: $theme.colors.mono900,
                  borderRightWidth: "2px",
                  borderRightStyle: "solid",
                };
              },
            },
            NavItem: {
              style: ({ $active, $theme }) => {
                if (!$active) {
                  return {
                    ":hover": {
                      color: $theme.colors.positive400,
                    },
                  };
                }
                return {
                  backgroundColor: $theme.colors.positive400,
                  borderLeftColor: $theme.colors.mono900,
                  color: $theme.colors.mono900,
                  ":hover": {
                    color: $theme.colors.positive400,
                  },
                };
              },
            },
            NavLink: {
              component: (props) => {
                return (
                  <Link href={props.href} passHref>
                    <StyledNavLink {...props} />
                  </Link>
                );
              },
            },
          }}
        />

        <main style={{ width: "100%" }}>{children}</main>
      </Block>
    </>
  );
};
