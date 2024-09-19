'use client'

import React, { useState } from 'react'
import { Settings, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

interface Habit {
  id: number
  name: string
  icon: string
  time?: string
  streak: number
  consistency: number
  checkIns: number
  calendar: Record<string, 'check-in' | 'miss' | 'day-off' | null>
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function HabitTrackerComponent() {
  const [habits, setHabits] = useState<Habit[]>([
    {
      id: 1,
      name: 'Write',
      icon: '✍️',
      time: '6 pm',
      streak: 1,
      consistency: 100,
      checkIns: 1,
      calendar: {
        '2023-09-01': 'check-in',
        '2023-09-02': 'miss',
        '2023-09-03': 'day-off',
      }
    },
    {
      id: 2,
      name: 'Learn English',
      icon: '🇺🇸',
      streak: 0,
      consistency: 0,
      checkIns: 0,
      calendar: {}
    },
  ])
  const [newHabit, setNewHabit] = useState({ name: '', icon: '' })
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [calendarView, setCalendarView] = useState<'week' | 'month' | 'year'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())

  const addHabit = () => {
    if (newHabit.name && newHabit.icon) {
      setHabits([...habits, { ...newHabit, id: Date.now(), streak: 0, consistency: 0, checkIns: 0, calendar: {} }])
      setNewHabit({ name: '', icon: '' })
    }
  }

  const editHabit = (habit: Habit) => {
    const updatedHabits = habits.map(h => h.id === habit.id ? habit : h)
    setHabits(updatedHabits)
    setEditingHabit(null)
  }

  const removeHabit = (id: number) => {
    setHabits(habits.filter(habit => habit.id !== id))
  }

  const toggleCheckIn = (habit: Habit, date: string) => {
    const newCalendar = { ...habit.calendar }
    if (!newCalendar[date]) {
      newCalendar[date] = 'check-in'
    } else if (newCalendar[date] === 'check-in') {
      newCalendar[date] = 'miss'
    } else if (newCalendar[date] === 'miss') {
      newCalendar[date] = 'day-off'
    } else {
      delete newCalendar[date]
    }

    const updatedHabit = { ...habit, calendar: newCalendar }
    updateHabitStats(updatedHabit)
    setHabits(habits.map(h => h.id === habit.id ? updatedHabit : h))
  }

  const toggleTodayCheckIn = (habit: Habit) => {
    const today = new Date().toISOString().split('T')[0]
    const newCalendar = { ...habit.calendar }
    if (newCalendar[today] === 'check-in') {
      delete newCalendar[today]
    } else {
      newCalendar[today] = 'check-in'
    }

    const updatedHabit = { ...habit, calendar: newCalendar }
    updateHabitStats(updatedHabit)
    setHabits(habits.map(h => h.id === habit.id ? updatedHabit : h))
  }

  const updateHabitStats = (habit: Habit) => {
    const checkIns = Object.values(habit.calendar).filter(v => v === 'check-in').length
    habit.checkIns = checkIns
    habit.consistency = calculateConsistency(habit, calendarView, currentDate)
    habit.streak = calculateStreak(habit)
  }

  const calculateStreak = (habit: Habit) => {
    const today = new Date()
    let streak = 0
    for (let i = 0; i < 365; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateString = date.toISOString().split('T')[0]
      if (habit.calendar[dateString] === 'check-in') {
        streak++
      } else if (habit.calendar[dateString] !== 'day-off') {
        break
      }
    }
    return streak
  }

  const calculateConsistency = (habit: Habit, view: 'week' | 'month' | 'year', date: Date) => {
    let startDate: Date
    let endDate: Date

    switch (view) {
      case 'week':
        startDate = new Date(date)
        startDate.setDate(date.getDate() - date.getDay() + 1)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'month':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1)
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
        break
      case 'year':
        startDate = new Date(date.getFullYear(), 0, 1)
        endDate = new Date(date.getFullYear(), 11, 31)
        break
    }

    let totalDays = 0
    let checkIns = 0

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateString = d.toISOString().split('T')[0]
      if (habit.calendar[dateString] === 'check-in') {
        checkIns++
      }
      totalDays++
    }

    return Math.round((checkIns / totalDays) * 100) || 0
  }


  const renderCalendar = (habit: Habit) => {
    let startDate: Date
    let endDate: Date
    // let dateFormat: Intl.DateTimeFormatOptions

    switch (calendarView) {
      case 'week':
        startDate = new Date(currentDate)
        startDate.setDate(currentDate.getDate() - currentDate.getDay() + 1)
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
        // dateFormat = { weekday: 'short' }
        break
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        // dateFormat = { day: 'numeric' }
        break
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1)
        endDate = new Date(currentDate.getFullYear(), 11, 31)
        // dateFormat = { day: 'numeric' }
        break
    }

    const dates: Date[] = []
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }

    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <Button variant="outline" size="sm" onClick={() => {
            const newDate = new Date(currentDate)
            if (calendarView === 'week') newDate.setDate(newDate.getDate() - 7) 
            else if (calendarView === 'month') newDate.setMonth(newDate.getMonth() - 1)
            else newDate.setFullYear(newDate.getFullYear() - 1)
            setCurrentDate(newDate)
          }}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Select value={calendarView} onValueChange={(value: 'week' | 'month' | 'year') => setCalendarView(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => {
            const newDate = new Date(currentDate)
            if (calendarView === 'week') newDate.setDate(newDate.getDate() + 7)
            else if (calendarView === 'month') newDate.setMonth(newDate.getMonth() + 1)
            else newDate.setFullYear(newDate.getFullYear() + 1)
            setCurrentDate(newDate)
          }}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className={`grid gap-1 ${calendarView === 'year' ? 'grid-cols-11' : 'grid-cols-7'}`}>
          {calendarView === 'week' && DAYS.map(day => (
            <div key={day} className="text-center text-xs text-gray-500">{day}</div>
          ))}
          {dates.map(date => {
            const dateString = date.toISOString().split('T')[0]
            const status = habit.calendar[dateString]
            return (
              <button
                key={dateString}
                className={`h-6 w-full rounded ${
                  status === 'check-in' ? 'bg-green-500' :
                  status === 'miss' ? 'bg-red-500' :
                  status === 'day-off' ? 'bg-gray-500' :
                  'bg-gray-700'
                }`}
                onClick={() => toggleCheckIn(habit, dateString)}
              >
                
                <span className="text-xs text-gray-500">
                  {calendarView === 'year' 
                    ? Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
                    : date.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">{habits.length} HABITS</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Habit</DialogTitle>
                </DialogHeader>
                <Input
                  placeholder="Habit name"
                  value={newHabit.name}
                  onChange={(e) => setNewHabit({ ...newHabit, name: e.target.value })}
                />
                <Input
                  placeholder="Habit icon (emoji)"
                  value={newHabit.icon}
                  onChange={(e) => setNewHabit({ ...newHabit, icon: e.target.value })}
                />
                <Button onClick={addHabit}>Add Habit</Button>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {habits.map(habit => (
            <div key={habit.id} className="bg-gray-800 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <span>{habit.icon}</span>
                  <span className="font-semibold">{habit.name}</span>
                  {habit.time && <span className="text-gray-400 text-sm">{habit.time}</span>}
                </div>
                <div className="flex gap-2 items-center">
                  <motion.button
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      habit.calendar[new Date().toISOString().split('T')[0]] === 'check-in'
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-400'
                    }`}
                    onClick={() => toggleTodayCheckIn(habit)}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {habit.calendar[new Date().toISOString().split('T')[0]] === 'check-in' && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </motion.button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Habit</DialogTitle>
                      </DialogHeader>
                      <Input
                        placeholder="Habit name"
                        value={editingHabit?.name || ''}
                        onChange={(e) => setEditingHabit(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                      <Input
                        placeholder="Habit icon (emoji)"
                        value={editingHabit?.icon || ''}
                        onChange={(e) => setEditingHabit(prev => prev ? { ...prev, icon: e.target.value } : null)}
                      />
                      <Button onClick={() => editingHabit && editHabit(editingHabit)}>Save Changes</Button>
                    </DialogContent>
                  </Dialog>
                  <Button variant="ghost" size="icon" onClick={() => removeHabit(habit.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center mb-4">
                <div>
                  <div className="text-2xl font-bold">{habit.streak}</div>
                  <div className="text-gray-400 text-sm">Streak</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{habit.consistency}%</div>
                  <div className="text-gray-400 text-sm">Consistency</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{habit.checkIns}</div>
                  <div className="text-gray-400 text-sm">Check-ins</div>
                </div>
              </div>
              {renderCalendar(habit)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}