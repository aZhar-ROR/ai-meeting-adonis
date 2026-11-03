import type { HttpContext } from '@adonisjs/core/http'
import Meeting from '#models/meeting'
import User from '#models/user'
import Task from '#models/task'
import Project from '#models/project'
import GeminiService from '#services/gemini_service'
import { DateTime } from 'luxon'

function parseDeadline(deadline: string | null | undefined): DateTime | null {
  if (!deadline || ['tbd', 'n/a', 'none', ''].includes((deadline || '').toLowerCase().trim())) {
    return null
  }
  // Try parsing as-is first
  const formats = [
    'MMMM d',        // November 14
    'MMMM do',       // November 14th (ordinal)
    'MMM d',         // Nov 14
    'MMMM d, yyyy',  // November 14, 2026
    'yyyy-MM-dd',    // 2026-11-14
    'MM/dd/yyyy',    // 11/14/2026
  ]
  // Strip ordinal suffixes: 14th → 14, 1st → 1
  const cleaned = deadline.replace(/(\d+)(st|nd|rd|th)/gi, '$1')
  const year = new Date().getFullYear()
  for (const fmt of formats) {
    const dt = DateTime.fromFormat(cleaned, fmt, { locale: 'en' })
    if (dt.isValid) {
      return dt.year < 2000 ? dt.set({ year }) : dt
    }
  }
  return null
}

export default class MeetingsController {
  async index({ view }: HttpContext) {
    return view.render('pages/home')
  }

  async history({ view }: HttpContext) {
    const meetings = await Meeting.query()
      .select(
        'id',
        'title',
        'model',
        'sentiment',
        'action_items_count',
        'decisions_count',
        'questions_count',
        'overall_score',
        'created_at'
      )
      .orderBy('created_at', 'desc')

    return view.render('pages/history', { meetings })
  }

  async show({ params, view, response }: HttpContext) {
    const meeting = await Meeting.find(params.id)

    if (!meeting) {
      return response.redirect('/history')
    }

    return view.render('pages/show', { meeting })
  }

  async analyze({ request, response, session }: HttpContext) {
    const transcript = request.input('transcript', '').trim()
    const model = request.input('model', 'gemini-2.5-flash')
    const promptVersion = parseInt(request.input('prompt_version', '3'), 10)

    if (!transcript) {
      session.flash('error', 'Transcript is required.')
      return response.redirect('back')
    }

    try {
      const geminiService = new GeminiService()
      const result = await geminiService.analyze(transcript, model, promptVersion)

      const overallScore = Math.round(
        (result.summary ? 20 : 0) +
          (result.key_decisions?.length ? 20 : 0) +
          (result.action_items?.length ? 20 : 0) +
          ((result.action_items?.filter((a: any) => a.owner && a.owner !== 'TBD').length /
            Math.max(result.action_items?.length, 1)) *
            20) +
          (result.key_decisions?.every((d: any) => d.decision.split(' ').length > 5) ? 20 : 10)
      )

      // Auto-match project by name extracted from transcript
      let projectId: number | null = null
      const extractedProject: string = (result.project_name || '').trim().toLowerCase()
      if (extractedProject) {
        const projects = await Project.all()
        const matched = projects.find((p) => {
          const pName = p.name.toLowerCase()
          return pName.includes(extractedProject) || extractedProject.includes(pName)
        })
        if (matched) projectId = matched.id
      }

      const meeting = await Meeting.create({
        title: result.meeting_title || 'Untitled Meeting',
        transcript,
        model,
        promptVersion,
        result,
        overallScore,
        actionItemsCount: result.action_items?.length || 0,
        decisionsCount: result.key_decisions?.length || 0,
        questionsCount: result.open_questions?.length || 0,
        sentiment: result.sentiment || null,
        projectId,
      })

      // Auto-create tasks from action items, matching owner names to users
      const actionItems: any[] = result.action_items || []
      if (actionItems.length > 0) {
        const users = await User.all()

        for (const item of actionItems) {
          const ownerName: string = (item.owner || '').trim().toLowerCase()
          let assignedTo: number | null = null

          if (ownerName && ownerName !== 'tbd' && ownerName !== 'unknown') {
            const matched = users.find((u) => {
              const uName = u.name.toLowerCase()
              return uName.includes(ownerName) || ownerName.includes(uName.split(' ')[0])
            })
            if (matched) assignedTo = matched.id
          }

          const priority = (['high', 'medium', 'low'].includes((item.priority || '').toLowerCase())
            ? item.priority.toLowerCase()
            : 'medium') as 'high' | 'medium' | 'low'

          await Task.create({
            title: item.task,
            meetingId: meeting.id,
            projectId: meeting.projectId,
            assignedTo,
            priority,
            status: 'pending',
            dueDate: parseDeadline(item.deadline),
          })
        }
      }

      return response.redirect(`/history/${meeting.id}`)
    } catch (err: any) {
      session.flash('error', `Analysis failed: ${err.message || 'Unknown error'}`)
      return response.redirect('back')
    }
  }
}
