import { Fragment, computed, defineComponent, inject, reactive, shallowRef, useModel } from "vue";
import { Back } from "@element-plus/icons-vue";
import { ElButton, ElInput, ElMessage, ElPopover, formContextKey, formItemContextKey, inputProps } from "element-plus";
import { RegExps } from "../../../constants";
import { definePropType, useExpose, useProps, useRender } from "../../../utils";
import { CarNumberArea, CarNumberDigit, CarNumberLetter } from "./common";
import type { InputInstance, PopoverInstance } from "element-plus";

export default defineComponent({
	name: "FaCarNumber",
	props: {
		// eslint-disable-next-line @typescript-eslint/no-deprecated -- Element Plus 2.x 尚未提供可替代的公开运行时 props 定义。
		...inputProps,
		/** value conversion function */
		parser: {
			// eslint-disable-next-line @typescript-eslint/no-deprecated -- 保留 Element Plus 2.x parser 的运行时约束。
			...inputProps.parser,
			type: definePropType<(value: string) => string>(Function),
		},
		/** v-model 绑定值 */
		modelValue: {
			type: definePropType<string | null>(String),
			default: undefined,
		},
		/** placeholder */
		placeholder: {
			type: String,
			default: "请选择",
		},
	},
	emits: {
		/** v-model 回调 */
		"update:modelValue": (value: string | null) => typeof value === "string" || value === null,
		/** 改变 */
		change: (value: string | null) => typeof value === "string" || value === null,
	},
	setup(props, { emit, expose }) {
		const modelValue = useModel(props, "modelValue");

		const inputRef = shallowRef<InputInstance | null>(null);
		const popoverRef = shallowRef<PopoverInstance | null>(null);
		// 获取 el-form 组件上下文
		const formContext = inject(formContextKey, undefined);
		// 获取 el-form-item 组件上下文
		const formItemContext = inject(formItemContextKey, undefined);

		const state = reactive({
			switchLetter: computed(() => {
				if ((modelValue.value?.length ?? 0) >= 1) {
					return true;
				}
				return false;
			}),
			disabledButton: computed(() => {
				if ((modelValue.value?.length ?? 0) >= 8) {
					return true;
				}
				return false;
			}),
		});

		const handleInputFormatter = (value: string) => {
			if (value.length === 2) {
				return `${value} ● `;
			} else if (value.length > 2) {
				return `${value.slice(0, 2)} ● ${value.slice(2)}`;
			} else {
				return value;
			}
		};

		const handleSelectCarNumber = (value: string) => {
			modelValue.value ??= "";
			modelValue.value += value;
		};

		const handleBackClick = () => {
			const value = modelValue.value ?? "";
			if (value.length === 0) return;
			modelValue.value = value.substring(0, value.length - 1);
		};

		const handleConfirmClick = () => {
			let success = false;
			const value = modelValue.value ?? "";
			if (value.length === 7) {
				success = RegExps.CarNumber.test(value);
			} else if (value.length === 8) {
				success = RegExps.NewEnergyCarNumber.test(value);
			}
			if (success) {
				emit("change", value);
				// 调用 el-form 内部的校验方法（可自动校验）
				if (formItemContext?.prop) formContext?.validateField([formItemContext.prop]);
			} else {
				if (formItemContext?.prop && formContext) {
					emit("change", value);
					// 调用 el-form 内部的校验方法（可自动校验）
					formContext.validateField([formItemContext.prop]);
				} else {
					ElMessage.error("车牌号格式不正确");
				}
			}
			popoverRef.value?.hide();
		};

		const handleClearClick = () => {
			modelValue.value = null;
			emit("change", null);
			// 调用 el-form 内部的校验方法（可自动校验）
			if (formItemContext?.prop) formContext?.validateField([formItemContext.prop]);
		};

		// eslint-disable-next-line @typescript-eslint/no-deprecated -- 透传范围必须与继承的 Element Plus 2.x 运行时 props 保持一致。
		const elInputProps = useProps(props, inputProps, ["modelValue", "readonly", "formatter"]);

		useRender(() => (
			<ElPopover
				ref={popoverRef}
				width="auto"
				popperClass="fa-car-number__popover"
				trigger="click"
				showArrow={false}
				showAfter={0}
				hideAfter={0}
			>
				{{
					reference: () => (
						<ElInput
							{...elInputProps.value}
							ref={inputRef}
							class="fa-car-number__input"
							vModel={modelValue.value}
							readonly
							formatter={handleInputFormatter}
						/>
					),
					default: () => (
						<Fragment>
							<div class={["fa-car-number__popover__area", state.switchLetter ? "fa-car-number__popover__hide" : ""]}>
								{CarNumberArea.map((area) => (
									<ElButton disabled={state.disabledButton} onClick={() => handleSelectCarNumber(area)}>
										{area}
									</ElButton>
								))}
							</div>
							<div class={["fa-car-number__popover__digit-letter", state.switchLetter ? "" : "fa-car-number__popover__hide"]}>
								{CarNumberDigit.map((digit) => (
									<ElButton disabled={state.disabledButton} onClick={() => handleSelectCarNumber(digit)}>
										{digit}
									</ElButton>
								))}
								{CarNumberLetter.map((letter) => (
									<ElButton disabled={state.disabledButton} onClick={() => handleSelectCarNumber(letter)}>
										{letter}
									</ElButton>
								))}
							</div>
							<div class="fa-car-number__popover__btn">
								<ElButton class="fa-car-number__popover__btn__clear" disabled={!modelValue.value} onClick={handleClearClick}>
									清除
								</ElButton>
								<ElButton
									class="fa-car-number__popover__btn__back"
									type="danger"
									icon={Back}
									disabled={!modelValue.value}
									onClick={handleBackClick}
								/>
								<ElButton
									class="fa-car-number__popover__btn__confirm"
									type="primary"
									disabled={!modelValue.value || modelValue.value.length < 7}
									onClick={handleConfirmClick}
								>
									确认
								</ElButton>
							</div>
						</Fragment>
					),
				}}
			</ElPopover>
		));

		return useExpose(expose, {
			/** 聚焦车牌输入框 */
			focus: computed(() => inputRef.value?.focus),
			/** 取消输入框焦点 */
			blur: computed(() => inputRef.value?.blur),
			/** 选中输入框中的文本 */
			select: computed(() => inputRef.value?.select),
			/** 清空车牌号并更新模型 */
			clear: handleClearClick,
			/** 重新计算多行输入框的高度 */
			resizeTextarea: computed(() => inputRef.value?.resizeTextarea),
		});
	},
});
