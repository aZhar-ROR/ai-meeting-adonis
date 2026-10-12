import Project from '#models/project'
import ProjectStatus from '#models/project_status'

const projects = await Project.all()
for (const p of projects) {
  const exists = await ProjectStatus.query().where('project_id', p.id).first()
  if (!exists) await p.createDefaultStatuses()
}
const rows = await ProjectStatus.query().orderBy('project_id').orderBy('sort_order')
console.log('Total statuses:', rows.length)
rows.forEach((r) => console.log(`  Project ${r.projectId}: ${r.name} (${r.slug})`))
process.exit(0)
