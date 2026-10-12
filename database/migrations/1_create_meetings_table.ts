import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'meetings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.text('transcript').notNullable()
      table.string('model').defaultTo('gemini-1.5-flash')
      table.integer('prompt_version').defaultTo(3)
      table.jsonb('result').notNullable()
      table.float('overall_score').nullable()
      table.integer('action_items_count').defaultTo(0)
      table.integer('decisions_count').defaultTo(0)
      table.integer('questions_count').defaultTo(0)
      table.string('sentiment').nullable()
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
