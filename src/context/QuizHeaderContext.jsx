import { createContext, useContext, useState } from 'react'

const QuizHeaderContext = createContext(null)

export function QuizHeaderProvider({ children }) {
  const [quizHeader, setQuizHeader] = useState(null)
  return (
    <QuizHeaderContext.Provider value={{ quizHeader, setQuizHeader }}>
      {children}
    </QuizHeaderContext.Provider>
  )
}

export const useQuizHeader = () => useContext(QuizHeaderContext)
