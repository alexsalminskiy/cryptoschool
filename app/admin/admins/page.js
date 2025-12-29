'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Shield, Plus, Trash2, Loader2, Eye, EyeOff, UserCog } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

export default function AdminsPage() {
  const { profile } = useAuth()
  const [admins, setAdmins] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    middle_name: ''
  })

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      toast.error('Ошибка загрузки администраторов')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) {
      toast.error('Заполните email и пароль')
      return
    }

    if (newAdmin.password.length < 6) {
      toast.error('Пароль должен быть минимум 6 символов')
      return
    }

    setSaving(true)
    try {
      // 1. Создаём пользователя в Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
        options: {
          data: {
            first_name: newAdmin.first_name,
            last_name: newAdmin.last_name
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // 2. Создаём профиль с ролью admin
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: newAdmin.email,
            role: 'admin',
            approved: true,
            first_name: newAdmin.first_name || null,
            last_name: newAdmin.last_name || null,
            middle_name: newAdmin.middle_name || null
          }, {
            onConflict: 'id'
          })

        if (profileError) throw profileError
      }

      toast.success('Администратор создан!')
      setShowAddDialog(false)
      setNewAdmin({ email: '', password: '', first_name: '', last_name: '', middle_name: '' })
      fetchAdmins()
    } catch (error) {
      console.error('Error creating admin:', error)
      if (error.message?.includes('already registered')) {
        toast.error('Пользователь с таким email уже существует')
      } else {
        toast.error('Ошибка создания администратора: ' + error.message)
      }
    } finally {
      setSaving(false)
    }
  }

  // Понизить до пользователя (убрать права админа)
  const handleDemoteAdmin = async (admin) => {
    if (admin.id === profile?.id) {
      toast.error('Нельзя убрать права у себя')
      return
    }

    if (!confirm(`Убрать права администратора у ${admin.email}? Пользователь останется в системе.`)) return

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'user' })
        .eq('id', admin.id)

      if (error) throw error

      toast.success('Права администратора убраны')
      fetchAdmins()
    } catch (error) {
      toast.error('Ошибка')
      console.error(error)
    }
  }

  // Полностью удалить администратора
  const handleDeleteAdmin = async (admin) => {
    if (admin.id === profile?.id) {
      toast.error('Нельзя удалить свой аккаунт')
      return
    }

    if (!confirm(`ПОЛНОСТЬЮ удалить администратора ${admin.email}? Это действие нельзя отменить!`)) return

    try {
      // Удаляем из profiles
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', admin.id)

      if (error) throw error

      toast.success('Администратор удалён')
      fetchAdmins()
    } catch (error) {
      toast.error('Ошибка удаления')
      console.error(error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Администраторы
          </h1>
          <p className="text-slate-400 mt-1">Управление администраторами системы</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Добавить админа
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-purple-900/50 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Всего администраторов</CardDescription>
            <CardTitle className="text-3xl text-purple-300">{admins.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-purple-900/50 bg-slate-900/50">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400">Текущий админ</CardDescription>
            <CardTitle className="text-lg text-purple-300">{profile?.email}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Admins List */}
      <Card className="border-purple-900/50 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-purple-300">Список администраторов</CardTitle>
        </CardHeader>
        <CardContent>
          {admins.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Нет администраторов</p>
          ) : (
            <div className="space-y-3">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                      <UserCog className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-200">
                        {admin.last_name || admin.first_name 
                          ? `${admin.last_name || ''} ${admin.first_name || ''} ${admin.middle_name || ''}`.trim()
                          : admin.email
                        }
                      </div>
                      <div className="text-sm text-slate-400">{admin.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-purple-500 text-purple-400">
                      Админ
                    </Badge>
                    {admin.id === profile?.id ? (
                      <Badge variant="secondary" className="bg-green-900/50 text-green-400">
                        Вы
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAdmin(admin)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-slate-900 border-purple-900/50">
          <DialogHeader>
            <DialogTitle className="text-purple-300">Добавить администратора</DialogTitle>
            <DialogDescription>
              Создайте нового администратора системы
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email *</Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@example.com"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="admin-password">Пароль *</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Минимум 6 символов"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="bg-slate-800 border-slate-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="admin-lastname">Фамилия</Label>
                <Input
                  id="admin-lastname"
                  placeholder="Иванов"
                  value={newAdmin.last_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-firstname">Имя</Label>
                <Input
                  id="admin-firstname"
                  placeholder="Иван"
                  value={newAdmin.first_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-middlename">Отчество</Label>
              <Input
                id="admin-middlename"
                placeholder="Иванович"
                value={newAdmin.middle_name}
                onChange={(e) => setNewAdmin({ ...newAdmin, middle_name: e.target.value })}
                className="bg-slate-800 border-slate-700"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Отмена
            </Button>
            <Button onClick={handleAddAdmin} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
