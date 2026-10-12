import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tasks'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.integer('meeting_id').nullable().references('id').inTable('meetings').onDelete('SET NULL')
      table.integer('project_id').nullable().references('id').inTable('projects').onDelete('SET NULL')
      table.integer('assigned_to').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('status').notNullable().defaultTo('pending')
      table.string('priority').notNullable().defaultTo('medium')
      table.date('due_date').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
