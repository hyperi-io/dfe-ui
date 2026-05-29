import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconCircleChevronRightFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-circle-chevron-right" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 2c5.523 0 10 4.477 10 10a10 10 0 0 1-20 0C2 6.477 6.477 2 12 2m-.293 6.293a1 1 0 0 0-1.414 0l-.083.094a1 1 0 0 0 .083 1.32L12.585 12l-2.292 2.293a1 1 0 0 0 1.414 1.414l3-3a1 1 0 0 0 0-1.414z" /></svg>;
const Memo = memo(IconCircleChevronRightFilled);
export default Memo;