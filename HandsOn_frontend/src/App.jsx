import { BrowserRouter } from "react-router-dom";
import AppRoute from "./routes/AppRoute";
import './App.css'

function App() {
  return (
    <>
      <BrowserRouter>
        <AppRoute />
      </BrowserRouter>
    </>
  )
}

export default App
