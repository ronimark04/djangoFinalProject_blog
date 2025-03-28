import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import TagPage from './components/TagPage'
import ArticlePage from './components/ArticlePage'
import Login from './components/Login'
import Register from './components/Register'
import SearchResults from './components/SearchResults'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";


function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/tag/:tag" element={<TagPage />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/search/:query" element={<SearchResults />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
