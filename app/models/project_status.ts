import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class ProjectStatus extends BaseModel {
  static table = 'project_statuses'

  @column({ isPrimary: true }) declare id: number
  @column() declare projectId: number
  @column() declare name: string
  @column() declare slug: string
  @column() declare color: string
  @column() declare sortOrder: number
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime

  @belongsTo(() => Project) declare project: BelongsTo<typeof Project>
}

import Project from '#models/project'
