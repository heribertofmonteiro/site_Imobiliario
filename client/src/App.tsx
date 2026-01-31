import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ComparisonProvider } from "./contexts/ComparisonContext";
import Home from "./pages/Home";
import Imoveis from "./pages/Imoveis";
import ImovelDetalhes from "./pages/ImovelDetalhes";
import AdminPanel from "./pages/AdminPanel";
import Analytics from "./pages/Analytics";
import Comparar from "./pages/Comparar";
import Blog from "./pages/Blog";
import Login from "./pages/Login";
import SmartAgent from "./components/SmartAgent";

import { ROUTES } from "./lib/routes";

function Router() {
  return (
    <Switch>
      <Route path={ROUTES.home} component={Home} />
      <Route path={ROUTES.imoveis} component={Imoveis} />
      <Route path={ROUTES.imovelDetalhes(":id")} component={ImovelDetalhes} />
      <Route path={ROUTES.comparar} component={Comparar} />
      <Route path={ROUTES.admin} component={AdminPanel} />
      <Route path={ROUTES.analytics} component={Analytics} />
      <Route path={ROUTES.blog} component={Blog} />
      <Route path={ROUTES.login} component={Login} />
      <Route path={ROUTES.notFound} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <FavoritesProvider>
          <ComparisonProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <SmartAgent />
            </TooltipProvider>
          </ComparisonProvider>
        </FavoritesProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
