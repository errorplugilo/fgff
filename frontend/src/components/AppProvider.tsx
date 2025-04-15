// ui/src/components/AppProvider.tsx
import type { ReactNode } from "react";
import { GlobalLayout } from "components/GlobalLayout"; // Import the layout

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * The GlobalLayout provides the main navigation and structure.
 * Children will be rendered inside the main content area of the layout.
 */
export const AppProvider = ({ children }: Props) => {
  // Wrap children with GlobalLayout.
  // The actual page content (children) will be rendered via <Outlet /> inside GlobalLayout.
  return <GlobalLayout>{children}</GlobalLayout>;
};
