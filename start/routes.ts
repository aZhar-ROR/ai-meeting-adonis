/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

const MeetingsController = () => import('#controllers/meetings_controller')
const UsersController = () => import('#controllers/users_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const TasksController = () => import('#controllers/tasks_controller')

router.get('/', [MeetingsController, 'index'])
router.get('/history', [MeetingsController, 'history'])
router.get('/history/:id', [MeetingsController, 'show'])
router.post('/analyze', [MeetingsController, 'analyze'])

// Users
router.get('/users', [UsersController, 'index'])
router.get('/users/create', [UsersController, 'create'])
router.post('/users', [UsersController, 'store'])
router.delete('/users/:id', [UsersController, 'destroy'])

// Projects
router.get('/projects', [ProjectsController, 'index'])
router.get('/projects/create', [ProjectsController, 'create'])
router.post('/projects', [ProjectsController, 'store'])
router.get('/projects/:id', [ProjectsController, 'show'])
router.delete('/projects/:id', [ProjectsController, 'destroy'])
router.post('/projects/:id/members', [ProjectsController, 'addMember'])
router.delete('/projects/:id/members/:userId', [ProjectsController, 'removeMember'])
router.post('/projects/:id/statuses', [ProjectsController, 'addStatus'])
router.delete('/projects/:id/statuses/:statusId', [ProjectsController, 'removeStatus'])

// Tasks
router.get('/tasks', [TasksController, 'index'])
router.get('/tasks/create', [TasksController, 'create'])
router.post('/tasks', [TasksController, 'store'])
router.get('/tasks/:id', [TasksController, 'show'])
router.patch('/tasks/:id', [TasksController, 'update'])
router.delete('/tasks/:id', [TasksController, 'destroy'])
