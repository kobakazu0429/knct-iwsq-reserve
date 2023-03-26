import { type FC, type ReactNode } from "react";
import { useStyletron } from "baseui";
import { Block } from "baseui/block";
import { HeadingLevel } from "baseui/heading";
import { Button } from "baseui/button";
import {
  HeaderNavigation,
  ALIGN,
  StyledNavigationItem as NavigationItem,
  StyledNavigationList as NavigationList,
} from "baseui/header-navigation";
import { Link } from "../components/baseui/Link";
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
            IWスクエア
          </NavigationItem>
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
      </HeaderNavigation>

      <Block display="flex">
        <main
          className={css({
            width: "100%",
            padding: `${theme.sizing.scale600} ${theme.sizing.scale1200}`,
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
