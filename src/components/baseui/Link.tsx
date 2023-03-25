import type { FC, ComponentProps } from "react";
import NextLink from "next/link";
import { StyledLink } from "baseui/link";
import { StyledNavLink } from "baseui/side-navigation";

export const Link: FC<
  ComponentProps<typeof StyledLink> & {
    href: string;
  }
> = ({ href, ...props }) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <StyledLink {...props} />
    </NextLink>
  );
};

export const NavLink: FC<ComponentProps<typeof StyledNavLink>> = ({
  href,
  ...props
}) => {
  return (
    <NextLink href={href} passHref legacyBehavior>
      <StyledNavLink {...props} />
    </NextLink>
  );
};
