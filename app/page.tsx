'use client'

import { useState, useEffect } from 'react'

interface Habit {
  id: string
  name: string
  completedDates: string[]
  createdAt: string
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [newHabitName, setNewHabitName] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('habits')
    if (stored) {
      setHabits(JSON.parse(stored))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits))
  }, [habits])

  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName,
        completedDates: [],
        createdAt: new Date().toISOString()
      }
      setHabits([...habits, newHabit])
      setNewHabitName('')
    }
  }

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id))
  }

  const toggleDate = (habitId: string, date: string) => {
    setHabits(habits.map(habit => {
      if (habit.id === habitId) {
        const completed = habit.completedDates.includes(date)
        return {
          ...habit,
          completedDates: completed
            ? habit.completedDates.filter(d => d !== date)
            : [...habit.completedDates, date]
        }
      }
      return habit
    }))
  }

  const getLast30Days = () => {
    const days = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const getDayLabel = (date: Date) => {
    return date.toLocaleDateString('de-DE', { weekday: 'short' }).substring(0, 2)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return formatDate(date) === formatDate(today)
  }

  const calculateStreak = (completedDates: string[]) => {
    const sortedDates = [...completedDates].sort().reverse()
    let streak = 0
    const today = new Date()

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date()
      checkDate.setDate(today.getDate() - i)
      const dateStr = formatDate(checkDate)

      if (sortedDates.includes(dateStr)) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  const days = getLast30Days()

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Habit Tracker</h1>
        <p>Baue bessere Gewohnheiten auf</p>
      </div>

      <div className="add-habit-form">
        <h2>Neue Gewohnheit hinzufügen</h2>
        <div className="form-group">
          <input
            type="text"
            placeholder="z.B. Sport machen, Buch lesen..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          />
          <button className="btn btn-primary" onClick={addHabit}>
            Hinzufügen
          </button>
        </div>
      </div>

      {habits.length === 0 ? (
        <div className="empty-state">
          <h3>Noch keine Gewohnheiten</h3>
          <p>Füge deine erste Gewohnheit hinzu, um zu starten!</p>
        </div>
      ) : (
        <div className="habits-list">
          {habits.map(habit => (
            <div key={habit.id} className="habit-card">
              <div className="habit-header">
                <h3 className="habit-title">{habit.name}</h3>
                <span className="habit-streak">
                  🔥 {calculateStreak(habit.completedDates)} Tage
                </span>
              </div>

              <div className="calendar">
                {days.map((date) => {
                  const dateStr = formatDate(date)
                  const completed = habit.completedDates.includes(dateStr)

                  return (
                    <div
                      key={dateStr}
                      className={`day ${completed ? 'completed' : ''} ${isToday(date) ? 'today' : ''}`}
                      onClick={() => toggleDate(habit.id, dateStr)}
                    >
                      <span className="day-label">{getDayLabel(date)}</span>
                      <span className="day-number">{date.getDate()}</span>
                    </div>
                  )
                })}
              </div>

              <div className="habit-actions">
                <button
                  className="btn btn-delete"
                  onClick={() => deleteHabit(habit.id)}
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
