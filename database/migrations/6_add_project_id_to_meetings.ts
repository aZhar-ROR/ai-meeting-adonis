import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'meetings'

  async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('project_id').nullable().references('id').inTable('projects').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('project_id')
    })
  }
}
