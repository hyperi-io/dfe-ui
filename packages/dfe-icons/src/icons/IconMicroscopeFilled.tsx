import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconMicroscopeFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-microscope" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="m15.707 4.293 3 3a1 1 0 0 1 0 1.414l-1.553 1.555a7 7 0 0 1-.256 9.74L19 20a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 0-2h2a1 1 0 0 1 0 2v1h4a5 5 0 0 0 3.737-8.323l-3.03 3.03a1 1 0 0 1-1.414 0l-.793-.792-.793.792a1 1 0 1 1-1.414-1.414l.792-.793-.792-.793a1 1 0 0 1 0-1.414l6-6a1 1 0 0 1 1.414 0m2-2 3 3a1 1 0 1 1-1.414 1.414l-3-3a1 1 0 1 1 1.414-1.414" /></svg>;
const Memo = memo(IconMicroscopeFilled);
export default Memo;