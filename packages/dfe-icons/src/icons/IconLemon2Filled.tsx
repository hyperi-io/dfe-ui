import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconLemon2Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-lemon-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M18 3a3 3 0 0 1 2.443 4.742l-.06.076.037.087c1.269 3.187.428 7.084-2.203 9.872L18 18c-2.8 2.8-6.823 3.723-10.095 2.42l-.087-.036-.133.098a3 3 0 0 1-2.11.488l-.205-.036a3 3 0 0 1-1.852-4.62l.098-.134-.036-.085c-1.269-3.187-.428-7.084 2.203-9.872L6 6c2.8-2.8 6.823-3.723 10.095-2.42l.085.037.124-.091a3 3 0 0 1 1.493-.52z" /></svg>;
const Memo = memo(IconLemon2Filled);
export default Memo;