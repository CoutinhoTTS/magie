import { ipcMain } from 'electron'
import * as local from './operation/local'
import * as model from './operation/model'
import * as page from './operation/page'
import * as project from './operation/project'

// Register all IPC handlers
export default function () {
  // Project handlers
  ipcMain.handle('get_projects', project.getProjects)
  ipcMain.handle('set_project_node', project.setProjectNode)

  // Page handlers
  ipcMain.handle('get_page_data', page.getPageData)

  // Model handlers
  ipcMain.handle('get_all_models', model.getAllModels)
  ipcMain.handle('set_model_value', model.setModelValue)

  // Local settings handlers
  ipcMain.handle('get_local_data', local.getLocalData)
  ipcMain.handle('set_local_data', local.setLocalData)
}
