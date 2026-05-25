declare module "@hugeicons/core-free-icons/*" {
  import type { ComponentType, SVGAttributes } from "react";

  interface HugeIconProps extends SVGAttributes<SVGElement> {
    size?: number;
    color?: string;
    strokeWidth?: number;
  }

  const Icon: ComponentType<HugeIconProps>;
  export default Icon;
}
