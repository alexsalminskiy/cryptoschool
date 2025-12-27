'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import { Check, X, Search, UserCheck, UserX, Users, Plus, Trash2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { translations } from '@/lib/i18n'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [language] = useState('ru')
  const t = translations[language]
  
  // Модальное окно создания пользователя
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: ''
  })
  
  // Модальное окно удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Fetched users:', data)
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Ошибка загрузки пользователей')
    } finally {
      setLoading(false)
    }
  }

  // Одобрить пользователя
  const handleApprove = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approved: true,
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Пользователь одобрен!')
      setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u))
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error('Ошибка одобрения')
    }
  }

  // Отклонить/заблокировать пользователя
  const handleReject = async (userId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          approved: false,
          approved_at: null,
          approved_by: null
        })
        .eq('id', userId)

      if (error) throw error

      toast.success('Доступ закрыт')
      setUsers(users.map(u => u.id === userId ? { ...u, approved: false } : u))
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error('Ошибка')
    }
  }

  // Удалить пользователя
  const handleDelete = async () => {
    if (!userToDelete) return
    
    setDeleting(true)
    try {
      // Удаляем профиль
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userToDelete.id)

      if (error) throw error

      toast.success('Пользователь удалён')
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  // Создать нового пользователя (админом)
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Заполните все обязательные поля')
      return
    }

    setCreating(true)
    try {
      // 1. Создаём пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
        options: {
          data: {
            first_name: newUser.firstName,
            last_name: newUser.lastName
          }
        }
      })

      if (authError) throw authError

      // 2. Создаём профиль (сразу одобренный)
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: newUser.email,
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            middle_name: newUser.middleName || null,
            role: 'user',
            approved: true,
            approved_at: new Date().toISOString(),
            approved_by: currentUser?.id
          }, {
            onConflict: 'id'
          })

        if (profileError) {
          console.error('Profile error:', profileError)
        }
      }

      toast.success('Пользователь создан и одобрен!')
      setShowCreateModal(false)
      setNewUser({ email: '', password: '', firstName: '', lastName: '', middleName: '' })
      fetchUsers()
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error(error.message || 'Ошибка создания')
    } finally {
      setCreating(false)
    }
  }

  // Фильтрация пользователей
  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    
    if (filterStatus === 'pending') {
      return matchesSearch && !user.approved && user.role !== 'admin'
    } else if (filterStatus === 'approved') {
      return matchesSearch && user.approved && user.role !== 'admin'
    } else if (filterStatus === 'blocked') {
      return matchesSearch && !user.approved && user.role !== 'admin'
    } else if (filterStatus === 'admin') {
      return matchesSearch && user.role === 'admin'
    }
    
    return matchesSearch
  })

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.approved && u.role !== 'admin').length,
    approved: users.filter(u => u.approved && u.role !== 'admin').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  // Полное имя пользователя
  const getFullName = (user) => {
    const parts = [user.last_name, user.first_name, user.middle_name].filter(Boolean)
    return parts.length > 0 ? parts.join(' ') : '—'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-300 mb-2">
            {t.usersManagement}
          </h1>
          <p className="text-slate-400">
            Управление доступом пользователей к платформе
          </p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Создать пользователя
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-lg border border-purple-900/50 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Всего</p>
              <p className="text-2xl font-bold text-purple-300">{stats.total}</p>
            </div>
            <Users className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="rounded-lg border border-yellow-900/50 bg-slate-900/50 p-4 cursor-pointer hover:bg-slate-800/50" onClick={() => setFilterStatus('pending')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ожидают</p>
              <p className="text-2xl font-bold text-yellow-300">{stats.pending}</p>
            </div>
            <UserX className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="rounded-lg border border-green-900/50 bg-slate-900/50 p-4 cursor-pointer hover:bg-slate-800/50" onClick={() => setFilterStatus('approved')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Одобрено</p>
              <p className="text-2xl font-bold text-green-300">{stats.approved}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="rounded-lg border border-blue-900/50 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Админы</p>
              <p className="text-2xl font-bold text-blue-300">{stats.admins}</p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Поиск по email или имени..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[200px] bg-slate-800 border-slate-700">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все пользователи</SelectItem>
            <SelectItem value="pending">Ожидают одобрения</SelectItem>
            <SelectItem value="approved">Одобренные</SelectItem>
            <SelectItem value="admin">Администраторы</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={fetchUsers} className="border-purple-600 text-purple-400">
          Обновить
        </Button>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400 mx-auto" />
          <p className="text-purple-400 mt-2">Загрузка...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-purple-900/50">
          <p className="text-slate-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Пользователи не найдены' 
              : 'Пока нет зарегистрированных пользователей'}
          </p>
        </div>
      ) : (
        <div className="border border-purple-900/50 rounded-lg overflow-hidden bg-slate-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-900/50 hover:bg-slate-800/50">
                <TableHead className="text-purple-300">ФИО</TableHead>
                <TableHead className="text-purple-300">Email</TableHead>
                <TableHead className="text-purple-300">{t.status}</TableHead>
                <TableHead className="text-purple-300">Дата регистрации</TableHead>
                <TableHead className="text-purple-300 text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="border-purple-900/50 hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium text-slate-200">
                    {getFullName(user)}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    {user.email}
                    {user.id === currentUser?.id && (
                      <Badge className="ml-2 bg-purple-600">Вы</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge className="bg-blue-600">Администратор</Badge>
                    ) : user.approved ? (
                      <Badge className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Доступ открыт
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600">
                        <X className="h-3 w-3 mr-1" />
                        Ожидает
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {user.created_at ? format(new Date(user.created_at), 'dd.MM.yyyy HH:mm') : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== 'admin' && user.id !== currentUser?.id && (
                      <div className="flex items-center justify-end gap-2">
                        {!user.approved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(user.id)}
                            className="text-green-400 hover:text-green-300 hover:bg-green-900/20"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Одобрить
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(user.id)}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Закрыть доступ
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Модальное окно создания пользователя */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-purple-900/50">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Создать пользователя</DialogTitle>
            <DialogDescription>
              Пользователь будет сразу одобрен и получит доступ к материалам
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Фамилия *</Label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  className="bg-slate-800 border-slate-700 mt-1"
                  placeholder="Иванов"
                />
              </div>
              <div>
                <Label>Имя *</Label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  className="bg-slate-800 border-slate-700 mt-1"
                  placeholder="Иван"
                />
              </div>
            </div>
            <div>
              <Label>Отчество</Label>
              <Input
                value={newUser.middleName}
                onChange={(e) => setNewUser({...newUser, middleName: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="Иванович"
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="user@email.com"
              />
            </div>
            <div>
              <Label>Пароль *</Label>
              <Input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                className="bg-slate-800 border-slate-700 mt-1"
                placeholder="Минимум 6 символов"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleCreateUser} 
              disabled={creating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {creating ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно удаления */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-slate-900 border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-red-400">Удалить пользователя?</DialogTitle>
            <DialogDescription>
              Пользователь <strong>{userToDelete?.email}</strong> будет удалён и потеряет доступ к платформе. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Отмена
            </Button>
            <Button 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              {deleting ? 'Удаление...' : 'Удалить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
