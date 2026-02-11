import { ipcMain } from 'electron'
import * as message from './operation/message'
import * as session from './operation/session'
import * as cursor from './operation/cursor'
import * as snapshot from './operation/snapshot'

// Register all IPC handlers
export default function () {
  // Message handlers
  ipcMain.handle('chat_add_message', message.addMessage)
  ipcMain.handle('chat_get_messages_by_session', message.getMessagesBySession)

  // Session summary handlers
  ipcMain.handle('chat_save_session_summary', session.saveSessionSummary)
  ipcMain.handle('chat_get_session_summary', session.getSessionSummary)
  ipcMain.handle('chat_get_top_session_summary', session.getSessionList)

  // Summary cursor handlers
  ipcMain.handle('chat_update_cursor', cursor.updateCursor)
  ipcMain.handle('chat_get_cursor', cursor.getCursor)
  ipcMain.handle('chat_delete_cursor', cursor.deleteCursor)

  // Working memory snapshot handlers
  ipcMain.handle('chat_save_snapshot', snapshot.saveSnapshot)
  ipcMain.handle('chat_get_latest_snapshot', snapshot.getLatestSnapshot)
  ipcMain.handle('chat_get_snapshots', snapshot.getSnapshots)
  ipcMain.handle('chat_delete_snapshots', snapshot.deleteSnapshots)
}
