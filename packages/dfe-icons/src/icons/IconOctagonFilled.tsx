import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconOctagonFilled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-octagon" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M15.3 2H8.7c-.562 0-1.016.201-1.407.593l-4.7 4.7A1.9 1.9 0 0 0 2 8.7v6.6c0 .562.201 1.016.593 1.407l4.7 4.7c.391.392.845.593 1.407.593h6.6c.562 0 1.016-.201 1.407-.593l4.7-4.7c.392-.391.593-.845.593-1.407V8.7c0-.562-.201-1.016-.593-1.407l-4.7-4.7A1.9 1.9 0 0 0 15.3 2" /></svg>;
const Memo = memo(IconOctagonFilled);
export default Memo;