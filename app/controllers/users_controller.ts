import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'

export default class UsersController {
  async index({ view }: HttpContext) {
    const users = await User.query().orderBy('name', 'asc').withCount('tasks')
    return view.render('pages/users/index', { users })
  }

  async create({ view }: HttpContext) {
    return view.render('pages/users/create')
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'email', 'role'])

    if (!data.name || !data.email) {
      session.flash('error', 'Name and email are required.')
      return response.redirect().back()
    }

    const existingUser = await User.findBy('email', data.email)
    if (existingUser) {
      session.flash('error', 'A user with this email already exists.')
      return response.redirect().back()
    }

    const validRoles = ['admin', 'manager', 'developer']
    if (data.role && !validRoles.includes(data.role)) {
      session.flash('error', 'Invalid role selected.')
      return response.redirect().back()
    }

    const nameParts = (data.name as string).trim().split(/\s+/)
    let initials = nameParts[0].charAt(0).toUpperCase()
    if (nameParts.length > 1) {
      initials += nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    } else {
      initials = (data.name as string).substring(0, 2).toUpperCase()
    }

    await User.create({
      name: data.name as string,
      email: data.email as string,
      role: (data.role || 'developer') as 'admin' | 'manager' | 'developer',
      avatarInitials: initials,
    })

    session.flash('success', 'User created successfully.')
    return response.redirect().toPath('/users')
  }

  async destroy({ params, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    await user.delete()
    session.flash('success', 'User deleted successfully.')
    return response.redirect().toPath('/users')
  }
}
