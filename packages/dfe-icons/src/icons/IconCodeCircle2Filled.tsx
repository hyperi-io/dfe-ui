import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCodeCircle2Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-code-circle-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M17 3.34A10 10 0 1 1 2 12l.005-.324A10 10 0 0 1 17 3.34m-3.658 5.22a1 1 0 0 0-1.282.598l-2 5.5a1 1 0 0 0 1.88.684l2-5.5a1 1 0 0 0-.598-1.282M9.207 9.793a1 1 0 0 0-1.414 0l-1.5 1.5a1 1 0 0 0 0 1.414l1.5 1.5a1 1 0 0 0 1.414 0l.083-.094a1 1 0 0 0-.083-1.32L8.415 12l.792-.793a1 1 0 0 0 0-1.414m7 0a1 1 0 0 0-1.414 0l-.083.094a1 1 0 0 0 .083 1.32l.792.793-.792.793a1 1 0 0 0 1.414 1.414l1.5-1.5a1 1 0 0 0 0-1.414z" /></svg>;
const Memo = memo(IconCodeCircle2Filled);
export default Memo;