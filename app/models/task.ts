import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Task extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare description: string | null
  @column() declare meetingId: number | null
  @column() declare projectId: number | null
  @column() declare assignedTo: number | null
  @column() declare status: 'pending' | 'in_progress' | 'done'
  @column() declare priority: 'low' | 'medium' | 'high'
  @column.date() declare dueDate: DateTime | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'assignedTo' }) declare assignee: BelongsTo<typeof User>
  @belongsTo(() => Meeting) declare meeting: BelongsTo<typeof Meeting>
  @belongsTo(() => Project) declare project: BelongsTo<typeof Project>
}

import User from '#models/user'
import Meeting from '#models/meeting'
import Project from '#models/project'
