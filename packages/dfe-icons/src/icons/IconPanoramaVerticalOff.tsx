import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconPanoramaVerticalOff = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-panorama-vertical-off" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M7 3h10.53c.693 0 1.18.691.935 1.338q-1.647 4.347-1.425 8.692m.828 4.847q.258.888.595 1.778A1 1 0 0 1 17.529 21h-11c-.692 0-1.208-.692-.962-1.34q2.545-6.73.619-13.46M3 3l18 18" /></svg>;
const Memo = memo(IconPanoramaVerticalOff);
export default Memo;