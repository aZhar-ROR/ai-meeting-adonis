import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, manyToMany } from '@adonisjs/lucid/orm'
import type { HasMany, ManyToMany } from '@adonisjs/lucid/types/relations'

export default class User extends BaseModel {
  @column({ isPrimary: true }) declare id: number
  @column() declare name: string
  @column() declare email: string
  @column() declare role: 'admin' | 'manager' | 'developer'
  @column() declare avatarInitials: string | null
  @column.dateTime({ autoCreate: true }) declare createdAt: DateTime
  @column.dateTime({ autoCreate: true, autoUpdate: true }) declare updatedAt: DateTime

  @hasMany(() => Task, { foreignKey: 'assignedTo' }) declare tasks: HasMany<typeof Task>
  @manyToMany(() => Project, { pivotTable: 'project_users' }) declare projects: ManyToMany<typeof Project>
}

import Task from '#models/task'
import Project from '#models/project'
