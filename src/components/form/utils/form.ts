import { RegExps } from "../../../constants";
import type { FormInstance, FormItemRule, FormValidationResult } from "element-plus";
import type { Ref } from "vue";

type ValidationCallback = (error?: Error) => void;

/**
 * 表单工具类
 */
export const formUtil = {
	/**
	 * ElForm 表单验证
	 * @param elFormRef - ElForm 组件ref
	 */
	validate(elFormRef: Readonly<Ref<FormInstance | null | undefined>>): FormValidationResult {
		return new Promise<boolean>((resolve, reject) => {
			const form = elFormRef.value;
			if (form == null) {
				reject(new Error("ElForm 实例尚未挂载。"));
				return;
			}
			form.validate((isValid: boolean, invalidFields?) => {
				if (isValid) {
					resolve(isValid);
				} else {
					// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- 保持 Element Plus 校验失败时返回字段错误对象的合同
					reject(invalidFields);
				}
			});
		});
	},
	/**
	 * ElForm 表单验证，带滚动
	 * @param elFormRef - ElForm 组件ref
	 */
	validateScrollToField(elFormRef: Readonly<Ref<FormInstance | null | undefined>>): FormValidationResult {
		return new Promise<boolean>((resolve, reject) => {
			const form = elFormRef.value;
			if (form == null) {
				reject(new Error("ElForm 实例尚未挂载。"));
				return;
			}
			form.validate((isValid: boolean, invalidFields?) => {
				if (isValid) {
					resolve(isValid);
				} else {
					form.scrollToField(Object.keys(invalidFields ?? {}));
					// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors -- 保持 Element Plus 校验失败时返回字段错误对象的合同
					reject(invalidFields);
				}
			});
		});
	},
	/**
	 * 手机号
	 */
	mobile(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (!value) {
			callback(new Error("请输入手机号码"));
		} else if (RegExps.Mobile.test(value)) {
			callback();
		} else {
			callback(new Error("请输入正确的手机号码"));
		}
	},
	/**
	 * 电话号码
	 */
	phone(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (!value) {
			callback();
		} else if (RegExps.Phone.test(value)) {
			callback();
		} else {
			callback(new Error("请输入正确的电话号码"));
		}
	},
	/**
	 * 邮箱
	 */
	email(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (!value) {
			callback();
		} else if (RegExps.Email.test(value)) {
			callback();
		} else {
			callback(new Error("请输入正确的邮箱地址"));
		}
	},
	/**
	 * 身份证
	 */
	idCard(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.IdCard.test(value) || !value) {
			callback();
		} else {
			callback(new Error("请输入正确的身份证号码"));
		}
	},
	/**
	 * 车牌号
	 */
	carNumber(_rule: FormItemRule, value: string | null | undefined, callback: ValidationCallback): void {
		let success = false;
		if (value?.length === 7) {
			success = RegExps.CarNumber.test(value);
		} else if (value?.length === 8) {
			success = RegExps.NewEnergyCarNumber.test(value);
		}
		if (success) {
			callback();
		} else {
			callback(new Error("请输入正确的车牌号码"));
		}
	},
	/**
	 * editor 必填
	 */
	editorRequired(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (value === "<p><br></p>") {
			callback(new Error("内容不能为空"));
		} else {
			callback();
		}
	},
	/**
	 * 外部链接
	 */
	external(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.External.test(value)) {
			callback();
		} else {
			callback(new Error("请输入正确的外部链接"));
		}
	},
	/**
	 * 有效的URL
	 */
	url(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.Url.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的 URL。"));
		}
	},
	/**
	 * 邮政编码
	 */
	postCode(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.PostCode.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的邮政编码"));
		}
	},
	/**
	 * 账号（6-20位字母或数字，必须以字母开头，不能全为数字）
	 */
	account(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.Account.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的账号（6-20位字母或数字，必须以字母开头，不能全为数字）"));
		}
	},
	/**
	 * 弱密码（只包含字母和数字，长度为6到18位）
	 */
	password(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.Password.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的密码（只包含字母和数字，长度为6到18位）"));
		}
	},
	/**
	 * 强密码（8到20位，包含大小写字母、数字及特殊字符）
	 */
	strongPassword(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.StrongPassword.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的密码（8到20位，包含大小写字母、数字及特殊字符）"));
		}
	},
	/**
	 * 中文字符
	 */
	chinese(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.Chinese.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的中文字符"));
		}
	},
	/**
	 * 英文字符
	 */
	english(_rule: FormItemRule, value: string, callback: ValidationCallback): void {
		if (RegExps.English.test(value)) {
			callback();
		} else {
			callback(new Error("请输入有效的英文字符"));
		}
	},
	/**
	 * 文本框必填
	 */
	inputRequired(message: string, trigger = "blur"): FormItemRule {
		return {
			required: true,
			message,
			trigger,
		};
	},
	/**
	 * 选择器必选
	 */
	selectRequired(message: string, trigger = "change"): FormItemRule {
		return {
			required: true,
			message,
			trigger,
		};
	},
};
