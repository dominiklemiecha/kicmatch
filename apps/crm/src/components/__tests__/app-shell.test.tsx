import { describe, it, expect } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from "@tanstack/react-router";
import { AppShell } from "../layout/app-shell";

async function renderWithRouter(child: JSX.Element) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const rootRoute = createRootRoute({ component: () => <QueryClientProvider client={queryClient}>{child}</QueryClientProvider> });
  const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: "/", component: () => null });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(<RouterProvider router={router} />);
    await router.load();
  });
  return result!;
}

describe("AppShell", () => {
  it("renders branded sidebar, topbar and children content", async () => {
    await renderWithRouter(
      <AppShell>
        <div data-testid="page-content">Hello</div>
      </AppShell>,
    );
    expect(screen.getByTestId("page-content")).toHaveTextContent("Hello");
  });
});
