'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Check, X, Search, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Загрузка пользователей
  const fetchUsers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Fetching users...')
      
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Result:', { data, error: fetchError })

      if (fetchError) {
        setError(fetchError.message)
        toast.error('Ошибка: ' + fetchError.message)
        return
      }

      setUsers(data || [])
      console.log('Users loaded:', data?.length)
    } catch (err) {
      console.error('Error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Одобрить пользователя
  const handleApprove = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: true })
      .eq('id', userId)

    if (error) {
      toast.error('Ошибка')
      return
    }
    
    toast.success('Одобрен!')
    setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u))
  }

  // Закрыть доступ
  const handleReject = async (userId) => {
    const { error } = await supabase
      .from('profiles')
      .update({ approved: false })
      .eq('id', userId)

    if (error) {
      toast.error('Ошибка')
      return
    }
    
    toast.success('Доступ закрыт')
    setUsers(users.map(u => u.id === userId ? { ...u, approved: false } : u))
  }

  // Удалить
  const handleDelete = async (userId, email) => {
    if (!confirm(`Удалить пользователя ${email}?`)) return
    
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (error) {
      toast.error('Ошибка удаления')
      return
    }
    
    toast.success('Удалён')
    setUsers(users.filter(u => u.id !== userId))
  }

  // Фильтрация
  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Статистика
  const stats = {
    total: users.length,
    pending: users.filter(u => !u.approved && u.role !== 'admin').length,
    approved: users.filter(u => u.approved && u.role !== 'admin').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  const getFullName = (u) => {
    const parts = [u.last_name, u.first_name, u.middle_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : 'Имя не указано'
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-purple-300">Управление пользователями</h1>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="p-4 rounded-lg bg-slate-800 border border-purple-900/50">
          <p className="text-sm text-slate-400">Всего</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800 border border-yellow-900/50">
          <p className="text-sm text-slate-400">Ожидают</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800 border border-green-900/50">
          <p className="text-sm text-slate-400">Одобрено</p>
          <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
        </div>
        <div className="p-4 rounded-lg bg-slate-800 border border-blue-900/50">
          <p className="text-sm text-slate-400">Админы</p>
          <p className="text-2xl font-bold text-blue-400">{stats.admins}</p>
        </div>
      </div>

      {/* Поиск и обновление */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" className="border-purple-600">
          Обновить
        </Button>
      </div>

      {/* Ошибка */}
      {error && (
        <div className="p-4 mb-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
          Ошибка: {error}
        </div>
      )}

      {/* Загрузка */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <span className="ml-2 text-purple-400">Загрузка...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Нет пользователей
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{getFullName(user)}</span>
                  {user.role === 'admin' && <Badge className="bg-blue-600">Админ</Badge>}
                  {user.id === currentUser?.id && <Badge className="bg-purple-600">Вы</Badge>}
                </div>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {user.role !== 'admin' && (
                  <>
                    {user.approved ? (
                      <>
                        <Badge className="bg-green-600">Доступ открыт</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleReject(user.id)}
                          className="text-yellow-400 hover:bg-yellow-900/20"
                        >
                          <X className="h-4 w-4 mr-1" /> Закрыть
                        </Button>
                      </>
                    ) : (
                      <>
                        <Badge className="bg-yellow-600">Ожидает</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleApprove(user.id)}
                          className="text-green-400 hover:bg-green-900/20"
                        >
                          <Check className="h-4 w-4 mr-1" /> Одобрить
                        </Button>
                      </>
                    )}
                    {user.id !== currentUser?.id && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(user.id, user.email)}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
