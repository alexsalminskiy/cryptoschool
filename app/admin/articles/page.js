'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { translations } from '@/lib/i18n'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function ArticlesManagement() {
  const router = useRouter()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteId, setDeleteId] = useState(null)
  const [language] = useState('ru')
  const t = translations[language]

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setArticles(data || [])
    } catch (error) {
      console.error('Error fetching articles:', error)
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      toast.success(t.articleDeleted)
      setArticles(articles.filter(a => a.id !== deleteId))
      setDeleteId(null)
    } catch (error) {
      console.error('Error deleting article:', error)
      toast.error(t.error)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-300 mb-2">
            {t.articlesManagement}
          </h1>
          <p className="text-slate-400">
            Управление всеми статьями платформы
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/articles/new')}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t.createArticle}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-purple-400">{t.loading}</div>
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-purple-900/50">
          <p className="text-slate-400 mb-4">Пока нет статей</p>
          <Button
            onClick={() => router.push('/admin/articles/new')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            {t.createArticle}
          </Button>
        </div>
      ) : (
        <div className="border border-purple-900/50 rounded-lg overflow-hidden bg-slate-900/50">
          <Table>
            <TableHeader>
              <TableRow className="border-purple-900/50 hover:bg-slate-800/50">
                <TableHead className="text-purple-300">{t.title}</TableHead>
                <TableHead className="text-purple-300">{t.category}</TableHead>
                <TableHead className="text-purple-300">{t.status}</TableHead>
                <TableHead className="text-purple-300 text-right">{t.views}</TableHead>
                <TableHead className="text-purple-300">{t.publishedOn}</TableHead>
                <TableHead className="text-purple-300 text-right">{t.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow
                  key={article.id}
                  className="border-purple-900/50 hover:bg-slate-800/50"
                >
                  <TableCell className="font-medium text-slate-200">
                    {article.title}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {t[article.category] || article.category}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={article.status === 'published' ? 'default' : 'secondary'}
                      className={article.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'}
                    >
                      {t[article.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-slate-400">
                    <div className="flex items-center justify-end gap-1">
                      <Eye className="h-3 w-3" />
                      {article.views || 0}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-400">
                    {format(new Date(article.created_at), 'dd.MM.yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/admin/articles/${article.id}`)}
                        className="text-purple-400 hover:text-purple-300"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteId(article.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-purple-900/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-purple-300">
              Удалить статью?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Это действие нельзя отменить. Статья будет удалена навсегда.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300">
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {t.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}