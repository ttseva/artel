import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import Header from "../layout/Header/Header";
import MainPage from "../../pages/MainPage/MainPage";
import AuthPage from "../../pages/AuthPage/AuthPage";
import ProfilePage from "../../pages/ProfilePage/ProfilePage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/user/me" element={<ProfilePage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
