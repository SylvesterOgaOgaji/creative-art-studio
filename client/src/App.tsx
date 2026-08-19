import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import OfflineStatus from "./components/OfflineStatus";
import { ThemeProvider } from "./contexts/ThemeContext";

const StudioRoute = lazy(() => import("./pages/StudioRoute"));
const Makers = lazy(() => import("@/pages/Makers"));
const Educators = lazy(() => import("@/pages/Educators"));
const ClassroomStarter = lazy(() => import("@/pages/ClassroomStarter"));

function StudioWithReflection() {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-6 text-center text-[#342c43]"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-xs rounded-[1.5rem] border border-[#f2d7a2] bg-white/85 px-8 py-7 shadow-[0_12px_32px_rgba(94,68,31,.12)]">
            <span
              className="mb-3 block text-2xl text-[#ff6b4a]"
              aria-hidden="true"
            >
              ✦
            </span>
            <strong className="font-serif text-xl">
              Opening your art studio
            </strong>
            <p className="mt-2 text-sm text-[#62566d]">
              Bringing the creative tools to your maker table.
            </p>
          </div>
        </main>
      }
    >
      <StudioRoute />
    </Suspense>
  );
}

function PublicRouteLoadingState() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-[#fffaf0] p-6 text-center text-[#342c43]"
      role="status"
      aria-live="polite"
    >
      <div className="max-w-xs rounded-[1.5rem] border border-[#f2d7a2] bg-white/85 px-8 py-7 shadow-[0_12px_32px_rgba(94,68,31,.12)]">
        <span className="mb-3 block text-2xl text-[#ff6b4a]" aria-hidden="true">
          ✦
        </span>
        <strong className="font-serif text-xl">
          Opening the studio journal
        </strong>
        <p className="mt-2 text-sm text-[#62566d]">
          Turning to the next maker-table page.
        </p>
      </div>
    </main>
  );
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={StudioWithReflection} />
      <Route path={"/makers"}>
        <Suspense fallback={<PublicRouteLoadingState />}>
          <Makers />
        </Suspense>
      </Route>
      <Route path={"/educators"}>
        <Suspense fallback={<PublicRouteLoadingState />}>
          <Educators />
        </Suspense>
      </Route>
      <Route path={"/classroom"}>
        <Suspense fallback={<PublicRouteLoadingState />}>
          <ClassroomStarter />
        </Suspense>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <OfflineStatus />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
