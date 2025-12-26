'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, X, Search, UserCheck, UserX, Users } from 'lucide-react'
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

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

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

      toast.success(t.userApproved)
      setUsers(users.map(u => u.id === userId ? { ...u, approved: true } : u))
    } catch (error) {
      console.error('Error approving user:', error)
      toast.error(t.error)
    }
  }

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

      toast.success(t.userRejected)
      setUsers(users.map(u => u.id === userId ? { ...u, approved: false } : u))
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast.error(t.error)
    }
  }

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'pending') {
      return matchesSearch && !user.approved && user.role !== 'admin'
    } else if (filterStatus === 'approved') {
      return matchesSearch && (user.approved || user.role === 'admin')
    } else if (filterStatus === 'admin') {
      return matchesSearch && user.role === 'admin'
    }
    
    return matchesSearch
  })

  const stats = {
    total: users.length,
    pending: users.filter(u => !u.approved && u.role !== 'admin').length,
    approved: users.filter(u => u.approved || u.role === 'admin').length,
    admins: users.filter(u => u.role === 'admin').length
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-300 mb-2">
          {t.usersManagement}
        </h1>
        <p className="text-slate-400">
          Управление доступом пользователей к платформе
        </p>
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
        <div className="rounded-lg border border-yellow-900/50 bg-slate-900/50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Ожидают</p>
              <p className="text-2xl font-bold text-yellow-300">{stats.pending}</p>
            </div>
            <UserX className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="rounded-lg border border-green-900/50 bg-slate-900/50 p-4">
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
            placeholder="Поиск по email..."
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
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="text-purple-400">{t.loading}</div>
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
                <TableHead className="text-purple-300">Email</TableHead>
                <TableHead className="text-purple-300">{t.role}</TableHead>
                <TableHead className="text-purple-300">{t.status}</TableHead>
                <TableHead className="text-purple-300">{t.registeredOn}</TableHead>
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
                    {user.email}
                    {user.id === currentUser?.id && (
                      <Badge className="ml-2 bg-purple-600">Вы</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={user.role === 'admin' ? 'bg-blue-600' : 'bg-slate-600'}
                    >
                      {user.role === 'admin' ? 'Admin' : 'User'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge className="bg-blue-600">
                        Администратор
                      </Badge>
                    ) : user.approved ? (
                      <Badge className="bg-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        {t.approved}
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600">
                        <X className="h-3 w-3 mr-1" />
                        {t.pending}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm')}
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
                            {t.approve}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(user.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <X className="h-4 w-4 mr-1" />
                            {t.reject}
                          </Button>
                        )}
                      </div>
                    )}
                    {user.role === 'admin' && (
                      <span className="text-xs text-slate-500">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function useState(initialValue) {
  const [value, setValue] = require('react').useState(initialValue)
  return [value, setValue]
}
