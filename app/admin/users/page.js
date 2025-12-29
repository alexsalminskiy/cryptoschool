'use client'

import { useEffect, useState } from 'react'
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
import { Check, X, Search, Plus, Trash2, Loader2, Edit, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function UsersManagement() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Модальное окно создания
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    middleName: '',
    role: 'user'
  })
  
  // Модальное окно редактирования
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  
  // Модальное окно удаления
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Ошибка загрузки')
      }
      
      setUsers(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Ошибка загрузки')
    } finally {
      setLoading(false)
    }
  }

  // Создать пользователя/админа
  const handleCreate = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Заполните все обязательные поля')
      return
    }

    if (newUser.password.length < 6) {
      toast.error('Пароль минимум 6 символов')
      return
    }

    setCreating(true)
    try {
      // Регистрация в Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email.trim(),
        password: newUser.password
      })

      if (authError) throw authError

      // Создаём профиль
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: newUser.email.trim(),
          first_name: newUser.firstName.trim(),
          last_name: newUser.lastName.trim(),
          middle_name: newUser.middleName.trim() || null,
          role: newUser.role,
          approved: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' })

        if (profileError) throw profileError
      }

      toast.success(newUser.role === 'admin' ? 'Админ создан!' : 'Пользователь создан!')
      setShowCreateModal(false)
      setNewUser({ email: '', password: '', firstName: '', lastName: '', middleName: '', role: 'user' })
      fetchUsers()
    } catch (error) {
      console.error('Error:', error)
      if (error.message?.includes('already registered')) {
        toast.error('Этот email уже зарегистрирован')
      } else {
        toast.error(error.message || 'Ошибка создания')
      }
    } finally {
      setCreating(false)
    }
  }

  // Редактировать пользователя
  const handleEdit = (user) => {
    setEditingUser({
      id: user.id,
      email: user.email,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      middle_name: user.middle_name || '',
      role: user.role,
      approved: user.approved
    })
    setShowEditModal(true)
  }

  // Сохранить изменения
  const handleSaveEdit = async () => {
    if (!editingUser) return

    setSaving(true)
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          middle_name: editingUser.middle_name || null,
          role: editingUser.role,
          approved: editingUser.approved
        })
      })

      if (!response.ok) throw new Error('Ошибка сохранения')

      toast.success('Сохранено!')
      setShowEditModal(false)
      fetchUsers()
    } catch (error) {
      toast.error('Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  // Одобрить
  const handleApprove = async (userId) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, approved: true })
      })
      
      if (!response.ok) throw new Error('Ошибка')
      
      toast.success('Одобрен!')
      setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u))
    } catch (error) {
      toast.error('Ошибка')
    }
  }

  // Закрыть доступ
  const handleBlock = async (userId) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, approved: false })
      })
      
      if (!response.ok) throw new Error('Ошибка')
      
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
      const response = await fetch(`/api/users?id=${userToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Ошибка удаления')

      toast.success('Удалён')
      setUsers(users.filter(u => u.id !== userToDelete.id))
      setShowDeleteModal(false)
      setUserToDelete(null)
    } catch (error) {
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  // Сделать админом / убрать права админа
  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, role: newRole })
      })
      
      if (!response.ok) throw new Error('Ошибка')
      
      toast.success(newRole === 'admin' ? 'Назначен админом!' : 'Права админа сняты')
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      toast.error('Ошибка')
    }
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-purple-300">Управление пользователями</h1>
        <Button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" /> Создать
        </Button>
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

      {/* Поиск */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Поиск по email или ФИО..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" className="border-purple-600">
          Обновить
        </Button>
      </div>

      {/* Список */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-slate-400">Нет пользователей</div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">{getFullName(user)}</span>
                  {user.role === 'admin' && <Badge className="bg-blue-600">Админ</Badge>}
                  {user.id === currentUser?.id && <Badge className="bg-purple-600">Вы</Badge>}
                </div>
                <p className="text-sm text-slate-400">{user.email}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Статус */}
                {user.role !== 'admin' && (
                  user.approved ? (
                    <Badge className="bg-green-600">Доступ открыт</Badge>
                  ) : (
                    <Badge className="bg-yellow-600">Ожидает</Badge>
                  )
                )}
                
                {/* Действия */}
                {user.id !== currentUser?.id && (
                  <div className="flex gap-1 ml-2">
                    {/* Одобрить/Заблокировать */}
                    {user.role !== 'admin' && (
                      user.approved ? (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleBlock(user.id)}
                          className="text-yellow-400 hover:bg-yellow-900/20"
                          title="Закрыть доступ"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleApprove(user.id)}
                          className="text-green-400 hover:bg-green-900/20"
                          title="Одобрить"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )
                    )}
                    
                    {/* Сделать/убрать админа */}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleToggleAdmin(user.id, user.role)}
                      className={user.role === 'admin' ? "text-yellow-400 hover:bg-yellow-900/20" : "text-blue-400 hover:bg-blue-900/20"}
                      title={user.role === 'admin' ? "Снять права админа" : "Сделать админом"}
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
                    
                    {/* Редактировать */}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleEdit(user)}
                      className="text-purple-400 hover:bg-purple-900/20"
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    {/* Удалить */}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => { setUserToDelete(user); setShowDeleteModal(true) }}
                      className="text-red-400 hover:bg-red-900/20"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно создания */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="bg-slate-900 border-purple-900/50">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Создать пользователя</DialogTitle>
            <DialogDescription>Заполните данные нового пользователя</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
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
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Отмена</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-purple-600">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Модальное окно редактирования */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="bg-slate-900 border-purple-900/50">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Редактировать пользователя</DialogTitle>
            <DialogDescription>{editingUser?.email}</DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Фамилия</Label>
                  <Input 
                    value={editingUser.last_name} 
                    onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})} 
                    className="bg-slate-800 border-slate-700 mt-1"
                  />
                </div>
                <div>
                  <Label>Имя</Label>
                  <Input 
                    value={editingUser.first_name} 
                    onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})} 
                    className="bg-slate-800 border-slate-700 mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Отчество</Label>
                <Input 
                  value={editingUser.middle_name} 
                  onChange={(e) => setEditingUser({...editingUser, middle_name: e.target.value})} 
                  className="bg-slate-800 border-slate-700 mt-1"
                />
              </div>
              <div>
                <Label>Роль</Label>
                <Select value={editingUser.role} onValueChange={(v) => setEditingUser({...editingUser, role: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Пользователь</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Статус доступа</Label>
                <Select 
                  value={editingUser.approved ? 'approved' : 'pending'} 
                  onValueChange={(v) => setEditingUser({...editingUser, approved: v === 'approved'})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">Доступ открыт</SelectItem>
                    <SelectItem value="pending">Доступ закрыт</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Отмена</Button>
            <Button onClick={handleSaveEdit} disabled={saving} className="bg-purple-600">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Сохранить
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
              <strong>{getFullName(userToDelete || {})}</strong><br/>
              {userToDelete?.email}<br/><br/>
              Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Отмена</Button>
            <Button onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
