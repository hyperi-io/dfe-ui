import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconTimelineEventFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-timeline-event" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M12 17c1.306 0 2.418.835 2.83 2H20a1 1 0 0 1 0 2h-5.171a3.001 3.001 0 0 1-5.658 0H4a1 1 0 0 1 0-2h5.17A3 3 0 0 1 12 17M17 2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.586l-1.707 1.707a1 1 0 0 1-1.32.083l-.094-.083L9.585 14H7a2 2 0 0 1-1.995-1.85L5 12V4a2 2 0 0 1 2-2z" /></svg>;
const Memo = memo(IconTimelineEventFilled);
export default Memo;