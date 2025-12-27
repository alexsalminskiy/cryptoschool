'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, X, Search, UserCheck, UserX, Users, Plus, Trash2, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(true)
  
  // Модальные окна
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({ email: '', password: '', firstName: '', lastName: '', middleName: '' })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Быстрая загрузка пользователей
  const fetchUsers = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, middle_name, role, approved, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Загрузка при монтировании
  useEffect(() => {
    fetchUsers(true)
  }, [fetchUsers])

  // Автоматическое обновление каждые 5 секунд
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => fetchUsers(false), 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchUsers])

  // Одобрить
  const handleApprove = async (userId) => {
    try {
      await supabase.from('profiles').update({ approved: true, approved_at: new Date().toISOString() }).eq('id', userId)
      toast.success('Пользователь одобрен!')
      setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u))
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  // Закрыть доступ
  const handleReject = async (userId) => {
    try {
      await supabase.from('profiles').update({ approved: false }).eq('id', userId)
      toast.success('Доступ закрыт')
      setUsers(users.map(u => u.id === userId ? { ...u, approved: false } : u))
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  // Удалить
  const handleDelete = async () => {
    if (!userToDelete) return
    setDeleting(true)
    try {
      await supabase.from('profiles').delete().eq('id', userToDelete.id)
      toast.success('Удалён')
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      toast.error('Ошибка')
    } finally {
      setDeleting(false)
    }
  }

  // Создать пользователя
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Заполните все поля')
      return
    }
    setCreating(true)
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password
      })
      if (authError) throw authError

      if (authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: newUser.email,
          first_name: newUser.firstName,
          last_name: newUser.lastName,
          middle_name: newUser.middleName || null,
          role: 'user',
          approved: true
        }, { onConflict: 'id' })
      }

      toast.success('Пользователь создан!')
      setShowCreateModal(false)
      setNewUser({ email: '', password: '', firstName: '', lastName: '', middleName: '' })
      fetchUsers(false)
    } catch (error) {
      toast.error(error.message || 'Ошибка')
    } finally {
      setCreating(false)
    }
  }

  // Фильтрация
  const filteredUsers = users.filter(user => {
    const search = searchTerm.toLowerCase()
    const matches = user.email?.toLowerCase().includes(search) || 
                   user.first_name?.toLowerCase().includes(search) ||
                   user.last_name?.toLowerCase().includes(search)
    
    if (filterStatus === 'pending') return matches && !user.approved && user.role !== 'admin'
    if (filterStatus === 'approved') return matches && user.approved && user.role !== 'admin'
    if (filterStatus === 'admin') return matches && user.role === 'admin'
    return matches
  })

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.approved && u.role !== 'admin').length,
    approved: users.filter(u => u.approved && u.role !== 'admin').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  const getFullName = (u) => [u.last_name, u.first_name, u.middle_name].filter(Boolean).join(' ') || '—'

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-300">Управление пользователями</h1>
          <p className="text-sm text-slate-400">Управление доступом к платформе</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'border-green-500 text-green-400' : 'border-slate-600'}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Авто' : 'Выкл'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Создать
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 grid-cols-4 mb-4">
        <div className="rounded-lg border border-purple-900/50 bg-slate-900/50 p-3 cursor-pointer" onClick={() => setFilterStatus('all')}>
          <p className="text-xs text-slate-400">Всего</p>
          <p className="text-xl font-bold text-purple-300">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-yellow-900/50 bg-slate-900/50 p-3 cursor-pointer" onClick={() => setFilterStatus('pending')}>
          <p className="text-xs text-slate-400">Ожидают</p>
          <p className="text-xl font-bold text-yellow-300">{stats.pending}</p>
        </div>
        <div className="rounded-lg border border-green-900/50 bg-slate-900/50 p-3 cursor-pointer" onClick={() => setFilterStatus('approved')}>
          <p className="text-xs text-slate-400">Одобрено</p>
          <p className="text-xl font-bold text-green-300">{stats.approved}</p>
        </div>
        <div className="rounded-lg border border-blue-900/50 bg-slate-900/50 p-3">
          <p className="text-xs text-slate-400">Админы</p>
          <p className="text-xl font-bold text-blue-300">{stats.admins}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 h-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px] bg-slate-800 border-slate-700 h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="pending">Ожидают</SelectItem>
            <SelectItem value="approved">Одобрены</SelectItem>
            <SelectItem value="admin">Админы</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-purple-400 mx-auto" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8 text-slate-400">Нет пользователей</div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-purple-900/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-200 truncate">{getFullName(user)}</span>
                  {user.id === currentUser?.id && <Badge className="bg-purple-600 text-xs">Вы</Badge>}
                </div>
                <p className="text-sm text-slate-400 truncate">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {user.role === 'admin' ? (
                  <Badge className="bg-blue-600">Админ</Badge>
                ) : user.approved ? (
                  <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" />Одобрен</Badge>
                ) : (
                  <Badge className="bg-yellow-600"><X className="h-3 w-3 mr-1" />Ожидает</Badge>
                )}
                
                {user.role !== 'admin' && user.id !== currentUser?.id && (
                  <div className="flex gap-1">
                    {!user.approved ? (
                      <Button size="sm" variant="ghost" onClick={() => handleApprove(user.id)} className="h-8 text-green-400 hover:bg-green-900/20">
                        <Check className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="ghost" onClick={() => handleReject(user.id)} className="h-8 text-yellow-400 hover:bg-yellow-900/20">
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => { setUserToDelete(user); setShowDeleteModal(true) }} className="h-8 text-red-400 hover:bg-red-900/20">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-purple-900/50">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Создать пользователя</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-2">
              <Input placeholder="Фамилия *" value={newUser.lastName} onChange={(e) => setNewUser({...newUser, lastName: e.target.value})} className="bg-slate-800 border-slate-700" />
              <Input placeholder="Имя *" value={newUser.firstName} onChange={(e) => setNewUser({...newUser, firstName: e.target.value})} className="bg-slate-800 border-slate-700" />
            </div>
            <Input placeholder="Отчество" value={newUser.middleName} onChange={(e) => setNewUser({...newUser, middleName: e.target.value})} className="bg-slate-800 border-slate-700" />
            <Input type="email" placeholder="Email *" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="bg-slate-800 border-slate-700" />
            <Input type="password" placeholder="Пароль *" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="bg-slate-800 border-slate-700" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Отмена</Button>
            <Button onClick={handleCreateUser} disabled={creating} className="bg-purple-600">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-slate-900 border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-red-400">Удалить?</DialogTitle>
            <DialogDescription>{userToDelete?.email}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
