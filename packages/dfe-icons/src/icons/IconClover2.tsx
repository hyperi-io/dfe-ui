import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconClover2 = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-clover-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M11 11 7.603 7.56a2.104 2.104 0 0 1 0-2.95 2.04 2.04 0 0 1 2.912 0L11 5l.485-.39a2.04 2.04 0 0 1 2.912 0 2.104 2.104 0 0 1 0 2.95zM11 11l-3.397 3.44a2.104 2.104 0 0 0 0 2.95 2.04 2.04 0 0 0 2.912 0L11 17l.485.39a2.04 2.04 0 0 0 2.912 0 2.104 2.104 0 0 0 0-2.95zM14.44 7.603a2.104 2.104 0 0 1 2.95 0 2.04 2.04 0 0 1 0 2.912L17 11l.39.485a2.04 2.04 0 0 1 0 2.912 2.104 2.104 0 0 1-2.95 0M7.56 7.603a2.104 2.104 0 0 0-2.95 0 2.04 2.04 0 0 0 0 2.912L5 11l-.39.485a2.04 2.04 0 0 0 0 2.912 2.104 2.104 0 0 0 2.95 0M15 15l6 6" /></svg>;
const Memo = memo(IconClover2);
export default Memo;