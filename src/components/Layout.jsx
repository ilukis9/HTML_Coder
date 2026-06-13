import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header'
import Footer from './Footer'
import { QuizHeaderProvider } from '../context/QuizHeaderContext'

const ES_QUIZ = (p) => p.endsWith('/estudio') || p.endsWith('/examen')

export default function Layout() {
  const { pathname } = useLocation()
  const esQuiz = ES_QUIZ(pathname)

  useEffect(() => {
    if (esQuiz) {
      document.body.classList.add('quiz-page')
      return () => document.body.classList.remove('quiz-page')
    }
  }, [esQuiz])

  return (
    <QuizHeaderProvider>
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      {!esQuiz && <Footer />}
    </QuizHeaderProvider>
  )
}
