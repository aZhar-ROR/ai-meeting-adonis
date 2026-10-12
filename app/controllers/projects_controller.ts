import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import ProjectStatus from '#models/project_status'
import User from '#models/user'

export default class ProjectsController {
  async index({ view }: HttpContext) {
    const projects = await Project.query()
      .preload('creator')
      .withCount('members')
      .withCount('tasks')
      .orderBy('created_at', 'desc')
    return view.render('pages/projects/index', { projects })
  }

  async create({ view }: HttpContext) {
    const users = await User.query().orderBy('name', 'asc')
    return view.render('pages/projects/create', { users })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'description', 'status', 'createdBy'])

    if (!data.name) {
      session.flash('error', 'Project name is required.')
      return response.redirect().back()
    }

    const project = await Project.create({
      name: data.name as string,
      description: (data.description as string) || null,
      status: ((data.status as string) || 'active') as 'active' | 'archived',
      createdBy: data.createdBy ? Number(data.createdBy) : null,
    })
    await project.createDefaultStatuses()

    session.flash('success', 'Project created successfully.')
    return response.redirect().toPath('/projects')
  }

  async show({ params, view }: HttpContext) {
    const project = await Project.query()
      .where('id', params.id)
      .preload('creator')
      .preload('members')
      .preload('tasks', (q) => q.preload('assignee').orderBy('created_at', 'desc'))
      .preload('meetings', (q) => q.orderBy('created_at', 'desc'))
      .preload('statuses', (q) => q.orderBy('sort_order', 'asc'))
      .firstOrFail()

    const allUsers = await User.query().orderBy('name', 'asc')
    const memberIds = project.members.map((m) => m.id)
    const nonMembers = allUsers.filter((u) => !memberIds.includes(u.id))

    return view.render('pages/projects/show', { project, nonMembers })
  }

  async addStatus({ params, request, response, session }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    const { name, color } = request.only(['name', 'color'])

    if (!name) {
      session.flash('error', 'Status name is required.')
      return response.redirect().back()
    }

    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')

    const maxOrder = await ProjectStatus.query()
      .where('project_id', project.id)
      .max('sort_order as m')
    const sortOrder = ((maxOrder[0].$extras.m as number) ?? -1) + 1

    await ProjectStatus.create({
      projectId: project.id,
      name,
      slug: slug || `status_${sortOrder}`,
      color: color || '#94a3b8',
      sortOrder,
    })

    session.flash('success', 'Status added.')
    return response.redirect().back()
  }

  async removeStatus({ params, response, session }: HttpContext) {
    const status = await ProjectStatus.query()
      .where('id', params.statusId)
      .where('project_id', params.id)
      .firstOrFail()
    await status.delete()
    session.flash('success', 'Status removed.')
    return response.redirect().back()
  }

  async addMember({ params, request, response, session }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    const { userId } = request.only(['userId'])

    if (!userId) {
      session.flash('error', 'Please select a user to add.')
      return response.redirect().back()
    }

    await project.related('members').attach([Number(userId)])
    session.flash('success', 'Member added successfully.')
    return response.redirect().back()
  }

  async removeMember({ params, response, session }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    await project.related('members').detach([Number(params.userId)])
    session.flash('success', 'Member removed successfully.')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const project = await Project.findOrFail(params.id)
    await project.delete()
    session.flash('success', 'Project deleted successfully.')
    return response.redirect().toPath('/projects')
  }
}
