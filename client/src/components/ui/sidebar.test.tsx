import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Sidebar,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "./sidebar";

function stubDesktopViewport() {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    value: 1024,
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe("SidebarProvider", () => {
  beforeEach(stubDesktopViewport);
  afterEach(() => vi.restoreAllMocks());

  it("toggles the desktop sidebar with its labelled trigger and keyboard shortcut", () => {
    const onOpenChange = vi.fn();
    render(
      <SidebarProvider defaultOpen onOpenChange={onOpenChange}>
        <Sidebar collapsible="icon">Maker tools</Sidebar>
        <SidebarTrigger />
      </SidebarProvider>
    );

    const sidebar = screen
      .getByText("Maker tools")
      .closest<HTMLElement>("[data-slot='sidebar']");
    expect(sidebar).toHaveAttribute("data-state", "expanded");
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("updates its own expanded and collapsed state when the rail is used", () => {
    render(
      <SidebarProvider defaultOpen>
        <Sidebar collapsible="offcanvas">Maker tools</Sidebar>
        <SidebarRail />
      </SidebarProvider>
    );

    const sidebar = screen
      .getByText("Maker tools")
      .closest<HTMLElement>("[data-slot='sidebar']");
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebar).toHaveAttribute("data-state", "collapsed");
    fireEvent.click(screen.getByRole("button", { name: "Toggle Sidebar" }));
    expect(sidebar).toHaveAttribute("data-state", "expanded");
  });
});
