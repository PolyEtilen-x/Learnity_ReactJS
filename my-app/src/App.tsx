import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import { ThemeProvider } from "./theme/ThemeProvider";
import AppWrapper from "./AppWrapper";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppWrapper/>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
