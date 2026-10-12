import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany, BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Project extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare description: string | null
  @column() declare status: 'active' | 'archived'
  @column() declare createdBy: number | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'createdBy' }) declare creator: BelongsTo<typeof User>
  @hasMany(() => Task) declare tasks: HasMany<typeof Task>
  @hasMany(() => Meeting) declare meetings: HasMany<typeof Meeting>
  @manyToMany(() => User, { pivotTable: 'project_users' }) declare members: ManyToMany<typeof User>
  @hasMany(() => ProjectStatus) declare statuses: HasMany<typeof ProjectStatus>

  static readonly DEFAULT_STATUSES = [
    { name: 'Pending',     slug: 'pending',     color: '#f59e0b', sortOrder: 0 },
    { name: 'In Progress', slug: 'in_progress',  color: '#3b82f6', sortOrder: 1 },
    { name: 'Done',        slug: 'done',         color: '#10b981', sortOrder: 2 },
  ]

  async createDefaultStatuses() {
    await ProjectStatus.createMany(
      Project.DEFAULT_STATUSES.map((s) => ({ ...s, projectId: this.id }))
    )
  }
}

import User from '#models/user'
import Task from '#models/task'
import Meeting from '#models/meeting'
import ProjectStatus from '#models/project_status'
