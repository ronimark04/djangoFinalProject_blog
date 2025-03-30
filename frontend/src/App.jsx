import './App.css'
import Navbar from './components/Navbar'
import Home from './components/Home'
import ArticlePage from './components/ArticlePage'
import Login from './components/Login'
import Register from './components/Register'
import SearchResults from './components/SearchResults'
import CreateArticle from './components/CreateArticle'
import EditArticle from './components/EditArticle'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {

  return (
    <>
      <AuthProvider>
        <Router>
          <Navbar />
          <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={'light'}
            transition={Slide}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/article/:id" element={<ArticlePage />} />
            <Route path="/create-article" element={<CreateArticle />} />
            <Route path="/edit-article/:id" element={<EditArticle />} />
            <Route path="/search/:query" element={<SearchResults />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  )
}

export default App
