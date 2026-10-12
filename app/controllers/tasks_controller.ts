import type { HttpContext } from '@adonisjs/core/http'
import Task from '#models/task'
import User from '#models/user'
import Project from '#models/project'
import ProjectStatus from '#models/project_status'

export default class TasksController {
  async index({ view }: HttpContext) {
    const tasks = await Task.query()
      .preload('assignee')
      .preload('project')
      .orderBy('created_at', 'asc')

    const users = await User.query().orderBy('name', 'asc')
    const projects = await Project.query().orderBy('name', 'asc')

    // Load statuses per project for dynamic board columns
    const allStatuses = await ProjectStatus.query()
      .orderBy('project_id')
      .orderBy('sort_order')
    const statusesByProject: Record<number, { id: number; name: string; slug: string; color: string }[]> = {}
    for (const s of allStatuses) {
      if (!statusesByProject[s.projectId]) statusesByProject[s.projectId] = []
      statusesByProject[s.projectId].push({ id: s.id, name: s.name, slug: s.slug, color: s.color })
    }

    return view.render('pages/tasks/index', { tasks, users, projects, statusesByProject })
  }

  async create({ view, request }: HttpContext) {
    const users = await User.query().orderBy('name', 'asc')
    const projects = await Project.query().where('status', 'active').orderBy('name', 'asc')
    const defaultProjectId = request.input('project_id', null)
    return view.render('pages/tasks/create', { users, projects, defaultProjectId })
  }

  async store({ request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'description',
      'projectId',
      'assignedTo',
      'status',
      'priority',
      'dueDate',
    ])

    if (!data.title) {
      session.flash('error', 'Task title is required.')
      return response.redirect().back()
    }

    await Task.create({
      title: data.title as string,
      description: (data.description as string) || null,
      projectId: data.projectId ? Number(data.projectId) : null,
      assignedTo: data.assignedTo ? Number(data.assignedTo) : null,
      status: ((data.status as string) || 'pending') as 'pending' | 'in_progress' | 'done',
      priority: ((data.priority as string) || 'medium') as 'low' | 'medium' | 'high',
      dueDate: data.dueDate ? (data.dueDate as any) : null,
    })

    session.flash('success', 'Task created successfully.')
    return response.redirect().toPath('/tasks')
  }

  async show({ params, view }: HttpContext) {
    const task = await Task.query()
      .where('id', params.id)
      .preload('assignee')
      .preload('project')
      .preload('meeting')
      .firstOrFail()

    const users = await User.query().orderBy('name', 'asc')
    return view.render('pages/tasks/show', { task, users })
  }

  async update({ params, request, response, session }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    const data = request.only(['assignedTo', 'status', 'priority'])

    if (data.assignedTo !== undefined) {
      task.assignedTo = data.assignedTo ? Number(data.assignedTo) : null
    }
    if (data.status) {
      task.status = data.status as 'pending' | 'in_progress' | 'done'
    }
    if (data.priority) {
      task.priority = data.priority as 'low' | 'medium' | 'high'
    }

    await task.save()
    await task.load('assignee')

    if (request.accepts(['json'])) {
      return response.json({ ok: true, task })
    }

    session.flash('success', 'Task updated successfully.')
    return response.redirect().back()
  }

  async destroy({ params, response, session }: HttpContext) {
    const task = await Task.findOrFail(params.id)
    await task.delete()
    session.flash('success', 'Task deleted successfully.')
    return response.redirect().toPath('/tasks')
  }
}
