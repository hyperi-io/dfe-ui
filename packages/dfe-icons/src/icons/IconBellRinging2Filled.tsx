import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconBellRinging2Filled = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="prefix__icon prefix__icon-tabler prefix__icons-tabler-filled prefix__icon-tabler-bell-ringing-2" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path fill="none" d="M0 0h24v24H0z" /><path d="M9.63 17.531c.612.611.211 1.658-.652 1.706a4 4 0 0 1-3.05-1.166 4 4 0 0 1-1.165-3.049c.046-.826 1.005-1.228 1.624-.726l.082.074zM20.071 3.929c.96.96 1.134 2.41.52 3.547l-.09.153-.024.036a8.01 8.01 0 0 1-1.446 7.137l-.183.223-.191.218-2.073 2.072-.08.112a3 3 0 0 0-.499 2.113l.035.201.045.185c.264.952-.853 1.645-1.585 1.051l-.086-.078L3.101 9.586c-.727-.727-.017-1.945.973-1.671a3 3 0 0 0 2.5-.418l.116-.086 2.101-2.1a8 8 0 0 1 7.265-1.86l.278.071.037-.023a3 3 0 0 1 3.432.192l.14.117.128.12z" /></svg>;
const Memo = memo(IconBellRinging2Filled);
export default Memo;