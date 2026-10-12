import type { HttpContext } from '@adonisjs/core/http'
import Meeting from '#models/meeting'
import GeminiService from '#services/gemini_service'

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
      })

      return response.redirect(`/history/${meeting.id}`)
    } catch (err: any) {
      session.flash('error', `Analysis failed: ${err.message || 'Unknown error'}`)
      return response.redirect('back')
    }
  }
}
