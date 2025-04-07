import './App.css';
import { Route, Routes } from "react-router-dom";
import Home from './pages/Home';
import Loader from './pages/Loader';

const App = () => {
  return (
    <Routes>
      <Route path="" element={<Home />} />
      <Route path="loader" element={<Loader />} />
    </Routes>
  );
}

export default App;
