import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Project from '#models/project'
import ProjectStatus from '#models/project_status'

export default class ProjectStatusSeeder extends BaseSeeder {
  async run() {
    const projects = await Project.all()
    for (const project of projects) {
      const existing = await ProjectStatus.query().where('project_id', project.id).first()
      if (!existing) {
        await project.createDefaultStatuses()
        console.log(`Created default statuses for project: ${project.name}`)
      }
    }
  }
}
