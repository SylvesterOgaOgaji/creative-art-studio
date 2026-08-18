import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import NotFound from "@/pages/NotFound";
import Makers from "@/pages/Makers";
import Educators from "@/pages/Educators";
import ClassroomStarter from "@/pages/ClassroomStarter";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const StudioRoute = lazy(() => import("./pages/StudioRoute"));

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

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={StudioWithReflection} />
      <Route path={"/makers"} component={Makers} />
      <Route path={"/educators"} component={Educators} />
      <Route path={"/classroom"} component={ClassroomStarter} />
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
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
