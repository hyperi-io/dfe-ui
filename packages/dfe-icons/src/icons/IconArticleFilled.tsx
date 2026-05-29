import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconArticleFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-article" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M19 3a3 3 0 0 1 2.995 2.824L22 6v12a3 3 0 0 1-2.824 2.995L19 21H5a3 3 0 0 1-2.995-2.824L2 18V6a3 3 0 0 1 2.824-2.995L5 3zm-2 12H7l-.117.007a1 1 0 0 0 0 1.986L7 17h10l.117-.007a1 1 0 0 0 0-1.986zm0-4H7l-.117.007a1 1 0 0 0 0 1.986L7 13h10l.117-.007a1 1 0 0 0 0-1.986zm0-4H7l-.117.007a1 1 0 0 0 0 1.986L7 9h10l.117-.007a1 1 0 0 0 0-1.986z" /></svg>;
const Memo = memo(IconArticleFilled);
export default Memo;