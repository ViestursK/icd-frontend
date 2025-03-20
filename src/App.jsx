// /src/App.js
import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./routes/AppRouter";
import "./styles/globals.css";

function App() {
  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;
