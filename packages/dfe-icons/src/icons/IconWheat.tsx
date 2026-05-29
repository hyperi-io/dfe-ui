import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconWheat = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-wheat" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="M12.014 21.514v-3.75M5.93 9.504l-.43 1.604a4.986 4.986 0 0 0 3.524 6.105q1.495.402 2.99.801v-3.44a4.98 4.98 0 0 0-3.676-4.426z" /><path d="M13.744 11.164a4.9 4.9 0 0 0 1.433-3.46 4.88 4.88 0 0 0-1.433-3.46l-1.73-1.73-1.73 1.73a4.912 4.912 0 0 0-1.433 3.46 4.9 4.9 0 0 0 1.433 3.46" /><path d="m18.099 9.504.43 1.604a4.986 4.986 0 0 1-3.525 6.105l-2.99.801v-3.44a4.98 4.98 0 0 1 3.677-4.426z" /></svg>;
const Memo = memo(IconWheat);
export default Memo;