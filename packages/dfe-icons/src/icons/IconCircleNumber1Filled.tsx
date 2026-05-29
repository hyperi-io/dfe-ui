import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleNumber1Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-circle-number-1" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2m.994 5.886c-.083-.777-1.008-1.16-1.617-.67l-.084.077-2 2-.083.094a1 1 0 0 0 0 1.226l.083.094.094.083a1 1 0 0 0 1.226 0l.094-.083.293-.293V16l.007.117a1 1 0 0 0 1.986 0L13 16V8z" /></svg>;
const Memo = memo(IconCircleNumber1Filled);
export default Memo;