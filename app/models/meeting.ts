import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'

export default class Meeting extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare title: string
  @column() declare transcript: string
  @column() declare model: string
  @column() declare promptVersion: number
  @column() declare result: Record<string, any>
  @column() declare overallScore: number | null
  @column() declare actionItemsCount: number
  @column() declare decisionsCount: number
  @column() declare questionsCount: number
  @column() declare sentiment: string | null
  @column() declare projectId: number | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime

  @belongsTo(() => Project) declare project: BelongsTo<typeof Project>
  @hasMany(() => Task) declare tasks: HasMany<typeof Task>
}

import Project from '#models/project'
import Task from '#models/task'
