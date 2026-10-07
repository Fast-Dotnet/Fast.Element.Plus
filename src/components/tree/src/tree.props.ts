import type { FilterValue, TreeNodeData } from "element-plus";

/** 树组件运行时节点公开使用的最小结构。 */
export interface TreeNode {
	key?: string | number | null;
	label: string;
	level: number;
	parent: TreeNode | null;
	expanded: boolean;
	isLeaf?: boolean;
	expand: () => void;
	collapse: () => void;
}

/** 树组件的数据集合。 */
export type TreeData = TreeNodeData[];
/** 树节点的唯一键类型 */
export type TreeKey = string | number;

/** 树节点的懒加载方法。 */
export type LoadFunction = (rootNode: TreeNode, loadedCallback: (data: TreeData) => void, stopLoading: () => void) => void;

/** 树节点字段映射配置 */
export interface TreeOptionProps {
	children?: string;
	label?: string | ((data: TreeNodeData, node: TreeNode) => string);
	disabled?: string | ((data: TreeNodeData, node: TreeNode) => boolean);
	isLeaf?: string | ((data: TreeNodeData, node: TreeNode) => boolean);
	class?: (data: TreeNodeData, node: TreeNode) => string | Record<string, boolean>;
}

/** 树节点筛选方法。 */
export type FilterNodeMethodFunction = (value: FilterValue, data: TreeNodeData, child: TreeNode) => boolean;

//  | "none"
/** 树节点拖放位置。 */
export type NodeDropType = "before" | "after" | "inner";
