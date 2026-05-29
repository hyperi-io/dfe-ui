import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconFolderOpenFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-folder-open" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path fill="#000" d="M2 6a3 3 0 0 1 3-3h4l.099.005a1 1 0 0 1 .608.288L12.414 6H19a3 3 0 0 1 2.828 2H7.305a2.005 2.005 0 0 0-1.814 1.157l-.058.141-1.379 3.676a1 1 0 1 0 1.873.702l1.134-3.027A1 1 0 0 1 7.998 10H21l.217.012a2 2 0 0 1 .783.256 2.015 2.015 0 0 1 .928 1.201c.077.28.092.573.045.859l-.005.024-.995 5.21a2.999 2.999 0 0 1-2.686 2.426l-.261.012H5a3 3 0 0 1-3-3z" /></svg>;
const Memo = memo(IconFolderOpenFilled);
export default Memo;