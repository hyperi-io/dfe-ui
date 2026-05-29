import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconHexagonFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-hexagon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M10.425 1.414 3.65 5.41A3.21 3.21 0 0 0 2 8.217v7.285a3.23 3.23 0 0 0 1.678 2.826l6.695 4.237c1.034.57 2.22.57 3.2.032l6.804-4.302c.98-.537 1.623-1.618 1.623-2.793V8.218l-.005-.204a3.22 3.22 0 0 0-1.284-2.39l-.107-.075-.007-.007a1 1 0 0 0-.181-.133L13.64 1.414a3.33 3.33 0 0 0-3.216 0z" /></svg>;
const Memo = memo(IconHexagonFilled);
export default Memo;