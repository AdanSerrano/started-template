import type { TreeNode } from '../form-field.types'

export function getAllValues(nodes: TreeNode[]): string[] {
  const values: string[] = []
  const traverse = (node: TreeNode) => {
    values.push(node.value)
    node.children?.forEach(traverse)
  }
  nodes.forEach(traverse)
  return values
}

export function findNodeByValue(
  nodes: TreeNode[],
  value: string,
): TreeNode | null {
  for (const node of nodes) {
    if (node.value === value) return node
    if (node.children) {
      const found = findNodeByValue(node.children, value)
      if (found) return found
    }
  }
  return null
}

export function getNodePath(
  nodes: TreeNode[],
  value: string,
  path: string[] = [],
): string[] | null {
  for (const node of nodes) {
    if (node.value === value) return [...path, node.label]
    if (node.children) {
      const found = getNodePath(node.children, value, [...path, node.label])
      if (found) return found
    }
  }
  return null
}
