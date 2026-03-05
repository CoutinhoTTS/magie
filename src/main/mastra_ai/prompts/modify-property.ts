/**
 * 构建修改组件属性的 prompt
 */
export function buildModifyPrompt(message: string, targetProperty: { path: string, currentValue: any, type: string, action: string }): string {
  return `你是一个页面设计助手。用户想要修改选中的组件属性。

目标属性信息:
- 路径: ${targetProperty.path}
- 当前值: ${targetProperty.currentValue}
- 类型: ${targetProperty.type}
- 操作: ${targetProperty.action}

用户需求: ${message}

请分析用户需求，返回需要修改的属性列表。

要求：
1. 返回内容必须使用 Markdown 代码块格式包裹
2. prop 路径格式规则：
   - 普通嵌套属性使用点号：如 "props.style.color"
   - 数组索引必须使用方括号：如 "props.cardTab[0].label"、"props.items[1].name"
   - 禁止使用 "props.cardTab.0.label" 或 "props.cardTab0.label" 这种格式
3. oldValue 是当前值
4. newValue 是修改后的值（根据用户需求推断）
5. reason 简要说明修改原因
6. 如果信息不全或无法确定修改内容，设置 status 为 "incomplete" 并在 missingInfo 中说明缺少的信息

返回格式示例：
\`\`\`json
{
  "status": "success",
  "changes": [
    { "prop": "props.label", "oldValue": "按钮", "newValue": "提交", "reason": "修改按钮文本" },
    { "prop": "props.cardTab[0].label", "oldValue": "Tab1", "newValue": "代办件", "reason": "修改第一个tab标题" }
  ],
  "summary": "修改摘要说明",
  "missingInfo": ""
}
\`\`\`
`
}
