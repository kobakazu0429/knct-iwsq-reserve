import { type FC, type ReactNode } from "react";
import Link from "next/link";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { HeadingLevel } from "baseui/heading";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from "baseui/header-navigation";
import { ErrorCard } from "../components/ErrorCard";

interface Props {
  children: ReactNode;
  isLoading?: boolean;
  error?: any;
  notFound?: boolean;
}

export const BaseLayout: FC<Props> = ({ children, isLoading, error }) => {
  const [css, theme] = useStyletron();

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
            <Link
              href="/"
              className={css({ textDecoration: "none", color: "unset" })}
            >
              インキュベーションスクエア
            </Link>
          </NavigationItem>
        </NavigationList>
      </HeaderNavigation>

      <Block display="flex">
        <main
          className={css({
            width: "100%",
            padding: `${theme.sizing.scale600} ${theme.sizing.scale1200}`,
            boxSizing: "border-box",
          })}
        >
          <HeadingLevel>
            {isLoading ? null : error ? (
              <ErrorCard message={error.toString()} />
            ) : (
              children
            )}
          </HeadingLevel>
        </main>
      </Block>
    </>
  );
};
