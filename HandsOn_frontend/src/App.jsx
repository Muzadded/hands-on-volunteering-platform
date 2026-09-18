import { BrowserRouter } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import { ToastProvider } from "./components/ToastProvider";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppRoute />
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
