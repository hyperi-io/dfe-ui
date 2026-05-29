import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCodeCircleFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-code-circle" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34m-6.293 5.953a1 1 0 0 0-1.414 0l-2 2a1 1 0 0 0 0 1.414l2 2a1 1 0 0 0 1.414 0l.083-.094a1 1 0 0 0-.083-1.32L9.415 12l1.292-1.293a1 1 0 0 0 0-1.414m4 0a1 1 0 0 0-1.414 0l-.083.094a1 1 0 0 0 .083 1.32L14.585 12l-1.292 1.293a1 1 0 0 0 1.414 1.414l2-2a1 1 0 0 0 0-1.414z" /></svg>;
const Memo = memo(IconCodeCircleFilled);
export default Memo;