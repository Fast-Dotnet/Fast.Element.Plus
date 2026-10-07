/** FaTable 统一分页返回结果 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 默认分页行字段由业务接口定义。
export interface PagedResult<Output = Record<string, any>> {
	/**
	 * 当前页
	 */
	pageIndex?: number;
	/**
	 * 当前页码
	 */
	pageSize?: number;
	/**
	 * 总页数
	 */
	totalPage?: number;
	/**
	 * 总条数
	 */
	totalRows?: number;
	/**
	 * Data
	 */
	rows?: Output[];
	/**
	 * 是否有上一页
	 */
	hasPrevPages?: boolean;
	/**
	 * 是否有下一页
	 */
	hasNextPages?: boolean;
	/**
	 * 程序集名称
	 */
	assemblyName?: string;
	/**
	 * 完全限定名称
	 */
	fullName?: string;
}

/** FaTable 分页搜索运算符。 */
export enum PagedSearchTypeEnum {
	/**
	 * 模糊匹配
	 */
	Like = 1,
	/**
	 * 等于
	 */
	Equal = 2,
	/**
	 * 不等于
	 */
	NotEqual = 3,
	/**
	 * 大于
	 */
	GreaterThan = 4,
	/**
	 * 大于等于
	 */
	GreaterThanOrEqual = 5,
	/**
	 * 小于
	 */
	LessThan = 6,
	/**
	 * 小于等于
	 */
	LessThanOrEqual = 7,
	/**
	 * 包含
	 */
	Include = 8,
	/**
	 * 排除
	 */
	NotInclude = 9,
}

/** FaTable 单个分页搜索条件。 */
export interface PagedSearchInput {
	/**
	 * 搜索字段英文
	 */
	enField?: string;
	/**
	 * 搜索字段中文
	 */
	cnField?: string;
	/**
	 * 搜索值
	 */
	value?: string;
	/**
	 * 搜索类型
	 */
	type?: PagedSearchTypeEnum;
}

/** FaTable 单个分页排序条件。 */
export interface PagedSortInput {
	/**
	 * 排序字段英文
	 */
	enField?: string;
	/**
	 * 排序字段中文
	 */
	cnField?: string;
	/**
	 * 排序方法
	 * 'ascending' | 'descending'
	 */
	mode?: string;
}

/** FaTable 分页、搜索和排序请求参数 */
export interface PagedInput {
	/**
	 * 当前页面索引值，默认为1
	 */
	pageIndex?: number;
	/**
	 * 页码容量
	 */
	pageSize?: number;
	/**
	 * 搜索值
	 */
	searchValue?: string;
	/**
	 * 搜索时间
	 */
	searchTimeList?: (Date | string)[];
	/**
	 * 搜索集合
	 */
	searchList?: PagedSearchInput[];
	/**
	 * 排序集合
	 */
	sortList?: PagedSortInput[];
	/**
	 * 启用分页
	 * @defaultValue true
	 */
	enablePaged?: boolean;
	/** 业务接口附加的查询字段。 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- 分页查询允许携带业务接口定义的扩展字段。
	[key: string]: any;
}
