import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Tasks</h2>
            <p className="text-muted-foreground mb-4">
              Manage and prioritize your tasks
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/tasks">View Tasks</Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Settings</h2>
            <p className="text-muted-foreground mb-4">
              Configure your preferences
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </div>

          <div className="p-6 border rounded-lg bg-card">
            <h2 className="text-xl font-semibold mb-2">Profile</h2>
            <p className="text-muted-foreground mb-4">
              View and edit your profile
            </p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2 text-sm">
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

