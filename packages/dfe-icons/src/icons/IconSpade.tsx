import * as React from "react";
import type { SVGProps } from "react";
import { memo } from "react";
interface SVGRProps {
  title?: string;
  titleId?: string;
}
const IconSpade = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} className="prefix__icon prefix__icon-tabler prefix__icons-tabler-outline prefix__icon-tabler-spade" viewBox="0 0 24 24" role="img" width="1em" height="1em" aria-labelledby={titleId} {...props}>{title ? <title id={titleId}>{title}</title> : null}<path stroke="none" d="M0 0h24v24H0z" /><path d="m12 3 4.919 4.5q.915.88 1.703 1.771a5.53 5.53 0 0 1 .264 6.979c-1.18 1.56-3.338 1.92-4.886.75v1l1 3H9l1-3v-1c-1.54 1.07-3.735.772-4.886-.75a5.53 5.53 0 0 1 .264-6.979A31 31 0 0 1 7.081 7.5 1542 1542 0 0 1 12 3" /></svg>;
const Memo = memo(IconSpade);
export default Memo;