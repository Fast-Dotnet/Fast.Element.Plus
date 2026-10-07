import { withInstall } from "../../utils";
import CarNumber from "./src/carNumber";
import type { TSXWithInstall } from "../../utils";

/** 中国大陆机动车号牌输入组件。 */
export const FaCarNumber: TSXWithInstall<typeof CarNumber> = withInstall(CarNumber);
export default FaCarNumber;

export * from "./src/common";

/** FaCarNumber 暴露的组件实例类型 */
export type FaCarNumberInstance = InstanceType<typeof CarNumber>;
